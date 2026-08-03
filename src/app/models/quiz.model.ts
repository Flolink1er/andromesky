import {
  AstronomicalCatalog,
  AstronomicalObjectType,
  IAstronomicalObject,
} from './astronomical-object.model';

export enum QuizMode {
  GuessObject = 'guess-object',

  LocateObject = 'locate-object',

  SpaceGuessR = 'space-guessr',
}

export enum QuizState {
  Settings,
  Running,
  Finished,
}

export interface IQuizSettings {
  mode: QuizMode;

  difficulty: QuizDifficulty;

  questionCount: number;
}

export interface QuizQuestion {
  label: string;

  correctAnswer: IAstronomicalObject;

  choices?: IAstronomicalObject[];
}

export enum QuizDifficulty {
  Easy,
  Medium,
  Hard,
}

const QUIZ_CONFIGURATION = {
  [QuizDifficulty.Easy]: {
    catalogs: [AstronomicalCatalog.Messier],
    allowConstellations: true,
  },

  [QuizDifficulty.Medium]: {
    catalogs: [AstronomicalCatalog.Messier, AstronomicalCatalog.Hipparcos],
    allowConstellations: true,
  },

  [QuizDifficulty.Hard]: {
    catalogs: Object.values(AstronomicalCatalog),
    allowConstellations: true,
  },
};
