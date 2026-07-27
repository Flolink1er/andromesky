export interface IAstronomicalObject {
  target: string; //sert pour l'instant d'id car unique et est en même temps utilisé par aladin pour

  name: string;

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
  Galaxy = 'Galaxy',
  Nebula = 'Nebula',
  OpenCluster = 'OpenCluster',
  GlobularCluster = 'GlobularCluster',
  PlanetaryNebula = 'PlanetaryNebula',
  SupernovaRemnant = 'SupernovaRemnant',
  Star = 'Star',
  Planet = 'Planet',
  Asterism = 'Asterism',
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

  segments: IConstellationSegment[];
}

export interface IConstellationSegment {
  fromTarget: string;
  toTarget: string;
}
