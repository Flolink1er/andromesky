# AndromeSky — questions potentielles pour la défense

Ce guide propose des réponses courtes, naturelles et défendables. Elles ne doivent pas être récitées mot pour mot : l'objectif est de retenir le raisonnement, puis de l'exprimer avec ses propres mots.

## Stratégie générale de réponse

Pour une question technique, une réponse solide suit généralement ce schéma :

1. rappeler l'objectif concret du projet ;
2. expliquer le choix effectué et son bénéfice ;
3. reconnaître une limite si elle existe ;
4. proposer une évolution réaliste si le projet devait continuer.

Il vaut mieux dire « c'est un choix adapté au périmètre de cette version » que prétendre qu'il s'agit de l'unique solution possible.

---

# Architecture Angular

## Pourquoi avoir choisi Angular ?

> « Angular me permettait de structurer une application interactive avec des composants, des services, un typage TypeScript fort et une gestion propre de l'état. Pour une SPA avec une carte, de la recherche, plusieurs modes de quiz et des données externes, ce cadre m'a aidé à séparer clairement l'interface de la logique métier. »

**À développer si nécessaire.** Angular apporte l'injection de dépendances, le `HttpClient`, les formulaires réactifs et les `signal`, sans devoir choisir et assembler plusieurs bibliothèques distinctes.

## Pourquoi ne pas avoir utilisé `RouterLink` ou le Router Angular ?

> « Les écrans exploration, paramétrage, questions et résultats sont des états d'une même expérience, pas des pages indépendantes à partager par URL. J'ai donc utilisé un état applicatif plutôt que des routes : cela restait plus simple pour le périmètre du projet. »

> « Le Router deviendrait pertinent si j'ajoutais des pages d'objet partageables, des profils, un classement public ou une navigation plus large. »

## Pourquoi utiliser des `signal` ?

> « Les `signal` permettent de stocker un état réactif simple. Lorsqu'une question, un score ou un objet sélectionné change, Angular met automatiquement à jour les éléments qui lisent cette valeur. C'est particulièrement adapté à un quiz, où plusieurs composants doivent réagir au même état. »

## Pourquoi les signaux privés commencent-ils par `_` et sont exposés en `readonly` ?

> « Le signal privé est modifiable seulement à l'intérieur du service. Les composants reçoivent une version en lecture seule : ils peuvent afficher l'état, mais ils ne peuvent pas le modifier n'importe comment. Ils doivent passer par une méthode métier, comme `startQuiz`, `submitAnswer` ou `finishGame`. »

> « Cela protège les invariants. Par exemple, une nouvelle question doit aussi réinitialiser l'indice, la réponse sélectionnée et le chronomètre : une méthode centralisée garantit que tout est remis dans un état cohérent. »

## Pourquoi avoir mis la logique dans des services plutôt que dans les composants ou des helpers ?

> « Les composants ont surtout la responsabilité d'afficher l'interface et de relayer les actions de l'utilisateur. Les services contiennent la logique métier ou l'état partagé : quiz, score, carte, chargement de catalogues et appels API. »

> « Un helper est utile pour une fonction pure et sans état, comme normaliser un texte ou détecter une page d'homonymie. En revanche, un service est nécessaire quand il y a un état, un cache, une dépendance injectée ou des appels HTTP. »

## Qu'est-ce qu'une SPA ?

> « Une Single Page Application charge l'application une fois, puis met à jour l'interface sans recharger une page complète à chaque interaction. Dans AndromeSky, passer de l'exploration au quiz ou à ses résultats se fait dans la même application, ce qui rend la navigation plus fluide. »

---

# Données astronomiques et SkyMap

## Que sont l'AR et la DEC ?

> « L'ascension droite et la déclinaison sont les coordonnées universelles du ciel. L'AR correspond à une longitude céleste, généralement de 0 à 360 degrés ; la DEC correspond à une latitude céleste, de −90 à +90 degrés. Ensemble, elles permettent de placer un objet précisément sur la carte. »

**Analogie.** Comme longitude et latitude sur Terre, mais projetées sur la sphère céleste.

