import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  IWikipediaPage,
  IWikipediaResponse,
  IWikipediaSearchResult,
  IWikipediaSearchStrategy,
  IWikipediaSummary,
} from '../models/wiki.model';
import { concatMap, defaultIfEmpty, filter, from, map, Observable, of, take, tap } from 'rxjs';
import {
  AstronomicalCatalog,
  AstronomicalObjectType,
  IAstronomicalObject,
} from '../models/astronomical-object.model';
import {
  containsAny,
  countMatches,
  equalsNormalized,
  getIntroduction,
  hasAstronomyCategory,
  hasForbiddenCategory,
  isDisambiguation,
  normalize,
} from '../helpers/wiki.helper';
import {
  MINIMUM_ACCEPTED_SCORE,
  SCORE,
  ASTRONOMY_KEYWORDS,
  FORBIDDEN_WORDS,
} from '../constants/wiki.constant';

@Injectable({
  providedIn: 'root',
})
export class WikipediaService {
  private readonly apiUrl = 'https://fr.wikipedia.org/w/api.php';
  private readonly http = inject(HttpClient);

  private readonly cache = new Map<string, IWikipediaSummary | null>();

  public searchSummary(object: IAstronomicalObject): Observable<IWikipediaSummary | null> {
    const cachedSummary = this.cache.get(object.target);

    if (cachedSummary !== undefined) {
      return of(cachedSummary);
    }

    const strategies = this.buildSearchStrategies(object);

    return from(strategies).pipe(
      concatMap((strategy) => this.search(strategy.term, object)),
      filter((summary): summary is IWikipediaSummary => summary !== null),
      take(1),
      defaultIfEmpty(null),
      tap((summary) => this.cache.set(object.target, summary)),
    );
  }

  private search(term: string, object: IAstronomicalObject): Observable<IWikipediaSummary | null> {
    return this.http
      .get<IWikipediaResponse>(this.apiUrl, {
        params: {
          action: 'query',
          generator: 'search',
          gsrsearch: term,

          prop: 'extracts|info|pageimages|categories',

          exintro: true,
          explaintext: true,

          inprop: 'url',

          piprop: 'thumbnail',
          pithumbsize: '500',

          cllimit: '20',

          format: 'json',
          origin: '*',
        },
      })
      .pipe(
        map((response) => {
          const pages = Object.values(response.query?.pages ?? {});

          if (pages.length === 0) {
            return null;
          }

          const bestPage = this.findBestPage(pages, object);

          if (!bestPage) {
            return null;
          }

          return this.mapSummary(bestPage.page);
        }),
      );
  }

  private buildSearchStrategies(object: IAstronomicalObject): IWikipediaSearchStrategy[] {
    const strategies: IWikipediaSearchStrategy[] = [
      {
        name: 'englishName',
        priority: 1,
        term: object.englishName,
      },
      {
        name: 'frenchName',
        priority: 2,
        term: object.name,
      },
      ...this.getTypeSearchTerms(object),
    ];

    switch (object.catalog) {
      case AstronomicalCatalog.Messier:
        strategies.push({
          name: 'catalog',
          priority: 20,
          term: `Messier ${object.target.replace(/^M/i, '')}`,
        });

        break;

      case AstronomicalCatalog.NGC:
        strategies.push({
          name: 'catalog',
          priority: 20,
          term: object.target,
        });

        break;

      case AstronomicalCatalog.Caldwell:
        strategies.push({
          name: 'catalog',
          priority: 20,
          term: object.target,
        });

        break;

      case AstronomicalCatalog.Hipparcos:
        strategies.push({
          name: 'catalog',
          priority: 20,
          term: object.target,
        });

        break;
    }

    object.searchTerms.forEach((term, index) => {
      strategies.push({
        name: 'alias',
        priority: 100 + index,
        term,
      });
    });

    strategies.sort((a, b) => a.priority - b.priority);

    const uniqueStrategies = new Map<string, IWikipediaSearchStrategy>();

    for (const strategy of strategies) {
      const normalizedTerm = normalize(strategy.term);

      if (!uniqueStrategies.has(normalizedTerm)) {
        uniqueStrategies.set(normalizedTerm, strategy);
      }
    }

    return [...uniqueStrategies.values()];
  }

