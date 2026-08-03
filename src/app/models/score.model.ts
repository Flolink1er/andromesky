import { QuizMode, QuizDifficulty } from './quiz.model';

export interface IScore {
  score: number;
}

export interface IGameScore extends IScore {
  nbQuestions: number;
  successRate: number;

  correctAnswers: number;
  wrongAnswers: number;

  currentStreak: number;
  bestStreak: number;

  startedAt: Date;
  finishedAt?: Date;
}

export interface IScoreHistory extends IScore {
  date: Date;
  mode: QuizMode;
  difficulty: QuizDifficulty;
}

export interface IPlayerStatistics {
  totalScore: number;
  bestScore: number;
  gamesPlayed: number;
}

export enum ScoreEvent {
  QuizCorrect = 10,
  QuizFastCorrect = 15,
  QuizWrong = 0,

  SpaceGuessrClose = 50,
  SpaceGuessrMedium = 20,
  SpaceGuessrFar = 5,
}
