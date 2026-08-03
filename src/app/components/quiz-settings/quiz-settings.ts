import { Component, inject, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { QuizDifficulty, QuizMode, IQuizSettings } from '../../models/quiz.model';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-quiz-settings',
  imports: [ReactiveFormsModule],
  templateUrl: './quiz-settings.html',
  styleUrl: './quiz-settings.css',
})
export class QuizSettings {
  protected readonly QuizMode = QuizMode;
  protected readonly QuizDifficulty = QuizDifficulty;
  private readonly quizService = inject(QuizService);

  public readonly modeControl = new FormControl(QuizMode.GuessObject, { nonNullable: true });

  public readonly difficultyControl = new FormControl(QuizDifficulty.Medium, { nonNullable: true });

  public readonly questionCountControl = new FormControl(10, { nonNullable: true });

  public startQuiz(): void {
    const settings: IQuizSettings = {
      mode: this.modeControl.value,

      difficulty: this.difficultyControl.value,

      questionCount: this.questionCountControl.value,
    };

    switch (settings.mode) {
      case QuizMode.GuessObject:
        this.quizService.startGuessQuiz(settings);

        break;

      case QuizMode.LocateObject:
        this.quizService.startLocateQuiz(settings);

        break;
    }
  }
}
