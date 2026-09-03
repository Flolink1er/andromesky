# AndromeSky — guide technique de présentation

Ce document décrit les fichiers importants de l'application. Il est conçu comme une aide à la préparation de la défense : pour chaque élément, il précise sa responsabilité et les méthodes à pouvoir expliquer.

## Vue d'ensemble

AndromeSky est une SPA Angular. Les **composants** affichent l'interface et transmettent les interactions ; les **services** centralisent l'état, la logique métier, les données et les appels HTTP ; les **modèles** définissent les structures TypeScript ; les **helpers** regroupent des fonctions pures réutilisables ; les **constantes** regroupent les règles de score et de filtrage.

Les données astronomiques de base sont chargées localement depuis `public/data`. Les APIs NASA et Wikipédia enrichissent les fiches sans être nécessaires à la navigation de base.

---

# Fichiers racine de l'application

## `src/app/app.ts`, `app.html` et `app.css` — composant racine

**Responsabilité.** Ce composant assemble l'application : barre de navigation, panneau latéral, SkyMap, recherche et changement de mode. Il conserve aussi l'objet sélectionné et sait interpréter un clic sur la carte.

**Éléments importants.**

- `currentObject` est un `computed` dérivé de l'index sélectionné. Au chargement, cet index vaut `-1` : aucun objet n'est donc sélectionné et aucun libellé mobile n'apparaît.
- Les `effect` synchronisent les changements d'état du quiz avec la SkyMap : en QCM, l'objet demandé est centré ; en localisation, les marqueurs précédents sont nettoyés.
- `changeMode()` bascule entre exploration et quiz, réinitialise les éléments visuels devenus inutiles et ouvre le panneau quand nécessaire.
- `onSkyClick()` distingue un clic d'exploration d'une sélection de position en quiz de localisation. Il délègue ensuite la création du marqueur à `SkyMapService`.
- `confirmQuizLocation()` et `useLocationHint()` relient le panneau mobile aux règles du quiz et au retour visuel de la carte.

**À retenir.** Le composant racine orchestre les composants, mais les règles de quiz, de score et d'affichage astronomique restent dans des services dédiés.

## `src/app/app.config.ts` et `app.routes.ts` — configuration Angular

**Responsabilité.** `app.config.ts` enregistre les fournisseurs globaux, dont `HttpClient`. `app.routes.ts` contient actuellement une liste de routes vide.

**Pourquoi pas de routes ?** Exploration et quiz ne sont pas des pages indépendantes : ils partagent la même SkyMap et le même état. Le changement est donc géré par `AppStateService`. Le Router deviendrait pertinent pour des URLs comme `/objet/M42`, un profil ou un historique distant.

---

# Composants

## `components/header/` — `Header`

**Responsabilité.** Affiche le logo, le nom de l'application, la zone de recherche projetée avec `ng-content` et les boutons « Exploration » / « Quiz ».

**Méthodes importantes.** `toExploration()` et `toQuiz()` émettent un événement `changeMode`. Le composant ne décide pas lui-même de la logique à exécuter : le parent reçoit l'événement.

**Fichiers associés.** `header.html` décrit la structure responsive ; `header.css` est volontairement minimal car l'essentiel du style est réalisé avec les classes utilitaires Tailwind ; `header.spec.ts` est un test de création du composant.

## `components/search-bar/` — `SearchBar`

**Responsabilité.** Gère la saisie utilisateur, les suggestions et la sélection d'un objet.

**Méthodes importantes.** La valeur du `FormControl` est observée afin d'actualiser les résultats ; `onKeyDown()` gère la navigation au clavier ; `select()` émet l'objet choisi au composant racine. La recherche elle-même est déléguée à `AstronomicalObjectService`.

**Sécurité.** La saisie est comparée localement et affichée via les templates Angular, qui échappent le HTML. Elle n'est pas injectée dans du `innerHTML` ni dans une requête SQL.

## `components/sky-map/` — `SkyMap`

**Responsabilité.** Héberge l'élément DOM d'Aladin Lite et transmet les clics de carte au composant racine.

