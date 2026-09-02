import { AfterViewInit, Component, inject, signal, effect, computed } from '@angular/core';
import { Header } from './components/header/header';
import { SidePanel } from './components/side-panel/side-panel';
import { SkyMap } from './components/sky-map/sky-map';
import { SkyMapService } from './services/sky-map.service';
import { AstronomicalObjectService } from './services/astronomical-object.service';
import { IAstronomicalObject } from './models/astronomical-object.model';
import { QuizService } from './services/quiz.service';
import { AppStateService } from './services/app-state.service';
import { AppMode } from './models/app-mode.model';
import { SearchBar } from './components/search-bar/search-bar';
import { QuizMode, QuizState } from './models/quiz.model';

@Component({
  selector: 'app-root',
  imports: [Header, SidePanel, SkyMap, SearchBar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('AndromeSky');
  public readonly skyMapService = inject(SkyMapService);
  public readonly astronomicalObjectService = inject(AstronomicalObjectService);
  public readonly quizService = inject(QuizService);
  public readonly appStateService = inject(AppStateService);

  public _currentIndex = signal(-1);
  public readonly isPanelOpen = signal(false);
  public readonly isQuizAnswerSheet = computed(
    () =>
      this.appStateService.isQuiz() &&
      this.quizService.state() === QuizState.Running &&
      this.quizService.currentQuizMode() === QuizMode.GuessObject,
  );
  protected readonly QuizStates = QuizState;
  protected readonly QuizModes = QuizMode;

  public readonly currentObject = computed(() => {
    return this.astronomicalObjectService.objects()[this.currentIndex];
  });

  constructor() {
    effect(() => {
      if (this.quizService.state() !== QuizState.Running) {
        return;
      }

      if (this.quizService.currentQuizMode() === QuizMode.LocateObject) {
        this.skyMapService.clearHighlightedObject();
        this.skyMapService.clearLocationFeedback();
        this.skyMapService.clearLocationHint();
        return;
      }

      if (this.quizService.currentQuizMode() !== QuizMode.GuessObject) {
        return;
      }

      const question = this.quizService.currentQuestion();

      if (!question) {
        return;
      }

      this.skyMapService.goToObject(question.correctAnswer, this.isMobileViewport());
    });

    effect(() => {
      if (this.appStateService.isQuiz() && this.quizService.state() === QuizState.Finished) {
        this.isPanelOpen.set(true);
      }
    });
  }

  public changeMode(mode: AppMode): void {
    if (
      this.appStateService.isQuiz() &&
      this.quizService.state() === QuizState.Running &&
      mode === AppMode.Exploration
    ) {
      this.quizService.reset();
      this.skyMapService.clearSelectionMarker();
      this.skyMapService.clearLocationFeedback();
      this.skyMapService.clearLocationHint();
    }

    this.appStateService.setMode(mode);
    this.isPanelOpen.set(mode === AppMode.Quiz);

    switch (mode) {
      case AppMode.Exploration:
        if (this.currentObject()) {
          this.skyMapService.goToObject(this.currentObject());
        }
        break;

      case AppMode.Quiz:
        this.quizService.reset();
        this.skyMapService.clearSelectionMarker();
        this.skyMapService.clearLocationFeedback();
        this.skyMapService.clearLocationHint();
        break;
    }
  }

  public get currentIndex(): number {
    return this._currentIndex();
  }

  public set currentIndex(value: number) {
    this._currentIndex.set(value);
  }

  public nextObject() {
    this.currentIndex = (this.currentIndex + 1) % this.astronomicalObjectService.objects().length;
  }

  public previousObject() {
    this.currentIndex =
      (this.currentIndex - 1 + this.astronomicalObjectService.objects().length) %
      this.astronomicalObjectService.objects().length;
  }

  public handleAction(action: string) {
    if (action == 'next') {
      this.nextObject();
    } else if (action == 'previous') {
      this.previousObject();
    }
    this.skyMapService.goToObject(this.currentObject());
  }

  public onSkyClick(ra: number, dec: number): void {
    if (
      this.quizService.state() === QuizState.Running &&
      this.quizService.currentQuizMode() === QuizMode.LocateObject
    ) {
      if (this.quizService.locationResult()) {
        return;
      }

      this.quizService.selectLocation(ra, dec);
      this.skyMapService.showSelectionMarker(ra, dec);
      this.skyMapService.clearLocationFeedback();

      return;
    }

    if (this.quizService.state() === QuizState.Running) {
      return;
    }

    const nearest = this.astronomicalObjectService.findNearestObject(ra, dec);

    if (!nearest) {
      return;
    }

    this.currentIndex = this.astronomicalObjectService.objects().indexOf(nearest);
    this.skyMapService.goToObject(nearest);
  }

  public onObjectSelected(object: IAstronomicalObject): void {
    this.currentIndex = this.astronomicalObjectService.objects().indexOf(object);
    this.skyMapService.goToObject(object);
  }

  public togglePanel(): void {
    this.isPanelOpen.update((isOpen) => !isOpen);
  }

  public closePanel(): void {
    this.isPanelOpen.set(false);
  }

  public confirmQuizLocation(): void {
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

  public useLocationHint(): void {
    const question = this.quizService.currentQuestion();

    if (question && this.quizService.activateLocationHint()) {
      this.skyMapService.showLocationHint(question.correctAnswer);
    }
  }

  public formatAngularDistance(distanceDegrees: number): string {
    return `${distanceDegrees < 1 ? distanceDegrees.toFixed(2) : distanceDegrees.toFixed(1)}°`;
  }

  private isMobileViewport(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  }
}
