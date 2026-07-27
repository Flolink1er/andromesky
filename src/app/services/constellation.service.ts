import { inject, Injectable, signal } from '@angular/core';
import { IConstellation } from '../models/astronomical-object.model';
import { JsonLoaderService } from './json-loader.service';

@Injectable({
  providedIn: 'root',
})
export class ConstellationService {
  private readonly jsonLoader = inject(JsonLoaderService);

  private readonly _constellations = signal<IConstellation[]>([]);
  readonly constellations = this._constellations.asReadonly();

  constructor() {
    this.loadConstellations();
  }

  private loadConstellations(): void {
    this.jsonLoader.load<IConstellation[]>('constellations').subscribe({
      next: (constellations) => this._constellations.set(constellations),
      error: (error) => console.error('Unable to load constellations.', error),
    });
  }

  findById(id: string): IConstellation | undefined {
    return this._constellations().find((constellation) => constellation.id === id);
  }
}
