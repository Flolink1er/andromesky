import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JsonLoaderService {
  private readonly http = inject(HttpClient);

  load<T>(path: string): Observable<T> {
    return this.http.get<T>(`data/${path}.json`);
  }

  loadMany<T>(paths: string[]): Observable<T[]> {
    return forkJoin(paths.map((path) => this.load<T>(path)));
  }
}
