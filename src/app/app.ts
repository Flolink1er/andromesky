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
      if (!this.appStateService.isQuiz()) {
        return;
      }

      this.quizService.startNewQuiz();
    });

    effect(() => {
      if (!this.quizService.isRunning()) {
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
        this.restartQuiz();
        break;

      case AppMode.FreeExploration:
        this.quizService.reset();
        this.appStateService.startFreeExploration();
        this.skyMapService.goToObject(this.currentObject());
        break;
    }
  }

  public restartQuiz(): void {
    this.quizService.startNewQuiz();
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

  public selectObject(ra: number, dec: number): void {
    const nearest = this.astronomicalObjectService.findNearestObject(ra, dec);

    if (!nearest) {
      return;
    }

    this.currentIndex = this.astronomicalObjectService.objects().indexOf(nearest);

    this.skyMapService.goToObject(nearest);
  }

  public answerQuestion(answer: IAstronomicalObject): void {
    this.quizService.submitAnswer(answer);

    setTimeout(() => {
      this.quizService.nextQuestion();
    }, 2500);
  }

  public onObjectSelected(object: IAstronomicalObject): void {
    this.currentIndex = this.astronomicalObjectService.objects().indexOf(object);
    this.skyMapService.goToObject(object);
  }
}