**Méthodes importantes.** `ngAfterViewInit()` initialise la bibliothèque uniquement après la création du conteneur DOM. `onPointerDown()` et `onPointerMove()` détectent un déplacement réel, avec un seuil de quelques pixels, afin d'activer l'ombre visuelle de déplacement sans l'activer sur un clic simple. `stopDragging()` nettoie cet état au relâchement du pointeur, même hors de la carte.

**Fichiers associés.** `sky-map.html` contient le conteneur `#aladin-lite-div`. `sky-map.css` gère le cadre, l'ombre et l'effet discret lors d'un glissement. Le service reste responsable des données et overlays Aladin.

## `components/side-panel/` — `SidePanel`

**Responsabilité.** Est le conteneur latéral unique de l'application. Il affiche soit les informations d'un objet, soit la configuration du quiz, une question ou les résultats.

**Méthodes importantes.** `startQuiz()` choisit le mode de quiz demandé ; `restartQuiz()` et `backToExploration()` communiquent au parent le changement de mode ; `toPreviousObject()` et `toNextObject()` transmettent la navigation entre objets.

**Comportement responsive.** Sur mobile, l'en-tête avec le bouton de fermeture est hors de la zone de défilement. Seul le contenu du panneau défile : les éléments ne passent donc plus derrière le titre.

## `components/object-panel/` — `ObjectPanel`

**Responsabilité.** Affiche la fiche de l'objet sélectionné : nom, description locale, type, constellation, catalogue, image NASA et résumé Wikipédia.

**Méthodes importantes.** Un `effect` observe `currentObject`. À chaque changement, il annule les anciennes souscriptions, réinitialise l'affichage et demande l'image et le résumé. `constellation` est un `computed` qui retrouve la constellation liée. `getWikipediaExcerpt()` limite un texte trop long et `toggleWikipediaExcerpt()` gère le bouton « Voir plus ».

**Point important.** En l'absence de sélection, le composant n'appelle aucune API et affiche simplement un état vide.

## `components/quiz-settings/` — `QuizSettings`

**Responsabilité.** Permet de choisir le mode, la difficulté et le nombre de questions. Il affiche aussi les règles adaptées au mode choisi et l'historique local.

**Méthodes importantes.** `startQuiz()` construit l'objet `IQuizSettings` à partir des formulaires puis le transmet au panneau. `toggleHistory()` bascule entre configuration et historique. `formatMode()` et `formatDifficulty()` rendent les enums lisibles pour l'utilisateur. `clearHistory()` délègue la suppression à `ScoreService`.

## `components/quiz-questions/` — `QuizQuestions`

**Responsabilité.** Affiche la question en cours et ses actions : choix QCM, indice, clic de localisation, validation et retour visuel.

**Méthodes importantes.** `answerQuestion()` enregistre un choix puis passe à la question suivante après le délai nécessaire à la lecture du retour. `useGuessHint()` retire une proposition incorrecte. `useLocationHint()` affiche une zone d'indice sur la carte. `confirmLocation()` valide le point sélectionné, déclenche l'affichage de la bonne position et de la ligne d'écart.

**Retour rapide.** Quand `QuizService.fastAnswer()` est vrai, le template affiche le bandeau « Réponse éclair », correspondant à une bonne réponse en moins de cinq secondes.

## `components/quiz-results/` — `QuizResults`

**Responsabilité.** Présente le bilan de la partie terminée : score, nombre de bonnes réponses, taux de réussite, réponses éclair et message de résultat.

**Fonctionnement.** Il reçoit toutes les valeurs via des `input` en lecture seule et émet seulement `restartQuiz` ou `backToExploration`. Il ne calcule donc pas le score lui-même.

## `components/svg-icon/` — `SvgIcon`

**Responsabilité.** Charge et insère les SVG locaux, notamment le logo AndromeSky, sans dupliquer le code SVG dans les templates.

**Méthodes importantes.** Le composant reçoit le nom de l'icône et des classes éventuelles en `input`, puis charge l'asset via `HttpClient`. Il est utilisé dans la barre de navigation.

---

# Services

## `services/app-state.service.ts` — `AppStateService`

**Responsabilité.** Centralise le mode global de l'application : exploration, quiz ou mode SpaceGuessR prévu.

