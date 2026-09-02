import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  AstronomicalObjectType,
  IAstronomicalObject,
} from '../../models/astronomical-object.model';
import { AstronomicalObjectService } from '../../services/astronomical-object.service';
import { QuizService } from '../../services/quiz.service';
import { NgClass } from '@angular/common';
import { ScoreService } from '../../services/score.service';
import { QuizResults } from '../quiz-results/quiz-results';
import { AppMode } from '../../models/app-mode.model';
import { AppStateService } from '../../services/app-state.service';
import { ConstellationService } from '../../services/constellation.service';
import { NasaImageService } from '../../services/nasa-image.service';
import { IAstronomicalImage } from '../../models/nasa-image.model';
import { WikipediaService } from '../../services/wikipedia.service';
import { IWikipediaSummary } from '../../models/wiki.model';
import { IQuizSettings, QuizMode, QuizState } from '../../models/quiz.model';
import { QuizQuestions } from '../quiz-questions/quiz-questions';
import { ObjectPanel } from '../object-panel/object-panel';
import { QuizSettings } from '../quiz-settings/quiz-settings';

@Component({
  selector: 'app-side-panel',
  imports: [QuizResults, QuizQuestions, ObjectPanel, QuizSettings],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.css',
})
export class SidePanel {
  private readonly hostElement = inject(ElementRef<HTMLElement>);
  public readonly currentObject = input.required<IAstronomicalObject>();
  public readonly currentIndex = input.required<number>();

  public readonly astronomicalObjectService = inject(AstronomicalObjectService);
  public readonly quizService = inject(QuizService);
  public readonly scoreService = inject(ScoreService);
  public readonly appStateService = inject(AppStateService);

  public readonly action = output<string>();
  public readonly switchMode = output<AppMode>();
  public readonly close = output<void>();

  public readonly AstronomicalObjectType = AstronomicalObjectType;
  public readonly QuizStates = QuizState;

  public toPreviousObject() {
    this.action.emit('previous');
  }

  public toNextObject() {
    this.action.emit('next');
  }

  public startQuiz(settings: IQuizSettings): void {
    switch (settings.mode) {
      case QuizMode.GuessObject:
        this.quizService.startGuessQuiz(settings);

        break;

      case QuizMode.LocateObject:
        this.quizService.startLocateQuiz(settings);

        break;
    }
  }

  public restartQuiz() {
    this.switchMode.emit(AppMode.Quiz);
  }

  public backToExploration() {
    this.switchMode.emit(AppMode.Exploration);
  }

  public closePanel(): void {
    this.close.emit();
  }

  @HostListener('document:pointermove', ['$event'])
  public updateEdgeGlow(event: PointerEvent): void {
    const panel = this.hostElement.nativeElement.querySelector('aside') as HTMLElement | null;

    if (!panel) {
      return;
    }

    const bounds = panel.getBoundingClientRect();
    const relativeY = Math.min(100, Math.max(0, ((event.clientY - bounds.top) / bounds.height) * 100));

    panel.style.setProperty('--edge-glow-y', `${relativeY}%`);
  }
}
