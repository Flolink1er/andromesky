import { computed, inject, Injectable, signal } from '@angular/core';
import { IAstronomicalObject } from '../models/astronomical-object.model';
import {
  IQuizSettings,
  QuizDifficulty,
  QuizMode,
  QuizQuestion,
  QuizState,
} from '../models/quiz.model';
import { AstronomicalObjectService } from './astronomical-object.service';
import { ScoreService } from './score.service';
import { ScoreEvent } from '../models/score.model';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private readonly objectService = inject(AstronomicalObjectService);
  private readonly scoreService = inject(ScoreService);

  private readonly _state = signal(QuizState.Settings);
  private readonly _currentQuizMode = signal<QuizMode>(QuizMode.GuessObject);
  private readonly _currentQuestionIndex = signal(0);
  private readonly _currentDifficulty = signal<QuizDifficulty>(QuizDifficulty.Medium);
  private readonly _questions = signal<QuizQuestion[]>([]);

  public readonly totalQuestions = computed(() => this._questions().length);

  public readonly state = this._state.asReadonly(); //getter permettant de rendre l'info disponible en readonly pour les composants
  public readonly currentQuizMode = this._currentQuizMode.asReadonly();
  public readonly currentQuestionIndex = this._currentQuestionIndex.asReadonly();
  public readonly currentDifficulty = this._currentDifficulty.asReadonly();
  public readonly questions = this._questions.asReadonly();

  private readonly _lastAnswerCorrect = signal<boolean | null>(null);
  public readonly lastAnswerCorrect = this._lastAnswerCorrect.asReadonly();

  private readonly _selectedAnswer = signal<IAstronomicalObject | null>(null);
  public readonly selectedAnswer = this._selectedAnswer.asReadonly();

  public readonly correctAnswers = this.scoreService.game().correctAnswers;

  private readonly _questionStartedAt = signal(0);

  private readonly _selectedLocation = signal<{
    ra: number;
    dec: number;
  } | null>(null);

  public readonly selectedLocation = this._selectedLocation.asReadonly();

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

  public readonly successRate = computed(() => {
    if (this.totalQuestions() === 0) {
      return 0;
    }

    return Math.round((this.correctAnswers / this.totalQuestions()) * 100);
  });

  public startQuiz(questions: QuizQuestion[], mode: QuizMode, difficulty: QuizDifficulty): void {
    this._selectedAnswer.set(null);
    this._lastAnswerCorrect.set(null);
    this._questions.set(questions);

    this._currentQuestionIndex.set(0);
    this._currentQuizMode.set(mode);
    this._currentDifficulty.set(difficulty);

    this._state.set(QuizState.Running);

    this.scoreService.startGame(questions.length);
  }

  public startGuessQuiz(settings: IQuizSettings): void {
    const questions = this.objectService.generateQuizQuestions(
      settings.questionCount,
      4,
      settings.difficulty,
      settings.mode,
    );

    this.startQuiz(questions, settings.mode, settings.difficulty);
  }

  public startLocateQuiz(settings: IQuizSettings): void {
    const questions = this.objectService.generateQuizQuestions(
      settings.questionCount,
      4,
      settings.difficulty,
      settings.mode,
    );

    this.startQuiz(questions, settings.mode, settings.difficulty);
  }

  public stopQuiz(): void {
    this._state.set(QuizState.Finished);

    this.scoreService.finishGame(this._currentQuizMode(), this._currentDifficulty());
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
    this._questionStartedAt.set(Date.now());
  }

  public submitAnswer(answer: IAstronomicalObject): boolean {
    const currentQuestion = this.currentQuestion();
    const elapsed = Date.now() - this._questionStartedAt();

    if (!currentQuestion) {
      return false;
    }

    this._selectedAnswer.set(answer);

    const isCorrect = answer.target === currentQuestion.correctAnswer.target;

    this._lastAnswerCorrect.set(isCorrect);

    if (isCorrect) {
      if (elapsed < 5000) {
        this.scoreService.addEvent(ScoreEvent.QuizFastCorrect);
      } else {
        this.scoreService.addEvent(ScoreEvent.QuizCorrect);
      }
    } else {
      this.scoreService.addEvent(ScoreEvent.QuizWrong);
    }
    return isCorrect;
  }

  public reset(): void {
    this._state.set(QuizState.Settings);

    this._selectedAnswer.set(null);
    this._lastAnswerCorrect.set(null);

    this._questions.set([]);
    this._currentQuestionIndex.set(0);
  }

  public selectLocation(ra: number, dec: number): void {
    this._selectedLocation.set({
      ra,
      dec,
    });
  }

  public submitLocation(): boolean {
    const question = this.currentQuestion();
    const location = this.selectedLocation();

    if (!question || !location) {
      return false;
    }

    const nearest = this.objectService.findNearestObject(location.ra, location.dec);

    if (!nearest) {
      return false;
    }

    const isCorrect = nearest.target === question.correctAnswer.target;

    this._lastAnswerCorrect.set(isCorrect);

    if (isCorrect) {
      this.scoreService.addEvent(ScoreEvent.QuizCorrect);
    } else {
      this.scoreService.addEvent(ScoreEvent.QuizWrong);
    }

    this._selectedLocation.set(null);

    return isCorrect;
  }
}
