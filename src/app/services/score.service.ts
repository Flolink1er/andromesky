import { computed, Injectable, signal } from '@angular/core';
import { IGameScore, ScoreEvent } from '../models/score.model';
import { QuizMode, QuizDifficulty } from '../models/quiz.model';

@Injectable({
  providedIn: 'root',
})
export class ScoreService {
  private readonly _game = signal<IGameScore>(this.createGameScore(10));

  public readonly game = this._game.asReadonly();

  public readonly score = computed(() => this._game().score);
  public readonly resultMessage = computed(() => {
    const rate = this.game().successRate;

    if (rate === 100) {
      return '🌟 Impressionnant !';
    }

    if (rate >= 80) {
      return '🚀 Excellent travail !';
    }

    if (rate >= 50) {
      return '👍 Bien joué !';
    }

    return '🔭 Continue à explorer le ciel !';
  });

  public addEvent(event: ScoreEvent, scoreMultiplier = 1): void {
    this._game.update((game) => {
      const updated = {
        ...game,
        score: game.score + (event > 0 ? event * scoreMultiplier : 0),
      };

      switch (event) {
        case ScoreEvent.QuizCorrect:
        case ScoreEvent.QuizFastCorrect:
          updated.correctAnswers++;
          updated.currentStreak++;
          updated.bestStreak = Math.max(updated.bestStreak, updated.currentStreak);

          break;

        case ScoreEvent.QuizWrong:
          updated.wrongAnswers++;
          updated.currentStreak = 0;

          break;
      }

      return updated;
    });
  }

  //TODO: persistence du classement
  private saveScore() {}

  //TODO: chargement du classement
  private loadScore() {}

  public createGameScore(nbQuestions: number): IGameScore {
    return {
      score: 0,

      nbQuestions: nbQuestions,
      successRate: 0,

      correctAnswers: 0,
      wrongAnswers: 0,

      currentStreak: 0,
      bestStreak: 0,

      startedAt: new Date(),
    };
  }

  public startGame(nbQuestions: number) {
    this._game.set(this.createGameScore(nbQuestions));
  }

  public finishGame(mode: QuizMode, difficulty: QuizDifficulty): void {
    this._game.update((game) => ({
      ...game,
      successRate: Math.round((this._game().correctAnswers / this._game().nbQuestions) * 100),
      finishedAt: new Date(),
    }));

    this.saveScore();
  }

  public addCorrectAnswer() {
    this._game().correctAnswers += 1;
  }

  public reset(): void {
    this._game.set(this.createGameScore(10));
  }
}
