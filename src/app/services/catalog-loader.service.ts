import { inject, Injectable } from '@angular/core';
import {
  AstronomicalCatalog,
  IAstronomicalObject,
  ICatalogDefinition,
} from '../models/astronomical-object.model';
import { forkJoin, map, Observable } from 'rxjs';
import { JsonLoaderService } from './json-loader.service';

@Injectable({
  providedIn: 'root',
})
export class CatalogLoaderService {
  private readonly jsonLoader = inject(JsonLoaderService);
  private readonly catalogs: ICatalogDefinition[] = [
    {
      catalog: AstronomicalCatalog.Messier,
      file: 'messier',
      enabled: true,
    },
    {
      catalog: AstronomicalCatalog.Hipparcos,
      file: 'hipparcos',
      enabled: true,
    },
    {
      catalog: AstronomicalCatalog.BrightStar,
      file: 'bright-stars',
      enabled: true,
    },
    {
      catalog: AstronomicalCatalog.Hipparcos,
      file: 'hipparcos-lines',
      enabled: true,
    },
  ];

  loadCatalogs(): Observable<IAstronomicalObject[]> {
    return this.jsonLoader
      .loadMany<IAstronomicalObject>(
        this.catalogs.filter((catalog) => catalog.enabled).map((catalog) => catalog.file),
      )
      .pipe(map((catalogContent) => catalogContent.flat()));
  }
}
