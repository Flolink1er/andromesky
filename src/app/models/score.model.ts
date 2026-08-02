export interface IScore {
  totalScore: number;

  correctAnswers: number;

  wrongAnswers: number;

  currentStreak: number;

  bestStreak: number;

  quizzesPlayed: number;

  averageResponseTime: number;
}
export enum ScoreEvent {
  QuizCorrect = 10,
  QuizFastCorrect = 15,
  QuizWrong = 0,

  SpaceGuessrClose = 50,
  SpaceGuessrMedium = 20,
  SpaceGuessrFar = 5,
}
