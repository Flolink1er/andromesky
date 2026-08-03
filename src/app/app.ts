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

  public _currentIndex = signal(0);

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
        return;
      }

      if (this.quizService.currentQuizMode() !== QuizMode.GuessObject) {
        return;
      }

      const question = this.quizService.currentQuestion();

      if (!question) {
        return;
      }

      this.skyMapService.goToObject(question.correctAnswer);
    });
  }

  public changeMode(mode: AppMode) {
    this.appStateService.setMode(mode);
  }

  public switchMode(mode: AppMode) {
    switch (mode) {
      case AppMode.Quiz:
        this.skyMapService.clearSelectionMarker();
        this.appStateService.startQuiz();
        this.quizService.reset();
        break;

      case AppMode.FreeExploration:
        this.skyMapService.clearSelectionMarker();
        this.quizService.reset();
        this.appStateService.startFreeExploration();
        this.skyMapService.goToObject(this.currentObject());
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
      this.quizService.selectLocation(ra, dec);
      this.skyMapService.showSelectionMarker(ra, dec);

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
}
