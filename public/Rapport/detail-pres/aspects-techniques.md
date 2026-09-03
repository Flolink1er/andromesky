# AndromeSky — aspects techniques à expliquer

Ce document complète `guide-technique.md`. Il ne reprend pas chaque fichier : il explique les mécanismes les plus intéressants à présenter techniquement, leur raison d'être et les compromis faits dans l'application.

## 1. Une SPA Angular avec un état réactif

AndromeSky est une **Single Page Application** : l'interface reste chargée dans le navigateur et Angular affiche les écrans ou panneaux selon l'état courant. Il n'y a donc pas de rechargement de page entre le mode exploration, les paramètres du quiz, les questions et les résultats.

### Les `signal` Angular

L'état évolutif est stocké dans des `signal`. Un signal est une valeur observable par Angular : dès qu'elle change, les parties de l'interface qui la lisent sont automatiquement mises à jour.

Exemples :

- `QuizService` stocke l'état du quiz, la question courante, la réponse sélectionnée, l'indice utilisé et le retour de localisation ;
- `ScoreService` stocke le score de la partie et l'historique ;
- `AstronomicalObjectService` stocke le catalogue une fois chargé ;
- `AppComponent` stocke l'index de l'objet sélectionné et l'ouverture du panneau.

Le service garde le signal modifiable privé (`_state`, `_questions`, `_game`, …) et n'expose que `asReadonly()` aux composants. C'est une encapsulation : les composants peuvent lire l'état, mais seuls les services métiers ont le droit de le modifier par une méthode nommée, comme `startQuiz`, `submitAnswer` ou `finishGame`.

Les `computed` sont des valeurs dérivées, sans stockage redondant. Par exemple, `currentQuestion` est déduite de la liste de questions et de son index ; `progress` et `successRate` sont déduits des réponses et du nombre total. Cela évite de devoir synchroniser manuellement plusieurs variables qui représentent la même information.

Les `effect` du composant racine observent notamment une nouvelle question et pilotent la SkyMap : en QCM, la carte se centre sur la bonne réponse ; en localisation, les éléments temporaires sont nettoyés. Ce découplage permet de garder la logique de quiz indépendante du rendu Aladin.

**Point à défendre.** Les `signal` ont été choisis pour l'état local partagé de l'application parce qu'ils sont légers, typés et intégrés directement au cycle de rendu Angular. Les appels HTTP restent, eux, sous forme d'`Observable` RxJS, plus adaptés aux flux asynchrones et à leurs opérateurs.

## 2. Composition de l'interface et communication entre composants

Les composants Angular sont autonomes (`standalone`). Le composant racine assemble `Header`, `SearchBar`, `SkyMap` et `SidePanel`. Les communications simples passent par :

- des **inputs** pour faire descendre les données, par exemple l'objet sélectionné vers le panneau ;
- des **outputs** pour faire remonter une action, par exemple une sélection de recherche, un clic sur la carte ou une fermeture de panneau ;
- des services injectés quand l'état doit être commun à plusieurs composants, comme le quiz et le score.

Cette séparation évite qu'un composant de présentation doive connaître toute la logique de données. Le panneau d'objet demande une description Wikipédia à `WikipediaService`, tandis que le composant de question délègue la validation à `QuizService`.

`app.routes.ts` est volontairement vide : l'application ne comporte pas de pages indépendantes avec URL dédiée. Les vues exploration, paramètres, question et résultat sont des états d'une seule expérience. Dans ce contexte, ajouter un `RouterLink` et des routes aurait augmenté la complexité sans bénéfice fonctionnel immédiat. Si une future version ajoutait profils publics, pages d'objet partageables ou un classement, le Router deviendrait pertinent.

## 3. Intégration d'Aladin Lite : une bibliothèque externe impérative

