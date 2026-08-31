# AndromeSky

**AndromeSky** est une application web d'exploration du ciel conçue dans le cadre de mon travail de fin d'études (TFE) à l'IFAPME. Elle permet de découvrir des objets astronomiques sur une carte interactive, d'en consulter les informations et de tester ses connaissances au moyen de quiz.

## Démo en ligne

L'application est accessible à l'adresse suivante :

[https://flolink1er.github.io/andromesky/](https://flolink1er.github.io/andromesky/)

## Fonctionnalités

- Carte du ciel interactive, propulsée par Aladin Lite ;
- Catalogue enrichi d'objets astronomiques, d'étoiles et de constellations ;
- Recherche d'objets et affichage de leurs positions sur la carte ;
- Panneau d'information avec contenus issus de Wikipédia et images de la NASA ;
- Mode exploration guidée ;
- Quiz pour deviner un objet ou le localiser sur la carte ;
- Indices, score et retour visuel sur les réponses ;
- Interface responsive, utilisable sur ordinateur comme sur mobile.

## Technologies utilisées

- [Angular](https://angular.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Aladin Lite](https://aladin.cds.unistra.fr/AladinLite/)
- [Tailwind CSS](https://tailwindcss.com/)
- API Wikipédia et [NASA Image and Video Library](https://images.nasa.gov/)

## Lancer le projet localement

### Prérequis

- Node.js 20 ou version ultérieure
- npm

### Installation

```bash
git clone https://github.com/Flolink1er/andromesky.git
cd andromesky
npm install
npm start
```

L'application est alors disponible sur `http://localhost:4200/`.

## Construire la version de production

```bash
npm run build
```

Les fichiers générés sont placés dans le dossier `dist/`.

## Sources de données

Les catalogues locaux regroupent des objets Messier, des étoiles et les tracés de constellations. Les informations complémentaires affichées dans l'application sont récupérées à la demande auprès de Wikipédia et de la bibliothèque d'images de la NASA.