## Pourquoi la carte ressemble-t-elle à un globe lorsque l'on dézoome beaucoup ?

> « À très grand champ, Aladin Lite ne peut plus représenter le ciel comme un plan sans le déformer fortement. Il utilise donc une projection adaptée à la sphère céleste, ce qui donne cet effet de globe. C'est une conséquence normale du fait que le ciel est représenté sur une surface courbe. »

## Pourquoi avoir utilisé Aladin Lite ?

> « Aladin Lite est une bibliothèque spécialisée en astronomie. Elle permet d'afficher de vrais relevés du ciel, de naviguer avec des coordonnées astronomiques et d'ajouter des marqueurs, des segments et des superpositions. La réimplémenter aurait été disproportionné pour le TFE ; mon travail s'est donc concentré sur son intégration et sur l'expérience construite autour. »

## Pourquoi avoir chargé une quantité limitée de données localement plutôt que tout via des APIs ?

> « Le catalogue local garantit une recherche et des quiz réactifs, même si une API externe est lente ou indisponible. Il assure aussi que les objets utilisés dans les quiz correspondent exactement aux objets et aux segments de constellations affichés. »

> « Télécharger l'entièreté des catalogues serait inutilement lourd et rendrait le filtrage plus complexe. J'ai privilégié une sélection éditorialisée d'objets et de noms pertinents. Les APIs NASA et Wikipédia restent utilisées comme enrichissements, mais l'application de base ne dépend pas d'elles. »

## Pourquoi ne pas avoir ajouté les planètes du système solaire ?

> « Les objets du catalogue sont suffisamment lointains pour que leurs coordonnées paraissent fixes à l'échelle de l'application. Les planètes se déplacent par contre selon la date, l'heure et, pour une observation précise, le lieu de l'utilisateur. Les ajouter avec des coordonnées statiques aurait donc donné une information rapidement fausse. »

> « L'analogie serait d'afficher des avions sur Google Earth avec leur position enregistrée à un instant précis : quelques heures plus tard, leur emplacement ne serait plus correct. Ajouter les planètes demanderait donc des éphémérides et un futur mode “ciel en temps réel”. »

## Pourquoi les constellations sont-elles construites à partir de segments ?

> « Une constellation n'est pas un objet physique unique : c'est un dessin conventionnel reliant certaines étoiles. Les segments stockent donc les paires d'étoiles à relier, et la carte retrouve leurs coordonnées depuis les catalogues. Cela évite de dupliquer les coordonnées et facilite la correction d'un tracé. »

## Pourquoi certains segments peuvent-ils manquer ?

> « Un segment ne peut être tracé que si ses deux identifiants correspondent exactement aux données chargées. Une différence entre un identifiant HIP, HR ou un nom propre suffit à empêcher de retrouver l'étoile. C'est pourquoi les données de constellations doivent être vérifiées conjointement aux catalogues. »

---

# Quiz, distance et score

## Comment fonctionne la validation en mode localisation ?

> « La validation ne cherche plus l'objet de catalogue le plus proche du clic. Elle calcule directement la distance angulaire entre la position choisie et l'objet demandé. Cela évite de pénaliser une personne qui clique très près de la bonne cible, mais dans une zone où un autre objet est encore plus proche. »

## Pourquoi une distance angulaire plutôt qu'une distance euclidienne ?

> « Les coordonnées sont placées sur la sphère céleste. Une distance angulaire tient compte de cette géométrie et évite notamment les problèmes de passage de 0° à 360° en ascension droite ou de proximité des pôles. Une distance euclidienne serait une approximation plane ; elle est pratique pour une sélection rapide, mais moins juste pour noter une précision. »

## Comment sont attribués les points de localisation ?

> « Il existe trois niveaux : jusqu'à 0,5 degré, la position est très précise et rapporte 50 points ; jusqu'à 1,5 degré, elle rapporte 20 points ; jusqu'à 3 degrés, elle reste acceptable et rapporte 5 points. Au-delà, la réponse est considérée incorrecte. Le retour affiche toujours la distance et la bonne position. »