La carte est fournie par **Aladin Lite**, une bibliothèque JavaScript d'astronomie qui pilote directement le DOM et un canevas. Elle est donc différente du rendu déclaratif d'Angular. Le rôle de `SkyMapService` est d'isoler cette intégration : le reste de l'application ne manipule pas directement l'objet global `A` ni ses catalogues.

### Initialisation et couches graphiques

`initializeMap()` crée une vue Aladin avec le relevé DSS2 en couleur, cible Orion et un champ initial de 20 degrés. Les contrôles Aladin non nécessaires sont désactivés afin que l'interface conserve une identité visuelle cohérente.

Le service crée ensuite plusieurs couches distinctes :

| Couche | Rôle |
|---|---|
| `markerCatalog` | croix cyan de l'objet affiché ou sélectionné |
| `constellationOverlay` | segments et étoiles d'une constellation |
| `selectionCatalog` / `selectionOverlay` | pré-sélection dorée en quiz localisation |
| `currentObjectOverlay` | anneau cyan autour de l'objet |
| `locationResultCatalog` / `locationResultOverlay` | bonne position, anneau et ligne de correction |
| `locationHintOverlay` | zone d'indice violette |

Le fait de séparer les couches rend les nettoyages sûrs : effacer le marqueur de pré-sélection ne supprime ni la constellation ni le retour de réponse.

### Centrage et responsivité mobile

`goToObject(object, keepAboveBottomSheet)` utilise les coordonnées ascension droite/déclinaison de l'objet et appelle `gotoRaDec`. En QCM mobile, le panneau de réponses occupe le bas de l'écran ; le paramètre optionnel décale le centre de la déclinaison d'environ 20 % de la hauteur du champ de vision. L'objet reste ainsi visible au-dessus du panneau, sans modifier les coordonnées de l'objet.

Le rayon des anneaux est calculé en fonction du champ de vision actuel (`getFov`) et borné. À faible zoom, les marqueurs ne deviennent donc pas démesurés et ne cachent pas inutilement les objets voisins.

### Constellations et références de catalogue

Les segments de constellation utilisent des identifiants `target`, pas des coordonnées copiées. Pour chaque segment, `highlightConstellation()` retrouve les deux étoiles dans les catalogues chargés, puis crée une polyligne. Cela centralise les coordonnées dans les catalogues. La contrepartie est qu'un segment ne peut être dessiné que si ses deux identifiants correspondent exactement à ceux des données locales ; un décalage entre `HIP`, `HR` et un nom propre suffit à casser un trait.

La taille des étoiles affichées dans une constellation dépend de leur magnitude : une étoile brillante reçoit un rayon plus grand. C'est un compromis visuel utile pour lire le dessin sans simuler physiquement l'intensité lumineuse.

### Gestes, clics et clic droit

Aladin peut émettre un clic juste après la fin d'un glissement. Pour ne pas sélectionner un objet involontairement sur mobile :

1. le service mémorise les coordonnées du `pointerdown` ;
2. il calcule le déplacement avec `Math.hypot` à chaque `pointermove` ;
3. au-delà de 8 pixels, `didDrag` devient vrai ;
4. le gestionnaire de clic Aladin ignore alors cet événement ;
5. le flag est remis à faux après l'événement de clic, via `setTimeout(..., 0)`.

Ce petit délai est volontaire : Aladin déclenche son propre clic après le `pointerup`. Réinitialiser immédiatement aurait réintroduit le faux clic.

Les événements `pointerdown`, `mousedown` et `contextmenu` du bouton droit sont aussi interceptés en phase de capture pour empêcher le menu contextuel d'Aladin Lite. Cela évite une interaction technique qui n'a pas de place dans le parcours utilisateur.

## 4. Chargement des catalogues locaux et asynchronisme

Les données de base sont stockées en JSON dans `public/data` plutôt que demandées à une API à chaque ouverture. `JsonLoaderService` transforme un chemin en requête HTTP locale, puis `CatalogLoaderService` définit quels fichiers sont actifs et les charge en parallèle avec `forkJoin`.

