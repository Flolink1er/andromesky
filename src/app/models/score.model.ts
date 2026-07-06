export interface Score {
  points: number;
}

export enum ScoreEvent {
  QuizCorrect = 10,

  QuizFastCorrect = 15,

  QuizWrong = -2,

  SPACE_GUESSR_CLOSE = 50,

  SPACE_GUESSR_MEDIUM = 20,

  SPACE_GUESSR_FAR = 5,
}
