import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-quiz-results',
  imports: [],
  templateUrl: './quiz-results.html',
  styleUrl: './quiz-results.css',
})
export class QuizResults {
  public readonly score = input.required<number>();
  public readonly correctAnswers = input.required<number>();
  public readonly totalQuestions = input.required<number>();
  public readonly resultMessage = input.required<string>();
  public readonly successRate = input.required<number>();
  public readonly fastAnswers = input.required<number>();
  public readonly restartQuiz = output<void>();
  public readonly backToExploration = output<void>();
}
