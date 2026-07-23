import { computed, Injectable, signal } from '@angular/core';
import { ScoreEvent } from '../models/score.model';

@Injectable({
  providedIn: 'root',
})
export class ScoreService {
  private readonly _score = signal(0);

  public readonly score = this._score.asReadonly();

  public addPoints(points: number): void {
    this._score.update((score) => score + points);
  }

  public addEvent(event: ScoreEvent): void {
    this._score.update((score) => score + event);
  }

  public removePoints(points: number): void {
    this._score.update((score) => Math.max(0, score - points));
  }

  public reset(): void {
    this._score.set(0);
  }

  //TODO: persistence du classement
  private saveScore() {}

  //TODO: chargement du classement
  private loadScore() {}
}