  private findBestPage(
    pages: IWikipediaPage[],
    object: IAstronomicalObject,
  ): IWikipediaSearchResult | null {
    let bestResult: IWikipediaSearchResult | null = null;
    console.log('-------------------', pages, '-------------------');

    for (const page of pages) {
      const score = this.calculateScore(page, object);

      if (!bestResult || score > bestResult.score) {
        bestResult = {
          page,
          score,
        };
        console.log('=================', page.title, score, bestResult, '=================');
      }
    }

    if (!bestResult || bestResult.score < MINIMUM_ACCEPTED_SCORE) {
      return null;
    }

    return bestResult;
  }

  private calculateScore(page: IWikipediaPage, object: IAstronomicalObject): number {
    if (!page.extract) {
      return Number.NEGATIVE_INFINITY;
    }

    if (isDisambiguation(page)) {
      return Number.NEGATIVE_INFINITY;
    }

    if (page.length < 200) {
      return Number.NEGATIVE_INFINITY;
    }

    const title = normalize(page.title);
    const introduction = getIntroduction(page.extract);

    let score = 0;

    const englishName = normalize(object.englishName);
    const frenchName = normalize(object.name);

    // ---------- Exact title ----------

    if (equalsNormalized(title, englishName)) {
      score += SCORE.EXACT_ENGLISH_TITLE;
    }

    if (equalsNormalized(title, frenchName)) {
      score += SCORE.EXACT_FRENCH_TITLE;
    }

    // ---------- Partial title ----------

    if (title.includes(englishName)) {
      score += SCORE.ENGLISH_TITLE;
    }

    if (title.includes(frenchName)) {
      score += SCORE.FRENCH_TITLE;
    }

    // ---------- Search aliases ----------

    for (const alias of object.searchTerms) {
      const normalizedAlias = normalize(alias);

      if (equalsNormalized(title, normalizedAlias)) {
        score += SCORE.EXACT_SEARCH_TERM;
      } else if (title.includes(normalizedAlias)) {
        score += SCORE.SEARCH_TERM;
      }

      if (introduction.includes(normalizedAlias)) {
        score += SCORE.SEARCH_TERM_EXTRACT;
      }
    }

    // ---------- Introduction ----------

    if (introduction.includes(englishName)) {
      score += SCORE.ENGLISH_EXTRACT;
    }

    if (introduction.includes(frenchName)) {
      score += SCORE.FRENCH_EXTRACT;
    }

    score += countMatches(introduction, ASTRONOMY_KEYWORDS) * SCORE.ASTRONOMY_KEYWORD;

    // ---------- Categories ----------

    if (hasAstronomyCategory(page)) {
      score += SCORE.ASTRONOMY_CATEGORY;
    }

    if (hasForbiddenCategory(page)) {
      score += SCORE.FORBIDDEN_CATEGORY;
    }

    // ---------- Forbidden words ----------

    if (containsAny(introduction, FORBIDDEN_WORDS)) {
      score += SCORE.FORBIDDEN_WORD;
    }

    return score;
  }

  private mapSummary(page: IWikipediaPage): IWikipediaSummary {
    return {
      title: page.title,
      extract: page.extract ?? '',
      pageUrl: page.fullurl ?? '',
      thumbnailUrl: page.thumbnail?.source,
    };
  }

  private getTypeSearchTerms(object: IAstronomicalObject): IWikipediaSearchStrategy[] {
    const typeTerms: Record<AstronomicalObjectType, string[]> = {
      [AstronomicalObjectType.Star]: ['star', 'étoile'],

      [AstronomicalObjectType.Galaxy]: ['galaxy', 'galaxie'],

      [AstronomicalObjectType.Nebula]: ['nebula', 'nébuleuse'],

      [AstronomicalObjectType.PlanetaryNebula]: ['planetary nebula', 'nébuleuse planétaire'],

      [AstronomicalObjectType.OpenCluster]: ['open cluster', 'amas ouvert'],

      [AstronomicalObjectType.GlobularCluster]: ['globular cluster', 'amas globulaire'],

      [AstronomicalObjectType.SupernovaRemnant]: ['supernova remnant', 'rémanent de supernova'],

      [AstronomicalObjectType.Planet]: ['planet', 'planète'],

      [AstronomicalObjectType.Asterism]: ['asterism', 'astérisme'],
    };

    const terms = typeTerms[object.type] ?? [];

    return terms.map((suffix, index) => ({
      name: 'type',
      priority: 10 + index,
      term: `${object.englishName} ${suffix}`,
    }));
  }
}
