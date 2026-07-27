import { IAstronomicalObject } from './astronomical-object.model';

export enum QuizMode {
  GuessObject,

  FindObject,

  SpaceGuessR,
}

export interface QuizQuestion {
  label: string;

  correctAnswer: IAstronomicalObject;

  choices: IAstronomicalObject[];
}
