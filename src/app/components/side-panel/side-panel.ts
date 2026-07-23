import { Component, inject, input, output } from '@angular/core';
import { AstronomicalObject } from '../../models/astronomical-object.model';
import { AstronomicalObjectService } from '../../services/astronomical-object.service';
import { QuizService } from '../../services/quiz.service';
import { NgClass } from '@angular/common';
import { ScoreService } from '../../services/score.service';
import { QuizResults } from '../quiz-results/quiz-results';
import { AppMode } from '../../models/app-mode.model';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-side-panel',
  imports: [NgClass, QuizResults],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.css',
})
export class SidePanel {
  public readonly currentObject = input.required<AstronomicalObject>();
  public readonly currentIndex = input.required<number>();
  public readonly astronomicalObjectService = inject(AstronomicalObjectService);
  public readonly quizService = inject(QuizService);
  public readonly scoreService = inject(ScoreService);
  public readonly appStateService = inject(AppStateService);

  public readonly action = output<string>();
  public readonly answer = output<AstronomicalObject>();
  public readonly switchMode = output<AppMode>();

  public toPreviousObject() {
    this.action.emit('previous');
  }

  public toNextObject() {
    this.action.emit('next');
  }

  public answerQuestion(choice: AstronomicalObject) {
    this.answer.emit(choice);
  }

  public restartQuiz() {
    this.switchMode.emit(AppMode.Quiz);
  }

  public backToExploration() {
    this.switchMode.emit(AppMode.FreeExploration);
  }
}
