import { Injectable } from '@angular/core';
import { AstronomicalObject } from '../models/astronomical-object.model';

@Injectable({
  providedIn: 'root',
})
export class AstronomicalObjectService {
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

  getRandomObject(objects: AstronomicalObject[]): AstronomicalObject {
    const randomIndex = Math.floor(Math.random() * objects.length);

    return objects[randomIndex];
  }
}
