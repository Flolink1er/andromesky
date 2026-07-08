import { AfterViewInit, Component, inject, signal, effect, computed } from '@angular/core';
import { Header } from './components/header/header';
import { SidePanel } from './components/side-panel/side-panel';
import { SkyMap } from './components/sky-map/sky-map';
import { SkyMapService } from './services/sky-map.service';
import { AstronomicalObjectService } from './services/astronomical-object.service';
import { AstronomicalObject } from './models/astronomical-object.model';
import { QuizService } from './services/quiz.service';
import { AppStateService } from './services/app-state.service';
import { AppMode } from './models/app-mode.model';

@Component({
  selector: 'app-root',
  imports: [Header, SidePanel, SkyMap],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit {
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

      const questions = this.astronomicalObjectService.generateQuizQuestions(
        this.quizService.totalQuestions(),
        4,
      );

      this.quizService.startQuiz(questions);
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

  public ngAfterViewInit(): void {
    this.skyMapService.registerClickHandler((ra, dec) => this.selectObject(ra, dec));
  }

  public changeMode(mode: AppMode) {
    this.appStateService.setMode(mode);
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
    const nearest = this.astronomicalObjectService.findNearestObject(
      ra,
      dec,
      this.astronomicalObjectService.objects(),
    );

    if (!nearest) {
      return;
    }

    this.currentIndex = this.astronomicalObjectService.objects().indexOf(nearest);

    this.skyMapService.goToObject(nearest);
  }

  public answerQuestion(answer: AstronomicalObject): void {
    this.quizService.submitAnswer(answer);

    setTimeout(() => {
      this.quizService.nextQuestion();
    }, 1200);
  }
}
