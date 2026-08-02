export interface IAstronomicalObject {
  target: string; //id utilisé par aladin

  name: string; //nom dans l'app

  englishName: string; //nom anglais

  searchTerms: string[]; //alias utiles dans les recherches via des APIs

  description: string;

  type: AstronomicalObjectType;

  catalog: AstronomicalCatalog;

  constellationId?: string;

  magnitude?: number;

  imageUrl?: string;

  ra?: number;
  dec?: number;
}

export enum AstronomicalObjectType {
  Galaxy = 'Galaxie',
  Nebula = 'Nebuleuse',
  OpenCluster = 'Amas Ouvert',
  GlobularCluster = 'Amas Globulaire',
  PlanetaryNebula = 'Nébuleuse Planètaire',
  SupernovaRemnant = 'Rémanent de Supernova',
  Star = 'Étoile',
  Planet = 'Planète',
  Asterism = 'Astérisme',
  Constellation = 'Constellation',
}

export enum AstronomicalCatalog {
  Messier = 'Messier',
  NGC = 'NGC',
  Caldwell = 'Caldwell',
  Hipparcos = 'Hipparcos',
  Planet = 'Planet',
}

export interface ICatalogDefinition {
  catalog: AstronomicalCatalog;
  file: string;
  enabled: boolean;
}

export interface IConstellation {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  type: AstronomicalObjectType.Constellation;

  segments: IConstellationSegment[];
}

export interface IConstellationSegment {
  fromTarget: string;
  toTarget: string;
}
