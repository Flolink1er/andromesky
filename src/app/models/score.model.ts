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
  fastAnswers: number;

  startedAt: Date;
  finishedAt?: Date;
}

export interface IScoreHistory extends IScore {
  id: string;
  date: string;
  mode: QuizMode;
  difficulty: QuizDifficulty;
  successRate: number;
  correctAnswers: number;
  totalQuestions: number;
  bestStreak: number;
  fastAnswers: number;
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
