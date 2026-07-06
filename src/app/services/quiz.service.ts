import { computed, inject, Injectable, signal } from '@angular/core';
import { AstronomicalObject } from '../models/astronomical-object.model';
import { QuizMode, QuizQuestion } from '../models/quiz.model';
import { AstronomicalObjectService } from './astronomical-object.service';
import { ScoreService } from './score.service';
import { ScoreEvent } from '../models/score.model';
import { SkyMapService } from './sky-map.service';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private readonly objectService = inject(AstronomicalObjectService);
  private readonly scoreService = inject(ScoreService);

  private readonly _isRunning = signal(false);
  private readonly _currentQuizMode = signal<QuizMode>(QuizMode.FindObject);
  private readonly _currentQuestionIndex = signal(0);
  private readonly _questions = signal<QuizQuestion[]>([]);
  private readonly _currentObject = signal<AstronomicalObject | null>(null);
  private readonly totalQuestions = signal(0);

  public readonly isRunning = this._isRunning.asReadonly(); //getter permettant de rendre l'info disponible en readonly pour les composants
  public readonly currentQuestionIndex = this._currentQuestionIndex.asReadonly();
  public readonly questions = this._questions.asReadonly();
  public readonly currentObject = this._currentObject.asReadonly();

  private readonly _lastAnswerCorrect = signal<boolean | null>(null);
  public readonly lastAnswerCorrect = this._lastAnswerCorrect.asReadonly();

  private readonly _selectedAnswer = signal<AstronomicalObject | null>(null);
  public readonly selectedAnswer = this._selectedAnswer.asReadonly();

  public readonly currentQuestion = computed(() => {
    const questions = this._questions();

    const index = this._currentQuestionIndex();

    return questions[index] ?? null;
  });

  public readonly progress = computed(() => {
    if (this._questions().length === 0) {
      return 0;
    }

    return Math.round(((this._currentQuestionIndex() + 1) / this._questions().length) * 100);
  });

  public startQuiz(questions: QuizQuestion[]): void {
    this._questions.set(questions);

    this._currentQuestionIndex.set(0);

    this._isRunning.set(true);
  }

  public stopQuiz(): void {
    this._isRunning.set(false);

    this._questions.set([]);

    this._currentQuestionIndex.set(0);
  }

  public nextQuestion(): void {
    const next = this._currentQuestionIndex() + 1;

    if (next >= this._questions().length) {
      this.stopQuiz();

      return;
    }

    this._selectedAnswer.set(null);
    this._lastAnswerCorrect.set(null);
    this._currentQuestionIndex.set(next);
  }

  public submitAnswer(answer: AstronomicalObject): boolean {
    const currentQuestion = this.currentQuestion();

    if (!currentQuestion) {
      return false;
    }

    this._selectedAnswer.set(answer);

    const isCorrect = answer.target === currentQuestion.correctAnswer.target;

    this._lastAnswerCorrect.set(isCorrect);

    if (isCorrect) {
      this.scoreService.addEvent(ScoreEvent.QuizCorrect);
    } else {
      this.scoreService.addEvent(ScoreEvent.QuizWrong);
    }
    return isCorrect;
  }
}
