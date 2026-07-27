import { inject, Injectable, signal } from '@angular/core';
import { IAstronomicalObject } from '../models/astronomical-object.model';
// import { ASTRONOMICAL_OBJECTS } from '../data/astronomical-objects';
import { QuizQuestion } from '../models/quiz.model';
import { CatalogLoaderService } from './catalog-loader.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AstronomicalObjectService {
  private readonly catalogService = inject(CatalogLoaderService);

  private readonly _objects = signal<IAstronomicalObject[]>([]);
  // private readonly _objects = signal<AstronomicalObject[]>(ASTRONOMICAL_OBJECTS);

  constructor() {
    this.loadObjects();
  }

  public readonly objects = this._objects.asReadonly();

  private loadObjects(): void {
    this.catalogService.loadCatalogs().subscribe({
      next: (objects) => this._objects.set(objects),
      error: (error) => console.error('Unable to load astronomical catalog', error),
    });
  }

  findNearestObject(ra: number, dec: number): IAstronomicalObject | null {
    const objects = this._objects();
    let nearest: IAstronomicalObject | null = null;
    let minDistance = Number.MAX_VALUE;

    const MAX_SELECTION_DISTANCE = 3;

    for (const object of objects) {
      if (object.ra === undefined || object.dec === undefined) {
        continue;
      }

      const distance = Math.sqrt(Math.pow(object.ra - ra, 2) + Math.pow(object.dec - dec, 2));

      if (distance < minDistance) {
        minDistance = distance;
        nearest = object;
      }
    }

    if (minDistance > MAX_SELECTION_DISTANCE) {
      return null;
    }

    return nearest;
  }

  findByTarget(target: string): IAstronomicalObject | undefined {
    const objects = this._objects();
    return objects.find((object) => object.target === target);
  }

  private selectRandomObjects(count: number): IAstronomicalObject[] {
    return this.shuffle(this._objects()).slice(0, count);
  }

  private shuffle<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }

  private createQuestion(object: IAstronomicalObject, choicesCount: number): QuizQuestion {
    const wrongAnswers = this._objects().filter((candidate) => candidate.target !== object.target);

    const choices = this.shuffle(wrongAnswers).slice(0, choicesCount - 1);

    choices.push(object);

    return {
      label: 'Quel est cet objet ?',
      correctAnswer: object,
      choices: this.shuffle(choices),
    };
  }

  public generateQuizQuestions(questionCount: number, choicesCount: number): QuizQuestion[] {
    if (this._objects().length === 0) {
      return [];
    }

    if (this._objects().length < choicesCount) {
      throw new Error(`Not enough astronomical objects to generate ${choicesCount} choices.`);
    }

    return this.selectRandomObjects(questionCount).map((object) =>
      this.createQuestion(object, choicesCount),
    );
  }
}