**État exposé.** `_mode` reste privé et `mode` est exposé avec `asReadonly()`. Les `computed` `isQuiz`, `isExploration` et `isSpaceGuessR` donnent une lecture claire aux composants.

**Méthodes importantes.** `setMode()` effectue le changement ; `startQuiz()`, `startExploration()` et `startSpaceGuessR()` sont des raccourcis métier ; `reset()` revient à l'exploration.

## `services/json-loader.service.ts` — `JsonLoaderService`

**Responsabilité.** Fournit un point unique pour charger les fichiers JSON situés dans `public/data`.

**Méthodes importantes.** `load<T>()` charge un fichier typé ; `loadMany<T>()` combine plusieurs requêtes avec `forkJoin` et ne répond que lorsque tous les fichiers sont disponibles.

## `services/catalog-loader.service.ts` — `CatalogLoaderService`

**Responsabilité.** Déclare les catalogues locaux activés et les charge dans un seul tableau d'objets astronomiques.

**Méthode importante.** `loadCatalogs()` filtre les définitions activées, appelle `JsonLoaderService.loadMany()` et aplati les tableaux. Les catalogues actuellement chargés sont Messier, Hipparcos, Bright Star Catalogue et les étoiles nécessaires aux segments (`hipparcos-lines`).

## `services/astronomical-object.service.ts` — `AstronomicalObjectService`

**Responsabilité.** Gère le catalogue utilisable par l'interface : chargement, recherche, sélection de proximité et génération des questions de quiz.

**Méthodes importantes.**

- `findNearestObject()` cherche l'objet le plus proche d'une coordonnée, avec une distance maximale afin d'éviter une sélection imprécise.
- `findByTarget()` retrouve un objet par son identifiant Aladin.
- `search()` compare une requête normalisée au nom, à la cible, au type, à la constellation et aux alias ; le résultat est limité à huit suggestions.
- `generateQuizQuestions()` sélectionne des objets, prépare les fausses propositions et crée les structures `QuizQuestion`.
- `getObjectsForDifficulty()` applique les règles de difficulté : facile = objets Messier au nom distinctif ; moyen = objets au nom distinctif ; difficile = catalogue entier.

## `services/constellation.service.ts` — `ConstellationService`

**Responsabilité.** Charge les définitions de constellations et fournit leur recherche par identifiant.

**Méthodes importantes.** `loadConstellations()` fusionne `constellations.json` et `constellations-extra.json` dans un signal. `findById()` récupère la constellation associée à un objet, notamment pour demander à la SkyMap de tracer ses segments.

## `services/sky-map.service.ts` — `SkyMapService`

**Responsabilité.** Encapsule Aladin Lite : initialisation, navigation, clics, protection contre les clics pendant un glissement et overlays visuels.

**Méthodes importantes.**

- `initializeMap()` configure Aladin Lite, désactive les contrôles inutiles, bloque le menu contextuel et crée les catalogues / overlays de marqueurs.
- `registerClickHandler()` ignore les faux clics générés après un drag puis transmet les coordonnées utiles.
- `goToObject()` centre la carte sur un objet, crée son marqueur cyan et trace sa constellation. Son second paramètre permet de décaler le centrage en QCM mobile afin de garder l'objet visible au-dessus du panneau de réponses.
- `showSelectionMarker()` affiche le losange doré et son anneau pour une pré-sélection en localisation.
- `showLocationFeedback()` affiche la bonne position en vert, son anneau et une ligne jusqu'au clic de l'utilisateur.
- `showLocationHint()` crée un anneau violet décalé contenant l'objet sans le révéler exactement. Si la carte est trop zoomée, elle revient d'abord à un champ minimal de 120° afin de préserver une zone d'indice utile.
- Les méthodes `clear…()` retirent les overlays devenus obsolètes lors d'un changement de question ou de mode.

## `services/quiz.service.ts` — `QuizService`

**Responsabilité.** Contient tout l'état et toutes les règles d'une partie de quiz.

**État exposé.** Les signals privés (`_state`, `_questions`, `_selectedAnswer`, `_selectedLocation`, etc.) sont rendus accessibles en lecture seule. Les composants peuvent les afficher mais ne peuvent pas les modifier directement.