`forkJoin` attend que toutes les requêtes soient terminées puis renvoie leurs résultats dans le même ordre. Les tableaux sont ensuite aplatis avec `flat()` pour obtenir une liste unique d'objets. `AstronomicalObjectService` écrit cette liste dans son signal `_objects`.

Ce choix apporte :

- un catalogue stable et disponible sans dépendre d'un serveur tiers ;
- des quiz cohérents avec les tracés de constellations ;
- des recherches instantanées une fois le chargement terminé ;
- un contrôle éditorial sur les noms, alias et difficultés.

Les API distantes restent réservées aux enrichissements non critiques : image NASA et résumé Wikipédia. Si elles échouent, la navigation, la carte et les quiz restent utilisables.

## 5. Recherche et sélection d'objet

`search()` normalise la requête et les champs recherchables : suppression des diacritiques Unicode, passage en minuscules, puis comparaison par inclusion. Une recherche comme « nebuleuse » retrouve donc « Nébuleuse », et un alias est aussi utilisable.

La recherche interroge le nom, l'identifiant de catalogue, la constellation, le type et `searchTerms`, puis limite l'affichage à huit résultats. Cette limite préserve la lisibilité de l'autocomplétion.

`findNearestObject()` est utilisé pour l'exploration. Il compare les coordonnées de l'utilisateur aux objets chargés et impose un rayon maximal de sélection de 3 degrés. Sans cette limite, le clic dans une zone vide sélectionnerait toujours « l'objet le moins éloigné », même à grande distance.

Il s'agit d'une distance euclidienne dans le plan RA/DEC, rapide et suffisante pour une interaction de proximité sur une carte. Pour un moteur astronomique de précision, il serait préférable d'utiliser partout la distance sur la sphère ; le quiz emploie précisément ce calcul pour son retour d'erreur.

## 6. Génération des quiz et filtrage de difficulté

`AstronomicalObjectService.generateQuizQuestions()` prend un nombre de questions, quatre propositions, une difficulté et un mode. Il filtre d'abord les objets possibles, tire les bonnes réponses de manière aléatoire, puis compose les fausses propositions sans jamais reprendre la bonne réponse.

Les difficultés ne sont pas seulement cosmétiques :

- **facile** : objets Messier possédant un nom distinctif ;
- **moyen** : tous les objets avec un nom distinctif ;
- **difficile** : ensemble du catalogue.

`hasDistinctiveName()` exclut les libellés purement techniques comme « Objet Messier Mxx », « Étoile HIP xxxx » ou « Étoile HR xxxx ». Le niveau difficile les conserve, car ils représentent une connaissance réelle de catalogue, tandis que les deux premiers niveaux restent plus pédagogiques.

Le mélange actuel emploie `sort(() => Math.random() - 0.5)`. C'est simple et très correct pour une petite liste de quiz, mais ce n'est pas un algorithme de permutation uniformément distribué. Une évolution possible serait une permutation de Fisher-Yates si la rigueur statistique ou un catalogue bien plus grand devenait nécessaire.

## 7. Évaluation du quiz localisation : géométrie sphérique

Le mode localisation ne dépend pas de l'objet de catalogue le plus proche : un clic est validé selon sa proximité avec la cible demandée. C'est plus juste lorsque plusieurs objets sont voisins dans le catalogue. L'écart angulaire donne à la fois le verdict et le retour visuel.

La formule utilisée est la loi des cosinus sphériques :

```text
cos(d) = sin(dec1) × sin(dec2)
       + cos(dec1) × cos(dec2) × cos(ra1 − ra2)
```

Les angles sont convertis en radians avant le calcul, puis `d` est reconverti en degrés. La valeur est bornée entre -1 et 1 avant `acos` afin d'éviter une erreur numérique lorsque les arrondis donnent très légèrement 1,000000…

