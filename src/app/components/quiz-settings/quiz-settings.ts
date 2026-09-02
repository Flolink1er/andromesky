import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { QuizDifficulty, QuizMode, IQuizSettings } from '../../models/quiz.model';
import { QuizService } from '../../services/quiz.service';
import { ScoreService } from '../../services/score.service';

@Component({
  selector: 'app-quiz-settings',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './quiz-settings.html',
  styleUrl: './quiz-settings.css',
})
export class QuizSettings {
  protected readonly QuizMode = QuizMode;
  protected readonly QuizDifficulty = QuizDifficulty;
  private readonly quizService = inject(QuizService);
  protected readonly scoreService = inject(ScoreService);

  public readonly modeControl = new FormControl(QuizMode.GuessObject, { nonNullable: true });

  public readonly difficultyControl = new FormControl(QuizDifficulty.Medium, { nonNullable: true });

  public readonly questionCountControl = new FormControl(10, { nonNullable: true });
  protected readonly historyOpen = signal(false);

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

  protected toggleHistory(): void {
    this.historyOpen.update((isOpen) => !isOpen);
  }

  protected clearHistory(): void {
    this.scoreService.clearHistory();
  }

  protected formatMode(mode: QuizMode): string {
    return mode === QuizMode.LocateObject ? 'Localisation' : "Deviner l'objet";
  }

  protected formatDifficulty(difficulty: QuizDifficulty): string {
    switch (difficulty) {
      case QuizDifficulty.Easy:
        return 'Facile';
      case QuizDifficulty.Medium:
        return 'Moyen';
      case QuizDifficulty.Hard:
        return 'Difficile';
    }
  }
}