**À nuancer.** Les seuils sont un choix de game design, adaptés à la lisibilité de la carte et au catalogue actuel. Ils peuvent être ajustés après des retours d'utilisateurs.

## Quel est le rôle de l'indice ?

> « En QCM, il retire une proposition fausse. En localisation, il affiche une zone violette qui contient l'objet, sans le placer systématiquement au centre. Pour éviter qu'un zoom très fort rende la zone trop petite, la carte revient au minimum à un champ de 120 degrés avant d'afficher l'indice. »

> « Dans les deux modes, l'indice ne peut être utilisé qu'une fois et divise les points gagnés par deux. Ainsi il aide le joueur sans supprimer complètement l'enjeu. »

## Pourquoi les réponses rapides sont-elles comptées ?

> « Une bonne réponse donnée en moins de cinq secondes déclenche un bonus et est comptée comme réponse éclair. Cela rend le retour plus motivant et valorise la reconnaissance immédiate, tout en gardant la correction de base inchangée. »

## Pourquoi empêcher la sélection après un glissement de carte ?

> « Sur mobile, le geste de déplacement se termine parfois par un événement de clic. Sans protection, un simple drag créerait un marqueur ou sélectionnerait un objet par erreur. L'application mémorise le déplacement du pointeur et ignore le clic si un seuil de 8 pixels est dépassé. »

## Pourquoi empêcher le clic droit dans la SkyMap ?

> « Le menu contextuel d'Aladin Lite expose des outils techniques qui ne font pas partie du parcours prévu. Il a donc été bloqué pour garder une expérience cohérente et éviter les actions involontaires. »

---

# APIs, qualité des résultats et sécurité

## Pourquoi utiliser Wikipédia si les résultats ne sont pas toujours fiables ?

> « Wikipédia apporte une description en français utile pour enrichir les fiches, mais l'API de recherche peut renvoyer des pages proches sans être la bonne page. J'ai donc ajouté un filtrage strict : le titre doit contenir une identité forte de l'objet, les pages générales de catalogue sont rejetées, puis les résultats reçoivent un score de pertinence. »

> « Le choix est volontairement prudent : mieux vaut ne pas afficher de résumé que d'afficher une description erronée. »

## Comment le score de pertinence Wikipédia fonctionne-t-il ?

> « Il combine plusieurs signaux : correspondance du titre avec le nom ou un alias, présence dans l'introduction, catégories astronomiques et pénalités pour des mots ou catégories hors sujet. Un seuil minimal de 700 est exigé. Les petits identifiants comme M2 sont vérifiés comme des mots entiers pour éviter une confusion avec M20. »

## Pourquoi utiliser un cache pour la NASA et Wikipédia ?

> « Le cache mémorise le résultat pour un objet déjà consulté, y compris lorsqu'il n'y a aucun résultat pertinent. Cela évite de répéter des requêtes identiques, accélère la réouverture du panneau et réduit la dépendance aux services externes. »

## Est-ce que le champ de recherche est protégé contre les injections ?

> « La requête est envoyée avec `HttpClient` sous forme de paramètres ; Angular l'encode. Les valeurs sont affichées par interpolation dans les templates, qui les échappent par défaut. Je n'injecte pas directement la recherche dans du HTML avec `innerHTML`. »

> « Cela ne remplace pas une validation métier, mais cela évite l'injection HTML ou JavaScript classique dans le parcours actuel. »

## Pourquoi ne pas stocker l'historique des scores dans une base de données ?

> « Pour cette version sans comptes, `localStorage` répond au besoin : l'historique reste sur l'appareil, persiste entre les ouvertures et ne nécessite ni serveur ni gestion d'identité. »

> « Ses limites sont assumées : il n'y a pas de synchronisation entre appareils ni de classement partagé. Pour aller plus loin, il faudrait un backend, des comptes et une gestion explicite des données personnelles. »

---

# Qualité, limites et évolutions

## Pourquoi avoir choisi ce sujet ?

> « Le sujet partait d'un intérêt pour l'astronomie et du constat que de nombreuses SkyMaps existantes sont puissantes, mais souvent très denses visuellement et peu engageantes pour une première exploration. Je voulais donc créer une expérience qui combine une vraie carte du ciel, des objets astronomiques documentés et une dimension ludique avec les quiz. »