Trois paliers de précision sont appliqués : jusqu'à 0,5° la position est très précise et vaut 50 points ; jusqu'à 1,5° elle vaut 20 points ; jusqu'à 3° elle reste acceptable et vaut 5 points. Au-delà, la réponse est considérée incorrecte. Après validation, `showLocationFeedback()` dessine la position correcte en vert, un anneau et une ligne depuis le clic. L'utilisateur ne voit donc pas seulement « faux », mais aussi la direction, la distance et les points de son erreur ou de sa réussite.

## 8. Indices et règle de score

Un indice en QCM retire une fausse proposition choisie au hasard. Un indice de localisation trace un anneau violet d'environ un quart de la carte. Si l'utilisateur avait trop zoomé, la carte revient d'abord à un champ minimal de 120 degrés : la zone reste exploitable et laisse une marge d'erreur réelle. Son centre est décalé aléatoirement autour de l'objet : la zone contient la réponse mais ne la place pas systématiquement au centre.

Le service de quiz garantit qu'un indice n'est utilisable qu'une fois et uniquement avant une réponse ou un retour de localisation. L'état `hintUsed` active un multiplicateur de `0.5`. Ce multiplicateur n'est appliqué qu'à un événement positif : une mauvaise réponse reste à zéro et ne produit donc pas un score négatif ou incohérent.

Une bonne réponse en moins de cinq secondes déclenche l'événement `QuizFastCorrect`, qui augmente le score et le compteur de réponses éclair. Cet indicateur donne un retour plus expressif sans affecter la logique de correction.

## 9. Score, séries et persistance locale

`ScoreService` centralise la mise à jour de la partie. Les événements de score sont décrits par l'énumération `ScoreEvent` ; `addEvent()` traite à la fois les points, les bonnes et mauvaises réponses, la série en cours, la meilleure série et les réponses éclair.

À la fin d'une partie, `finishGame()` calcule le taux de réussite, pose une date de fin et ajoute une entrée d'historique. Celle-ci est sérialisée avec `JSON.stringify` dans `localStorage` sous la clé `andromesky-score-history`.

L'historique est limité à 50 entrées : cette borne évite une croissance sans limite dans le navigateur. À la lecture, les données sont validées avant utilisation et les anciennes entrées qui ne possèdent pas encore `fastAnswers` reçoivent la valeur 0. C'est une petite stratégie de compatibilité ascendante : une évolution du modèle n'efface pas l'historique déjà présent.

`crypto.randomUUID()` génère l'identifiant de partie quand le navigateur le permet ; un identifiant fondé sur l'heure et une partie aléatoire sert de repli pour les environnements plus anciens.

Limite importante : `localStorage` est local au navigateur et à l'appareil. Il ne crée ni compte, ni synchronisation, ni classement partagé. Ce serait précisément le rôle d'un futur backend et d'une authentification.

## 10. Images NASA : recherche progressive, score et cache

`NasaImageService` interroge la NASA Image Library. Il essaie d'abord le nom anglais de l'objet, puis les alias `searchTerms`, dans l'ordre, grâce à `concat` et `concatMap`. Dès qu'une image satisfaisante est obtenue, `take(1)` arrête les recherches suivantes.

Les résultats NASA ne sont pas acceptés aveuglément. `calculateScore()` privilégie :

- le titre exact ou contenant le nom anglais ;
- les alias dans le titre ou la description ;
- les ressources Hubble ;
- et rejette les « artist concept », qui représentent une illustration plutôt qu'une observation.

Une image doit dépasser un score minimal de 10. Enfin, le résultat — y compris une absence de résultat — est mis en cache par `target`. Ainsi, rouvrir un même objet ne relance pas la requête réseau.

## 11. Wikipédia : éviter les résultats séduisants mais faux

L'API de recherche Wikipédia peut fournir une page astronomique plausible mais non liée à l'objet demandé. C'était particulièrement visible avec les objets Messier génériques ou les galaxies : un résultat pouvait parler du catalogue Messier ou de la galaxie d'Andromède sans représenter l'objet choisi.

