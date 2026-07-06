export interface Score {
  points: number;
}

export enum ScoreEvent {
  QUIZ_CORRECT = 10,

  QUIZ_FAST_CORRECT = 15,

  QUIZ_WRONG = -2,

  SPACE_GUESSR_CLOSE = 50,

  SPACE_GUESSR_MEDIUM = 20,

  SPACE_GUESSR_FAR = 5,
}
