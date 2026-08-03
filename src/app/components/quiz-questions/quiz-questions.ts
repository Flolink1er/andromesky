import { Component, inject, output } from '@angular/core';
import { NgClass } from '@angular/common';

import { IAstronomicalObject } from '../../models/astronomical-object.model';

import { QuizService } from '../../services/quiz.service';
import { ScoreService } from '../../services/score.service';
import { QuizMode } from '../../models/quiz.model';

@Component({
  selector: 'app-quiz-questions',
  imports: [NgClass],
  templateUrl: './quiz-questions.html',
  styleUrl: './quiz-questions.css',
})
export class QuizQuestions {
  protected readonly quizService = inject(QuizService);

  protected readonly scoreService = inject(ScoreService);

  public readonly answer = output<IAstronomicalObject>();
  public readonly QuizMode = QuizMode;

  public answerQuestion(answer: IAstronomicalObject): void {
    this.quizService.submitAnswer(answer);

    setTimeout(() => {
      this.quizService.nextQuestion();
    }, 2500);
  }

  public confirmLocation(): void {
    this.quizService.submitLocation();

    setTimeout(() => {
      this.quizService.nextQuestion();
    }, 1000);
  }
}
