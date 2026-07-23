import { computed, inject, Injectable, signal } from '@angular/core';
import { AstronomicalObject } from '../models/astronomical-object.model';
import { QuizMode, QuizQuestion } from '../models/quiz.model';
import { AstronomicalObjectService } from './astronomical-object.service';
import { ScoreService } from './score.service';
import { ScoreEvent } from '../models/score.model';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private readonly DEFAULT_QUESTION_COUNT = 10; //valeur par défaut du nombre de question dans un quiz

  private readonly objectService = inject(AstronomicalObjectService);
  private readonly scoreService = inject(ScoreService);

  private readonly _isRunning = signal(false);
  private readonly _currentQuizMode = signal<QuizMode>(QuizMode.FindObject);
  private readonly _currentQuestionIndex = signal(0);
  private readonly _questions = signal<QuizQuestion[]>([]);
  public readonly totalQuestions = signal(this.DEFAULT_QUESTION_COUNT);

  public readonly isRunning = this._isRunning.asReadonly(); //getter permettant de rendre l'info disponible en readonly pour les composants
  public readonly currentQuestionIndex = this._currentQuestionIndex.asReadonly();
  public readonly questions = this._questions.asReadonly();

  private readonly _lastAnswerCorrect = signal<boolean | null>(null);
  public readonly lastAnswerCorrect = this._lastAnswerCorrect.asReadonly();

  private readonly _selectedAnswer = signal<AstronomicalObject | null>(null);
  public readonly selectedAnswer = this._selectedAnswer.asReadonly();

  private readonly _correctAnswers = signal(0);
  public readonly correctAnswers = this._correctAnswers.asReadonly();

  private readonly _isFinished = signal(false);
  public readonly isFinished = this._isFinished.asReadonly();

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

    return Math.round((this.correctAnswers() / this.totalQuestions()) * 100);
  });

  public readonly resultMessage = computed(() => {
    const rate = this.successRate();

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

  public startQuiz(questions: QuizQuestion[]): void {
    this._selectedAnswer.set(null);
    this._lastAnswerCorrect.set(null);
    this._correctAnswers.set(0);
    this._questions.set(questions);

    this._currentQuestionIndex.set(0);

    this._isRunning.set(true);
    this._isFinished.set(false);

    this.scoreService.reset();
  }

  public startNewQuiz(): void {
    const questions = this.objectService.generateQuizQuestions(this.totalQuestions(), 4);

    this.startQuiz(questions);
  }

  public stopQuiz(): void {
    this._isRunning.set(false);
    this._isFinished.set(true);

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
      this._correctAnswers.update((correct) => correct + 1);
      this.scoreService.addEvent(ScoreEvent.QuizCorrect);
    } else {
      this.scoreService.addEvent(ScoreEvent.QuizWrong);
    }
    return isCorrect;
  }

  public reset(): void {
    this._isRunning.set(false);
    this._isFinished.set(false);

    this._selectedAnswer.set(null);
    this._lastAnswerCorrect.set(null);
    this._correctAnswers.set(0);

    this._questions.set([]);
    this._currentQuestionIndex.set(0);
  }
}