La solution est une recherche en plusieurs stratégies, puis une sélection stricte.

1. Le service construit des requêtes à partir des noms anglais et français, du type astronomique, de l'identifiant de catalogue et des alias.
2. Les stratégies sont triées par priorité et dédoublonnées après normalisation.
3. Elles sont exécutées séquentiellement avec `from(...).pipe(concatMap(...))` : l'application s'arrête dès le premier résumé suffisamment fiable, plutôt que d'envoyer toutes les requêtes simultanément.
4. Chaque page trouvée doit d'abord posséder un **marqueur d'identité fort dans son titre** : nom propre, alias ou identifiant de catalogue correspondant à un mot entier.
5. Les articles généraux comme « Catalogue Messier » sont explicitement rejetés.
6. Une page d'homonymie, trop courte ou sans extrait est rejetée.
7. Les candidats restants reçoivent un score basé sur le titre, les alias, l'introduction, les catégories astronomiques et des pénalités pour les mots ou catégories interdits.
8. Seul un score supérieur ou égal à `MINIMUM_ACCEPTED_SCORE` (700) est accepté.

La vérification des petits identifiants utilise une expression régulière avec frontières : `M2` ne doit pas être validé par accident dans `M20`. Ce détail est important : une recherche par simple sous-chaîne aurait généré des faux positifs.

Un `Map` conserve aussi les résumés ou les échecs. Mémoriser `null` est utile : si aucun résultat pertinent n'existe, le panneau ne répète pas la même recherche à chaque ouverture.

**Choix produit.** Le service préfère ne rien afficher plutôt que d'afficher une fiche probablement fausse. C'est plus fiable et cohérent avec une application pédagogique.

## 12. Gestion de la longueur et des requêtes annulées dans le panneau

Le panneau d'objet limite visuellement les longues introductions Wikipédia avec « Voir plus ». Cela évite que le titre du panneau et son bouton de fermeture sortent de l'écran, surtout sur mobile.

Lorsqu'un nouvel objet est sélectionné, l'`effect` du panneau relance les enrichissements et utilise son mécanisme de nettoyage pour se désabonner des requêtes précédentes. Cela évite qu'une réponse réseau lente pour l'objet A écrase le panneau alors que l'utilisateur a déjà sélectionné l'objet B.

## 13. Sécurité et limites actuelles

Les textes de recherche servent à interroger des APIs via `HttpClient`, avec des paramètres encodés par Angular, et les données affichées dans les templates Angular sont échappées par défaut. Le champ de recherche n'est donc pas injecté tel quel dans du HTML.

Les données externes restent toutefois non fiables : l'application filtre leur pertinence, mais elle ne doit pas leur faire exécuter de HTML. Il faut conserver l'affichage par interpolation Angular et éviter tout usage non justifié de `innerHTML` ou de contournement de la sanitation.

Les limites principales pour une évolution future sont :

- séparation possible entre logique de données et stockage distant si des comptes sont ajoutés ;
- cache mémoire perdu au rechargement ;
- sélection d'exploration fondée sur une distance plane, améliorable par une formule sphérique ;
- données locales à maintenir manuellement, en échange de leur stabilité ;
- dépendance au chargement de la bibliothèque Aladin Lite et à ses services de tuiles.

## Synthèse orale courte

> « Techniquement, le projet sépare l'état réactif Angular de l'intégration impérative d'Aladin Lite. Les catalogues locaux garantissent que recherche, constellations et quiz fonctionnent sans dépendance critique. Les enrichissements Wikipédia et NASA sont asynchrones, mis en cache et filtrés de façon stricte pour privilégier la pertinence. Enfin, la logique de quiz utilise des règles de score centralisées, une distance angulaire pour la localisation et une persistance locale de l'historique. »
