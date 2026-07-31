import {
  AfterViewInit,
  Component,
  computed,
  effect,
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
  private readonly nasaImage = inject(NasaImageService);

  public readonly action = output<string>();
  public readonly answer = output<IAstronomicalObject>();
  public readonly switchMode = output<AppMode>();

  public readonly image = signal<IAstronomicalImage | null>(null);
  public readonly isLoadingImage = signal(false);

  public readonly AstronomicalObjectType = AstronomicalObjectType;

  constructor() {
    effect((onCleanup) => {
      const object = this.currentObject();

      this.image.set(null);
      this.isLoadingImage.set(true);

      const subscription = this.nasaImage.searchImage(object).subscribe({
        next: (image) => this.image.set(image),
        error: () => this.image.set(null),
        complete: () => this.isLoadingImage.set(false),
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

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
