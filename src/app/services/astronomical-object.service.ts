import { Injectable, signal } from '@angular/core';
import { AstronomicalObject } from '../models/astronomical-object.model';
import { ASTRONOMICAL_OBJECTS } from '../data/astronomical-objects';
import { QuizQuestion } from '../models/quiz.model';

@Injectable({
  providedIn: 'root',
})
export class AstronomicalObjectService {
  private readonly _objects = signal<AstronomicalObject[]>(ASTRONOMICAL_OBJECTS);

  public readonly objects = this._objects.asReadonly();

  findNearestObject(
    ra: number,
    dec: number,
    objects: AstronomicalObject[],
  ): AstronomicalObject | null {
    let nearest: AstronomicalObject | null = null;
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

  findByTarget(target: string, objects: AstronomicalObject[]): AstronomicalObject | undefined {
    return objects.find((object) => object.target === target);
  }

  private selectRandomObjects(count: number): AstronomicalObject[] {
    return this.shuffle(this._objects()).slice(0, count);
  }

  private shuffle<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }

  private createQuestion(object: AstronomicalObject, choicesCount: number): QuizQuestion {
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
    if (this._objects().length < choicesCount) {
      throw new Error(`Not enough astronomical objects to generate ${choicesCount} choices.`);
    }

    return this.selectRandomObjects(questionCount).map((object) =>
      this.createQuestion(object, choicesCount),
    );
  }
}