> « Le but n'était pas de simplifier artificiellement l'astronomie, mais d'offrir une interface plus claire pour donner envie d'explorer et d'apprendre. »

## Quelle a été la principale difficulté technique ?

> « L'intégration entre une application Angular réactive et Aladin Lite, qui manipule la carte de façon impérative. J'ai isolé Aladin dans un service dédié afin que les composants n'aient pas à manipuler directement la bibliothèque. »

**Autres réponses possibles.** La fiabilité des résultats Wikipédia, les interactions tactiles sur mobile et la cohérence entre les catalogues et les segments de constellations sont également de bonnes difficultés à citer.

## Pourquoi ne pas avoir rendu l'application “simple” pour tous les publics ?

> « Le projet cherche surtout à rendre l'exploration plus agréable et plus lisible que des interfaces astronomiques très chargées. Mais l'astronomie conserve un vocabulaire technique et certains identifiants de catalogue restent exigeants. Je ne présenterais donc pas l'application comme totalement accessible à un débutant absolu. »

> « Les difficultés de quiz, les indices, les noms distinctifs aux niveaux facile et moyen, et les descriptions externes réduisent cette barrière sans cacher la nature scientifique des données. »

## En quoi AndromeSky se distingue-t-il des autres SkyMaps ?

> « L'objectif n'était pas de remplacer un outil astronomique professionnel. AndromeSky associe une carte du ciel à une expérience visuelle plus épurée, une exploration d'objets et des quiz. Beaucoup d'outils existants sont très complets mais peuvent être visuellement denses ; le projet propose une porte d'entrée plus ludique. »

## Quelles sont les évolutions les plus pertinentes ?

> « Les priorités seraient : comptes et classement, enrichissement progressif du catalogue, filtres par type ou constellation, un vrai mode ciel en temps réel avec les planètes, et l'exploitation de nouvelles données astronomiques lorsque des sources fiables sont disponibles. »

> « Une autre évolution technique serait de remplacer les données locales par un mécanisme de synchronisation contrôlé, sans perdre la stabilité nécessaire aux quiz. »

## Quelles limites reconnais-tu dans le projet ?

> « Les données locales doivent être maintenues manuellement et le catalogue ne couvre pas encore tout le ciel. Les images et résumés externes dépendent aussi de leurs APIs, même si l'application reste fonctionnelle sans eux. Enfin, le score est local à l'appareil : il ne permet pas encore de profils ou de compétition entre utilisateurs. »

> « Ces limites sont aussi des pistes d'évolution concrètes, plutôt que des défauts ignorés. »

## Pourquoi ne pas avoir tout implémenté ?

> « Un TFE implique de choisir un périmètre atteignable et cohérent. J'ai préféré terminer une expérience complète — exploration, recherche, fiches, deux quiz, responsive, score et persistance — plutôt que d'ajouter beaucoup de fonctionnalités incomplètes. Les évolutions restantes ont été identifiées et priorisées. »

---

# Questions de démonstration à anticiper

## Que montrer en premier ?

> « Je commencerais par l'exploration : recherche d'un objet connu, centrage, constellation et fiche enrichie. Ensuite, je montrerais rapidement les deux modes de quiz, l'indice et le retour de localisation. Enfin, je terminerais par le résultat et l'historique de score. »

## Que faire si une API NASA ou Wikipédia ne répond pas pendant la démonstration ?

> « Les fonctionnalités principales restent opérationnelles : la carte, les catalogues locaux, la recherche, les constellations et les quiz ne dépendent pas de ces APIs. Je peux donc poursuivre la démonstration et expliquer que les données externes sont des enrichissements optionnels, mis en cache quand elles sont disponibles. »

## Que dire si l'on remarque qu'un objet n'a pas de description ou d'image ?

> « Le système préfère masquer un résultat incertain plutôt que présenter une information erronée. Cela arrive surtout pour les objets dont l'identité est peu documentée ou dont la recherche ne donne pas une correspondance suffisamment fiable. »
