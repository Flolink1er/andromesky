import { computed, inject, Injectable, signal } from '@angular/core';
import { AppMode } from '../models/app-mode.model';
import { AstronomicalObjectService } from './astronomical-object.service';
import { SkyMapService } from './sky-map.service';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  private readonly _mode = signal(AppMode.FreeExploration);
  private readonly _previousMode = signal(AppMode.FreeExploration);
  private readonly skymapService = inject(SkyMapService);

  public readonly mode = this._mode.asReadonly();
  public readonly previousMode = this._previousMode.asReadonly();

  public readonly isQuiz = computed(() => this._mode() === AppMode.Quiz);

  public readonly isGuidedExploration = computed(() => this._mode() === AppMode.GuidedExploration);

  public readonly isFreeExploration = computed(() => this._mode() === AppMode.FreeExploration);

  public readonly isSpaceGuessR = computed(() => this._mode() === AppMode.SpaceGuessR);

  public setMode(mode: AppMode): void {
    this._mode.set(mode);
  }

  public reset(): void {
    this._mode.set(AppMode.FreeExploration);
  }

  public startQuiz(): void {
    this.setMode(AppMode.Quiz);
  }

  public startGuidedExploration(): void {
    this.setMode(AppMode.GuidedExploration);
  }

  public startFreeExploration(): void {
    this.setMode(AppMode.FreeExploration);
  }

  public startSpaceGuessR(): void {
    this.setMode(AppMode.SpaceGuessR);
  }
}
