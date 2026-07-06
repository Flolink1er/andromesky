export interface AstronomicalObject {
  target: string; //sert pour l'instant d'id car unique et est en même temps utilisé par aladin pour

  name: string;

  description: string;

  type: AstronomicalType;

  constellation?: string; //plus tard pourra être un type spécifique, soit un enum soit un AstronomicalObject de type constellation

  magnitude?: number;

  imageUrl?: string;

  ra?: number;
  dec?: number;
}

export enum AstronomicalType {
  Galaxy = 'Galaxy',
  Nebula = 'Nebula',
  Star = 'Star',
  Constellation = 'Constellation',
}
