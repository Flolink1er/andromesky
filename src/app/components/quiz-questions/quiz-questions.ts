import { Component, inject, output } from '@angular/core';
import { NgClass } from '@angular/common';

import { IAstronomicalObject } from '../../models/astronomical-object.model';

import { QuizService } from '../../services/quiz.service';
import { ScoreService } from '../../services/score.service';
import { SkyMapService } from '../../services/sky-map.service';
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

  private readonly skyMapService = inject(SkyMapService);

  public readonly answer = output<IAstronomicalObject>();
  public readonly QuizMode = QuizMode;

  public answerQuestion(answer: IAstronomicalObject): void {
    this.quizService.submitAnswer(answer);

    setTimeout(() => {
      this.quizService.nextQuestion();
    }, 2500);
  }

  public useGuessHint(): void {
    this.quizService.activateGuessHint();
  }

  public useLocationHint(): void {
    const question = this.quizService.currentQuestion();

    if (question && this.quizService.activateLocationHint()) {
      this.skyMapService.showLocationHint(question.correctAnswer);
    }
  }

  public confirmLocation(): void {
    const selectedLocation = this.quizService.selectedLocation();

    if (!this.quizService.submitLocation()) {
      return;
    }

    const result = this.quizService.locationResult();
    if (selectedLocation && result) {
      this.skyMapService.showLocationFeedback(selectedLocation, result.correctAnswer);
    }

    setTimeout(() => {
      this.quizService.nextQuestion();
      this.skyMapService.clearSelectionMarker();
      this.skyMapService.clearLocationFeedback();
      this.skyMapService.clearLocationHint();
    }, 2500);
  }

  public formatAngularDistance(distanceDegrees: number): string {
    return `${distanceDegrees < 1 ? distanceDegrees.toFixed(2) : distanceDegrees.toFixed(1)}°`;
  }
}