**Méthodes importantes.**

- `startGuessQuiz()` et `startLocateQuiz()` demandent des questions à `AstronomicalObjectService` puis appellent `startQuiz()`.
- `submitAnswer()` compare la réponse à la cible attendue, mesure le temps écoulé et enregistre une réponse rapide si elle est correcte en moins de cinq secondes.
- `selectLocation()` mémorise le clic de l'utilisateur ; `submitLocation()` calcule la distance angulaire jusqu'à la cible, attribue un palier de précision et prépare le résultat visuel. Cette validation ne dépend pas de l'objet voisin le plus proche.
- `activateGuessHint()` retire une fausse réponse ; `activateLocationHint()` active la règle d'indice. Dans les deux cas, le multiplicateur de score passe à 0,5.
- `nextQuestion()` réinitialise les éléments temporaires et passe à la question suivante ; `stopQuiz()` finalise la partie.

## `services/score.service.ts` — `ScoreService`

**Responsabilité.** Calcule le score, les séries, le taux de réussite et conserve l'historique dans le `localStorage`.

**Méthodes importantes.**

- `addEvent()` applique un événement de score (`QuizCorrect`, `QuizFastCorrect` ou `QuizWrong`), met à jour les bonnes réponses, la série et le compteur de réponses éclair.
- `startGame()` crée une nouvelle partie ; `finishGame()` calcule le taux de réussite puis sauvegarde l'entrée d'historique.
- `saveScore()` limite l'historique à cinquante parties ; `loadScore()` relit le navigateur et maintient la compatibilité avec les anciennes entrées qui ne possédaient pas encore `fastAnswers`.
- `resultMessage` est un `computed` qui adapte le message final au taux de réussite.

## `services/nasa-image.service.ts` — `NasaImageService`

**Responsabilité.** Recherche une image NASA pertinente pour l'objet sélectionné.

**Méthodes importantes.** `searchImage()` consulte d'abord le cache, puis cherche avec le nom anglais et les alias jusqu'à trouver un résultat valide. `findBestItem()` compare les candidats et impose un score minimal. `calculateScore()` privilégie un titre correspondant, les alias et les images Hubble ; les concepts artistiques sont rejetés.

## `services/wikipedia.service.ts` — `WikipediaService`

**Responsabilité.** Récupère un résumé Wikipédia français tout en évitant les homonymies et résultats génériques.

**Méthodes importantes.**

- `searchSummary()` consulte le cache puis exécute plusieurs stratégies de recherche jusqu'au premier résumé validé.
- `buildSearchStrategies()` combine nom anglais, nom français, termes liés au type astronomique, identifiant de catalogue et alias.
- `findBestPage()` retient la page avec le meilleur score, mais exige aussi une correspondance d'identité forte dans le titre.
- `calculateScore()` attribue des bonus pour les titres, alias, termes astronomiques et catégories pertinentes, et pénalise les faux positifs.
- `isGenericCatalogArticle()` rejette par exemple « Catalogue Messier » pour un objet M précis. `getIdentityTerms()` et `titleMatchesIdentity()` évitent qu'une galaxie célèbre, comme Andromède, soit affichée pour un autre objet.

---

# Helper

## `helpers/wiki.helper.ts`

**Responsabilité.** Regroupe des fonctions pures utilisées par le filtrage Wikipédia. Elles ne possèdent pas d'état, ne font pas d'appel HTTP et sont donc adaptées à un helper plutôt qu'à un service.

**Fonctions importantes.** `normalize()` supprime les accents et uniformise la casse. `getIntroduction()` extrait la première phrase. `isDisambiguation()` détecte les pages d'homonymie. `getCategories()`, `hasAstronomyCategory()` et `hasForbiddenCategory()` exploitent les catégories. `containsAny()` et `countMatches()` facilitent le calcul du score. `equalsNormalized()` compare deux termes de façon tolérante.

---

# Modèles

## `models/app-mode.model.ts`

**Responsabilité.** L'enum `AppMode` définit les modes reconnus : exploration, quiz et SpaceGuessR prévu. Il évite l'utilisation de chaînes de caractères dispersées dans le code.

