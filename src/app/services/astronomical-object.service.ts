import { inject, Injectable, signal } from '@angular/core';
import { AstronomicalCatalog, IAstronomicalObject } from '../models/astronomical-object.model';
// import { ASTRONOMICAL_OBJECTS } from '../data/astronomical-objects';
import { QuizDifficulty, QuizMode, QuizQuestion } from '../models/quiz.model';
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

  public search(query: string): IAstronomicalObject[] {
    const normalized = this.normalize(query);

    if (!normalized) {
      return [];
    }

    return this.objects()
      .filter((object) => {
        return (
          this.normalize(object.name).includes(normalized) ||
          this.normalize(object.target).includes(normalized) ||
          this.normalize(object.constellationId ?? '').includes(normalized) ||
          this.normalize(object.type).includes(normalized)
        );
      })
      .slice(0, 8);
  }

  private selectRandomObjects(
    count: number,
    objects: IAstronomicalObject[],
  ): IAstronomicalObject[] {
    return this.shuffle(objects).slice(0, Math.min(count));
  }

  private shuffle<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }

  private getObjectsForDifficulty(difficulty: QuizDifficulty): IAstronomicalObject[] {
    switch (difficulty) {
      case QuizDifficulty.Easy:
        return this._objects().filter((object) => object.catalog === AstronomicalCatalog.Messier);

      case QuizDifficulty.Medium:
        return this._objects().filter(
          (object) =>
            object.catalog === AstronomicalCatalog.Messier ||
            object.catalog === AstronomicalCatalog.Hipparcos,
        );

      case QuizDifficulty.Hard:
        return this._objects();
    }
  }

  private createQuestion(
    object: IAstronomicalObject,
    choicesCount: number,
    availableObjects: IAstronomicalObject[],
    mode: QuizMode,
  ): QuizQuestion {
    const wrongAnswers = availableObjects.filter(({ target }) => target !== object.target);

    const choices = this.shuffle(wrongAnswers).slice(0, choicesCount - 1);

    choices.push(object);

    return {
      label: mode === QuizMode.GuessObject ? 'Quel est cet objet ?' : `Localisez ${object.name}`,
      correctAnswer: object,
      choices: mode === QuizMode.GuessObject ? this.shuffle(choices) : undefined,
    };
  }

  public generateQuizQuestions(
    questionCount: number,
    choicesCount: number,
    difficulty: QuizDifficulty,
    mode: QuizMode,
  ): QuizQuestion[] {
    const availableObjects = this.getObjectsForDifficulty(difficulty);

    if (availableObjects.length === 0) {
      return [];
    }

    if (availableObjects.length < choicesCount) {
      throw new Error(`Not enough astronomical objects to generate ${choicesCount} choices.`);
    }

    return this.selectRandomObjects(questionCount, availableObjects).map((object) =>
      this.createQuestion(object, choicesCount, availableObjects, mode),
    );
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
  }
}
