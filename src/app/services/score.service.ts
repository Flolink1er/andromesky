import { computed, Injectable, signal } from '@angular/core';
import { IGameScore, IScoreHistory, ScoreEvent } from '../models/score.model';
import { QuizMode, QuizDifficulty } from '../models/quiz.model';

@Injectable({
  providedIn: 'root',
})
export class ScoreService {
  private static readonly HISTORY_STORAGE_KEY = 'andromesky-score-history';
  private static readonly MAX_HISTORY_ENTRIES = 50;

  private readonly _game = signal<IGameScore>(this.createGameScore(10));
  private readonly _history = signal<IScoreHistory[]>(this.loadScore());

  public readonly game = this._game.asReadonly();
  public readonly history = this._history.asReadonly();

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
        case ScoreEvent.QuizLocatePrecise:
        case ScoreEvent.QuizLocateClose:
        case ScoreEvent.QuizLocateApproximate:
          updated.correctAnswers++;
          updated.currentStreak++;
          updated.bestStreak = Math.max(updated.bestStreak, updated.currentStreak);

          if (event === ScoreEvent.QuizFastCorrect) {
            updated.fastAnswers++;
          }

          break;

        case ScoreEvent.QuizWrong:
          updated.wrongAnswers++;
          updated.currentStreak = 0;

          break;
      }

      return updated;
    });
  }

  private saveScore(mode: QuizMode, difficulty: QuizDifficulty): void {
    const game = this.game();
    const entry: IScoreHistory = {
      id: this.createHistoryId(),
      date: game.finishedAt?.toISOString() ?? new Date().toISOString(),
      mode,
      difficulty,
      score: game.score,
      successRate: game.successRate,
      correctAnswers: game.correctAnswers,
      totalQuestions: game.nbQuestions,
      bestStreak: game.bestStreak,
      fastAnswers: game.fastAnswers,
    };

    const history = [entry, ...this.history()].slice(0, ScoreService.MAX_HISTORY_ENTRIES);
    this._history.set(history);

    try {
      localStorage.setItem(ScoreService.HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.warn("Impossible d'enregistrer l'historique des scores.", error);
    }
  }

  private loadScore(): IScoreHistory[] {
    try {
      const storedHistory = localStorage.getItem(ScoreService.HISTORY_STORAGE_KEY);
      if (!storedHistory) {
        return [];
      }

      const history = JSON.parse(storedHistory) as IScoreHistory[];
      return Array.isArray(history)
        ? history
            .filter((entry) => this.isValidHistoryEntry(entry))
            .map((entry) => ({
              ...entry,
              fastAnswers: typeof entry.fastAnswers === 'number' ? entry.fastAnswers : 0,
            }))
        : [];
    } catch (error) {
      console.warn("Impossible de charger l'historique des scores.", error);
      return [];
    }
  }

  public clearHistory(): void {
    this._history.set([]);

    try {
      localStorage.removeItem(ScoreService.HISTORY_STORAGE_KEY);
    } catch (error) {
      console.warn("Impossible de supprimer l'historique des scores.", error);
    }
  }

  public createGameScore(nbQuestions: number): IGameScore {
    return {
      score: 0,

      nbQuestions: nbQuestions,
      successRate: 0,

      correctAnswers: 0,
      wrongAnswers: 0,

      currentStreak: 0,
      bestStreak: 0,
      fastAnswers: 0,

      startedAt: new Date(),
    };
  }

  public startGame(nbQuestions: number) {
    this._game.set(this.createGameScore(nbQuestions));
  }

  public finishGame(mode: QuizMode, difficulty: QuizDifficulty): void {
    this._game.update((game) => ({
      ...game,
      successRate: Math.round((game.correctAnswers / game.nbQuestions) * 100),
      finishedAt: new Date(),
    }));

    this.saveScore(mode, difficulty);
  }

  public addCorrectAnswer() {
    this._game().correctAnswers += 1;
  }

  public reset(): void {
    this._game.set(this.createGameScore(10));
  }

  private isValidHistoryEntry(entry: IScoreHistory): boolean {
    return (
      typeof entry?.id === 'string' &&
      typeof entry.date === 'string' &&
      typeof entry.score === 'number' &&
      typeof entry.successRate === 'number' &&
      typeof entry.correctAnswers === 'number' &&
      typeof entry.totalQuestions === 'number'
    );
  }

  private createHistoryId(): string {
    return typeof crypto?.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