## `models/astronomical-object.model.ts`

**Responsabilité.** Définit la structure centrale `IAstronomicalObject` : identifiant `target`, noms, alias de recherche, description, coordonnées, magnitude, type, catalogue et constellation éventuelle.

**Autres types.** `AstronomicalObjectType` et `AstronomicalCatalog` standardisent les valeurs utilisées dans les données. `ICatalogDefinition` décrit un fichier de catalogue. `IConstellation` et `IConstellationSegment` représentent une constellation et ses liens entre deux cibles.

## `models/nasa-image.model.ts`

**Responsabilité.** Sépare la structure d'image exploitée par l'application (`IAstronomicalImage`) des structures brutes renvoyées par la NASA (`INasaSearchResponse`, `INasaItem`, `INasaData`). Cela évite de propager la forme d'une API externe dans l'interface.

## `models/quiz.model.ts`

**Responsabilité.** Décrit les modes de quiz, leurs états, les réglages demandés et une question générée.

**Types importants.** `QuizMode`, `QuizState`, `QuizDifficulty`, `IQuizSettings` et `QuizQuestion`. La configuration déclarée en bas du fichier formalise les intentions de difficulté, même si la sélection effective est aujourd'hui appliquée dans `AstronomicalObjectService`.

## `models/score.model.ts`

**Responsabilité.** Formalise le score courant (`IGameScore`), une entrée d'historique (`IScoreHistory`) et les valeurs de points (`ScoreEvent`).

**Données importantes.** Le modèle courant contient les séries, le nombre de réponses éclair et les dates de partie. L'historique conserve uniquement les informations utiles à l'affichage : mode, difficulté, score, réussite, bonnes réponses, meilleure série et réponses éclair.

## `models/wiki.model.ts`

**Responsabilité.** Décrit à la fois le résumé final affichable (`IWikipediaSummary`) et les objets bruts reçus de l'API MediaWiki (`IWikipediaResponse`, `IWikipediaPage`, `IWikipediaCategory`).

**Autres types.** `IWikipediaSearchResult` associe une page à son score ; `IWikipediaSearchStrategy` décrit une requête et sa priorité ; `IWikipediaScoreContext` est prévu pour porter un contexte de calcul réutilisable.

---

# Constantes

## `constants/wiki.constant.ts`

**Responsabilité.** Centralise les règles de pertinence Wikipédia afin de pouvoir les ajuster sans modifier l'algorithme du service.

**Éléments importants.**

- `MINIMUM_ACCEPTED_SCORE` vaut 700 : une page insuffisamment pertinente est ignorée.
- `SCORE` définit les bonus et pénalités : titre exact, alias, extrait, catégorie astronomique, mot ou catégorie interdite.
- `ASTRONOMY_KEYWORDS` et `ASTRONOMY_CATEGORIES` servent à reconnaître un résultat lié à l'astronomie.
- `FORBIDDEN_WORDS` et `FORBIDDEN_CATEGORIES` évitent les homonymies culturelles, géographiques ou commerciales.
- `DISAMBIGUATION_PATTERNS` détecte les formulations habituelles des pages d'homonymie.

---

# Données locales importantes

## `public/data/*.json`

Les fichiers `messier.json`, `hipparcos.json`, `bright-stars.json` et `hipparcos-lines.json` contiennent les objets locaux. Ils sont chargés au démarrage et permettent la recherche, les quiz et les tracés sans dépendre d'une API. Les fichiers `constellations.json` et `constellations-extra.json` contiennent les segments. Un segment doit obligatoirement référencer les valeurs `target` réellement présentes dans les catalogues ; par exemple Sirius utilise actuellement `HR 2491`.

## `public/icons/andromeSky-logo.svg`

Logo de l'application, utilisé par le composant d'icône et comme favicon dans `src/index.html`.

---

# Lecture rapide pour la défense

Pour expliquer l'architecture en une phrase : **« Les composants affichent et relaient les interactions ; les services portent les règles et l'état partagé ; les modèles sécurisent les données TypeScript ; les helpers réalisent des traitements purs ; les constantes rendent les règles de filtrage ajustables. »**
