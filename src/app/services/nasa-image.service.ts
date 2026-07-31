import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  catchError,
  concat,
  concatMap,
  defaultIfEmpty,
  filter,
  from,
  map,
  Observable,
  of,
  take,
  tap,
} from 'rxjs';
import { IAstronomicalObject } from '../models/astronomical-object.model';
import {
  IAstronomicalImage,
  INasaData,
  INasaItem,
  INasaSearchResponse,
} from '../models/nasa-image.model';

@Injectable({
  providedIn: 'root',
})
export class NasaImageService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://images-api.nasa.gov/search';
  private readonly cache = new Map<string, IAstronomicalImage | null>();

  public searchImage(object: IAstronomicalObject): Observable<IAstronomicalImage | null> {
    const cached = this.cache.get(object.target);

    if (cached !== undefined) {
      console.log(`NASA cache : ${object.target}`);
      return of(cached);
    }

    return concat(
      this.search(object.englishName, object),

      from(object.searchTerms.filter((term) => term !== object.englishName)).pipe(
        concatMap((term) => this.search(term, object)),
      ),
    ).pipe(
      filter((image): image is IAstronomicalImage => image !== null),
      take(1),
      defaultIfEmpty(null),
      tap((image) => this.cache.set(object.target, image)),
    );
  }

  private search(term: string, object: IAstronomicalObject): Observable<IAstronomicalImage | null> {
    return this.http
      .get<any>(this.apiUrl, {
        params: {
          q: term,
          media_type: 'image',
        },
      })
      .pipe(
        map((response) => {
          try {
            const item = this.findBestItem(response.collection?.items ?? [], object);

            if (!item) {
              return null;
            }

            if (!item) {
              return null;
            }

            const data = item.data?.[0];
            const link = item.links?.[0];

            if (!data || !link) {
              return null;
            }

            return {
              title: data.title,
              imageUrl: link.href,
              description: data.description,
              photographer: data.photographer,
              source: 'NASA Image Library',
            } satisfies IAstronomicalImage;
          } catch (e) {
            console.error("Erreur dans la recherche d'image", e);
            throw e;
          }
        }),
      );
  }

  private findBestItem(items: INasaItem[], object: IAstronomicalObject): INasaItem | null {
    if (items.length === 0) {
      return null;
    }

    let bestItem = items[0];
    let bestScore = -1;

    for (const item of items) {
      const data = item.data[0];

      const score = this.calculateScore(data, object);

      if (score > bestScore) {
        bestScore = score;
        bestItem = item;
      }
    }

    if (bestScore > 10) {
      return bestItem;
    } else {
      return null;
    }
  }

  private calculateScore(data: INasaData, object: IAstronomicalObject): number {
    const title = data.title.toLowerCase();
    const description = data.description?.toLowerCase() ?? '';

    let score = 0;

    if (title === object.englishName.toLowerCase()) {
      score += 100;
    }

    if (title.includes(object.englishName.toLowerCase())) {
      score += 80;
    }

    if (title.includes('artist concept')) {
      return 0;
    }

    if (title.includes('hubble')) {
      score += 1000;
    }

    for (const term of object.searchTerms) {
      const lowerTerm = term.toLowerCase();

      if (title === lowerTerm) {
        score += 60;
      }

      if (title.includes(lowerTerm)) {
        score += 40;
      }

      if (description.includes(lowerTerm)) {
        score += 10;
      }
    }

    return score;
  }
}
