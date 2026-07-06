import { computed, Injectable, signal } from '@angular/core';
import { ScoreEvent } from '../models/score.model';

@Injectable({
  providedIn: 'root',
})
export class ScoreService {
  private readonly score = signal(0);

  public addPoints(points: number): void {
    this.score.update((score) => score + points);
  }

  public removePoints(points: number): void {
    this.score.update((score) => Math.max(0, score - points));
  }

  public reset(): void {
    this.score.set(0);
  }

  public getScore(): number {
    return this.score();
  }

  private saveScore() {}

  private loadScore() {}

  public addEvent(event: ScoreEvent): void {
    this.score.update((score) => score + event);
  }
}
