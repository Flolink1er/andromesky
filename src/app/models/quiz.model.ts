import {
  AstronomicalCatalog,
  AstronomicalObjectType,
  IAstronomicalObject,
} from './astronomical-object.model';

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

export enum QuizMode {
  Image = 'Image',

  Locate = 'Locate',
}

export enum QuizDifficulty {
  Easy,
  Medium,
  Hard,
}

const QUIZ_CONFIGURATION = {
  [QuizDifficulty.Easy]: {
    catalogs: [AstronomicalCatalog.Planet],
    types: [AstronomicalObjectType.Constellation],
  },

  [QuizDifficulty.Medium]: {
    catalogs: [AstronomicalCatalog.Planet, AstronomicalCatalog.Messier],
  },

  [QuizDifficulty.Hard]: {
    catalogs: [
      AstronomicalCatalog.Planet,
      AstronomicalCatalog.Messier,
      AstronomicalCatalog.Hipparcos,
      AstronomicalCatalog.Caldwell,
      AstronomicalCatalog.NGC,
    ],
  },
};
