import { Component, computed, inject, input, output } from '@angular/core';
import { IAstronomicalObject } from '../../models/astronomical-object.model';
import { AstronomicalObjectService } from '../../services/astronomical-object.service';
import { QuizService } from '../../services/quiz.service';
import { NgClass } from '@angular/common';
import { ScoreService } from '../../services/score.service';
import { QuizResults } from '../quiz-results/quiz-results';
import { AppMode } from '../../models/app-mode.model';
import { AppStateService } from '../../services/app-state.service';
import { ConstellationService } from '../../services/constellation.service';

@Component({
  selector: 'app-side-panel',
  imports: [NgClass, QuizResults],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.css',
})
export class SidePanel {
  public readonly currentObject = input.required<IAstronomicalObject>();
  public readonly currentIndex = input.required<number>();
  public readonly astronomicalObjectService = inject(AstronomicalObjectService);
  public readonly quizService = inject(QuizService);
  public readonly scoreService = inject(ScoreService);
  public readonly appStateService = inject(AppStateService);
  private readonly constellationService = inject(ConstellationService);

  public readonly action = output<string>();
  public readonly answer = output<IAstronomicalObject>();
  public readonly switchMode = output<AppMode>();

  public readonly constellation = computed(() => {
    const object = this.currentObject();

    if (!object) {
      return undefined;
    }

    return this.constellationService.findById(object.constellationId!) ?? undefined;
  });

  public toPreviousObject() {
    this.action.emit('previous');
  }

  public toNextObject() {
    this.action.emit('next');
  }

  public answerQuestion(choice: IAstronomicalObject) {
    this.answer.emit(choice);
  }

  public restartQuiz() {
    this.switchMode.emit(AppMode.Quiz);
  }

  public backToExploration() {
    this.switchMode.emit(AppMode.FreeExploration);
  }
}
