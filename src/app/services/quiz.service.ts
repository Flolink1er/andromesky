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

export interface ILocationResult {
  correctAnswer: IAstronomicalObject;
  distanceDegrees: number;
  isCorrect: boolean;
  precisionLabel: string;
  awardedScore: number;
}

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private static readonly LOCATION_SCORE_TIERS = [
    {
      maximumDistanceDegrees: 0.5,
      event: ScoreEvent.QuizLocatePrecise,
      label: 'Position très précise',
    },
    { maximumDistanceDegrees: 1.5, event: ScoreEvent.QuizLocateClose, label: 'Bonne localisation' },
    {
      maximumDistanceDegrees: 3,
      event: ScoreEvent.QuizLocateApproximate,
      label: 'Localisation approximative',
    },
  ] as const;

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

  private readonly _fastAnswer = signal(false);
  public readonly fastAnswer = this._fastAnswer.asReadonly();

  private readonly _selectedLocation = signal<{
    ra: number;
    dec: number;
  } | null>(null);

  public readonly selectedLocation = this._selectedLocation.asReadonly();

  private readonly _locationResult = signal<ILocationResult | null>(null);
  public readonly locationResult = this._locationResult.asReadonly();

  private readonly _hintUsed = signal(false);
  public readonly hintUsed = this._hintUsed.asReadonly();

  private readonly _eliminatedAnswerTarget = signal<string | null>(null);
  public readonly eliminatedAnswerTarget = this._eliminatedAnswerTarget.asReadonly();

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
    this._selectedLocation.set(null);
    this._lastAnswerCorrect.set(null);
    this._locationResult.set(null);
    this._fastAnswer.set(false);
    this.resetHint();
    this._questions.set(questions);

    this._currentQuestionIndex.set(0);
    this._currentQuizMode.set(mode);
    this._currentDifficulty.set(difficulty);

    this._state.set(QuizState.Running);
    this._questionStartedAt.set(Date.now());

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
    this._selectedLocation.set(null);
    this._lastAnswerCorrect.set(null);
    this._locationResult.set(null);
    this._fastAnswer.set(false);
    this.resetHint();
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

    const isFastCorrect = isCorrect && elapsed < 5000;
    this._fastAnswer.set(isFastCorrect);

    if (isCorrect) {
      if (isFastCorrect) {
        this.scoreService.addEvent(ScoreEvent.QuizFastCorrect, this.getScoreMultiplier());
      } else {
        this.scoreService.addEvent(ScoreEvent.QuizCorrect, this.getScoreMultiplier());
      }
    } else {
      this.scoreService.addEvent(ScoreEvent.QuizWrong);
    }
    return isCorrect;
  }

  public reset(): void {
    this._state.set(QuizState.Settings);

    this._selectedAnswer.set(null);
    this._selectedLocation.set(null);
    this._lastAnswerCorrect.set(null);
    this._locationResult.set(null);
    this._fastAnswer.set(false);
    this.resetHint();

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

    const distanceDegrees = this.getAngularDistanceDegrees(location, question.correctAnswer);
    const tier = QuizService.LOCATION_SCORE_TIERS.find(
      ({ maximumDistanceDegrees }) => distanceDegrees <= maximumDistanceDegrees,
    );
    const isCorrect = tier !== undefined;
    const awardedScore = tier ? tier.event * this.getScoreMultiplier() : 0;

    this._lastAnswerCorrect.set(isCorrect);
    this._locationResult.set({
      correctAnswer: question.correctAnswer,
      distanceDegrees,
      isCorrect,
      precisionLabel: tier?.label ?? 'Position trop éloignée',
      awardedScore,
    });

    if (tier) {
      this.scoreService.addEvent(tier.event, this.getScoreMultiplier());
    } else {
      this.scoreService.addEvent(ScoreEvent.QuizWrong);
    }

    this._selectedLocation.set(null);

    return true;
  }

  public activateGuessHint(): boolean {
    const question = this.currentQuestion();

    if (!this.canActivateHint() || !question?.choices) {
      return false;
    }

    const wrongChoices = question.choices.filter(
      (choice) => choice.target !== question.correctAnswer.target,
    );
    if (wrongChoices.length === 0) {
      return false;
    }

    const choice = wrongChoices[Math.floor(Math.random() * wrongChoices.length)];
    this._eliminatedAnswerTarget.set(choice.target);
    this._hintUsed.set(true);

    return true;
  }

  public activateLocationHint(): boolean {
    if (!this.canActivateHint()) {
      return false;
    }

    this._hintUsed.set(true);

    return true;
  }

  private canActivateHint(): boolean {
    return (
      this.state() === QuizState.Running &&
      !this.hintUsed() &&
      this.selectedAnswer() === null &&
      this.locationResult() === null
    );
  }

  private resetHint(): void {
    this._hintUsed.set(false);
    this._eliminatedAnswerTarget.set(null);
  }

  private getScoreMultiplier(): number {
    return this.hintUsed() ? 0.5 : 1;
  }

  private getAngularDistanceDegrees(
    location: { ra: number; dec: number },
    correctAnswer: IAstronomicalObject,
  ): number {
    const toRadians = (angle: number) => (angle * Math.PI) / 180;
    const locationDec = toRadians(location.dec);
    const answerDec = toRadians(correctAnswer.dec!);
    const rightAscensionDifference = toRadians(location.ra - correctAnswer.ra!);
    const cosine =
      Math.sin(locationDec) * Math.sin(answerDec) +
      Math.cos(locationDec) * Math.cos(answerDec) * Math.cos(rightAscensionDifference);

    return (Math.acos(Math.min(1, Math.max(-1, cosine))) * 180) / Math.PI;
  }
}
