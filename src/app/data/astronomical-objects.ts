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
    type: AstronomicalType.Cluster,
    constellation: 'Taurus',
    magnitude: 1.6,
    ra: 56.75,
    dec: 24.1167,
  },

  {
    target: 'M13',
    name: "Amas d'Hercule",
    description: "L'un des plus grands amas globulaires du ciel boréal.",
    type: AstronomicalType.Cluster,
    constellation: 'Hercules',
    magnitude: 5.8,
    ra: 250.423,
    dec: 36.461,
  },

  {
    target: 'M57',
    name: "Nébuleuse de l'Anneau",
    description: 'Nébuleuse planétaire célèbre située dans la Lyre.',
    type: AstronomicalType.Nebula,
    constellation: 'Lyra',
    magnitude: 8.8,
    ra: 283.396,
    dec: 33.03,
  },

  {
    target: 'M8',
    name: 'Nébuleuse de la Lagune',
    description: 'Grande nébuleuse diffuse visible dans le Sagittaire.',
    type: AstronomicalType.Nebula,
    constellation: 'Sagittarius',
    magnitude: 6.0,
    ra: 270.925,
    dec: -24.38,
  },

  {
    target: 'M51',
    name: 'Galaxie du Tourbillon',
    description: 'Galaxie spirale en interaction avec une galaxie compagne.',
    type: AstronomicalType.Galaxy,
    constellation: 'Canes Venatici',
    magnitude: 8.4,
    ra: 202.484,
    dec: 47.23,
  },

  {
    target: 'M81',
    name: 'Galaxie de Bode',
    description: 'Grande galaxie spirale visible dans la Grande Ourse.',
    type: AstronomicalType.Galaxy,
    constellation: 'Ursa Major',
    magnitude: 6.9,
    ra: 148.888,
    dec: 69.065,
  },

  {
    target: 'M1',
    name: 'Nébuleuse du Crabe',
    description: "Vestige d'une supernova observée en 1054.",
    type: AstronomicalType.Nebula,
    constellation: 'Taurus',
    magnitude: 8.4,
    ra: 83.633,
    dec: 22.0145,
  },

  {
    target: 'M27',
    name: 'Nébuleuse Dumbbell',
    description: 'Première nébuleuse planétaire découverte.',
    type: AstronomicalType.Nebula,
    constellation: 'Vulpecula',
    magnitude: 7.5,
    ra: 299.901,
    dec: 22.721,
  },
];
