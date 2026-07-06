import { AstronomicalObject } from './astronomical-object.model';

export enum QuizMode {
  GuessObject,

  FindObject,

  SpaceGuessR,
}

export interface QuizQuestion {
  label: string;

  correctAnswer: AstronomicalObject;

  choices: AstronomicalObject[];
}
