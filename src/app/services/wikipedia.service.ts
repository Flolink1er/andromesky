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
    if (object !== undefined) {
      const cachedSummary = this.cache.get(object.target);
      if (cachedSummary !== undefined) {
        return of(cachedSummary);
      }
    } else {
      return of(null);
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

      case AstronomicalCatalog.BrightStar:
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

    for (const page of pages) {
      if (!this.hasStrongIdentityMatch(page, object) || this.isGenericCatalogArticle(page, object)) {
        continue;
      }

      const score = this.calculateScore(page, object);

      if (!bestResult || score > bestResult.score) {
        bestResult = {
          page,
          score,
        };
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

  /**
   * Une catégorie « galaxie » ou « astronomie » prouve uniquement que la page
   * parle d'astronomie, pas qu'elle décrit l'objet actuellement sélectionné.
   * On exige donc qu'un nom ou un identifiant propre à l'objet apparaisse dans
   * le titre de la page avant de l'afficher.
   */
  private hasStrongIdentityMatch(page: IWikipediaPage, object: IAstronomicalObject): boolean {
    const title = normalize(page.title);

    return this.getIdentityTerms(object).some((term) => this.titleMatchesIdentity(title, term));
  }

  /**
   * Rejette les pages générales de catalogue, par exemple « Catalogue Messier »
   * pour M2. Elles sont souvent bien classées par l'API mais ne décrivent pas
   * l'objet individuel demandé.
   */
  private isGenericCatalogArticle(page: IWikipediaPage, object: IAstronomicalObject): boolean {
    const title = normalize(page.title);

    const genericTitlesByCatalog: Partial<Record<AstronomicalCatalog, string[]>> = {
      [AstronomicalCatalog.Messier]: [
        'catalogue messier',
        'catalogue de messier',
        'messier catalogue',
      ],
      [AstronomicalCatalog.Hipparcos]: [
        'catalogue hipparcos',
        'hipparcos catalogue',
      ],
      [AstronomicalCatalog.BrightStar]: [
        'bright star catalogue',
        'catalogue bright star',
      ],
    };

    return (genericTitlesByCatalog[object.catalog] ?? []).some((genericTitle) =>
      equalsNormalized(title, genericTitle),
    );
  }

  private getIdentityTerms(object: IAstronomicalObject): string[] {
    // La cible du catalogue reste toujours une identité valable, même pour un
    // objet dont le libellé affiché est générique (par exemple HIP 123).
    const terms = [
      object.target,
      ...[object.name, object.englishName, ...object.searchTerms]
      .map((term) => term.trim())
      .filter((term) => term.length > 0)
      .filter((term) => !this.isGenericObjectLabel(term)),
    ];

    if (object.catalog === AstronomicalCatalog.Messier) {
      const number = object.target.replace(/^M/i, '');
      terms.push(`M${number}`, `Messier ${number}`, `Messier M${number}`);
    }

    return [...new Set(terms.map((term) => normalize(term)))];
  }

  private isGenericObjectLabel(term: string): boolean {
    const normalizedTerm = normalize(term);

    return (
      /^objet messier m?\d+$/.test(normalizedTerm) ||
      /^messier object m?\d+$/.test(normalizedTerm) ||
      /^etoile hip \d+$/.test(normalizedTerm) ||
      /^hip \d+$/.test(normalizedTerm)
    );
  }

  private titleMatchesIdentity(title: string, identity: string): boolean {
    if (equalsNormalized(title, identity)) {
      return true;
    }

    // Les petits identifiants (M2, M31, HIP 123) doivent correspondre à un mot
    // entier : une simple recherche par sous-chaîne créerait des faux positifs.
    const escapedIdentity = identity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const identityPattern = new RegExp(`(^|[^a-z0-9])${escapedIdentity}(?=$|[^a-z0-9])`, 'u');

    return identityPattern.test(title);
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

      [AstronomicalObjectType.Constellation]: ['constellation', 'constellation'],
    };

    const terms = typeTerms[object.type] ?? [];

    return terms.map((suffix, index) => ({
      name: 'type',
      priority: 10 + index,
      term: `${object.englishName} ${suffix}`,
    }));
  }
}
