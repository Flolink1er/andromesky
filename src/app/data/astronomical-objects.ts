export interface AstronomicalObject {

  name: string;

  desc: string;

  target: string;
}

export const ASTRONOMICAL_OBJECTS: AstronomicalObject[] = [

  {
    name: "Nébuleuse d'Orion",
    desc: "Nébulseuse diffuse localisé près d'Orion",
    target: "M42"
  },

  {
    name: "Galaxie d'Andromède",
    desc: "Galaxie la plus proche de la Voie Lactée",
    target: "M31"
  },

  {
    name: "Les Pléiades",
    desc: "Amas ouvert d'étoile présente dans la constellation de Taurus",
    target: "M45"
  }
];
