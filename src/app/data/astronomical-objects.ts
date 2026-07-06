import { AstronomicalObject, AstronomicalType } from '../models/astronomical-object.model';

export const ASTRONOMICAL_OBJECTS: AstronomicalObject[] = [
  {
    target: 'M42',

    name: "Nébuleuse d'Orion",

    description: "Nébuleuse diffuse située dans la constellation d'Orion.",

    type: AstronomicalType.Nebula,

    constellation: 'Orion',

    magnitude: 4,

    ra: 83.822,
    dec: -5.391,
  },

  {
    target: 'M31',

    name: "Galaxie d'Andromède",

    description: 'Galaxie spirale la plus proche de la Voie Lactée.',

    type: AstronomicalType.Galaxy,

    constellation: 'Andromeda',

    magnitude: 3.44,

    ra: 10.6847,
    dec: 41.269,
  },

  {
    target: 'M45',

    name: 'Les Pléiades',

    description: 'Amas ouvert visible dans la constellation du Taureau.',

    type: AstronomicalType.Star,

    constellation: 'Taurus',

    magnitude: 1.6,

    ra: 56.75,
    dec: 24.1167,
  },
];
