import { normalize } from '../helpers/wiki.helper';

/**
 * Score minimal à atteindre pour considérer une page comme pertinente.
 */
export const MINIMUM_ACCEPTED_SCORE = 700;

/**
 * Bonus attribués lors du calcul du score.
 */
export const SCORE = {
  EXACT_ENGLISH_TITLE: 1000,
  EXACT_FRENCH_TITLE: 950,

  ENGLISH_TITLE: 300,
  FRENCH_TITLE: 280,

  EXACT_SEARCH_TERM: 750,
  SEARCH_TERM: 150,

  ENGLISH_EXTRACT: 200,
  FRENCH_EXTRACT: 150,
  SEARCH_TERM_EXTRACT: 100,

  ASTRONOMY_KEYWORD: 300,
  ASTRONOMY_CATEGORY: 750,

  FORBIDDEN_WORD: -750,
  FORBIDDEN_CATEGORY: -2000,
} as const;

/**
 * Mots indiquant très probablement une page d'astronomie.
 * Utilisés uniquement sur la phrase d'introduction.
 */
export const ASTRONOMY_KEYWORDS = new Set([
  normalize('étoile'),
  normalize('star'),
  normalize('constellation'),
  normalize('galaxie'),
  normalize('galaxy'),
  normalize('nébuleuse'),
  normalize('nebula'),
  normalize('amas'),
  normalize('cluster'),
  normalize('planète'),
  normalize('planet'),
  normalize('astérisme'),
  normalize('asterism'),
  normalize('astronomie'),
  normalize('astronomy'),
  normalize('voie lactée'),
  normalize('supergéante'),
  normalize('naine'),
  normalize('géante'),
  normalize('objet céleste'),
  normalize('supernova'),
  normalize('rémanent'),
  normalize('années-lumière'),
]);

/**
 * Catégories Wikipédia favorisant fortement une page.
 */
export const ASTRONOMY_CATEGORIES = new Set([
  normalize('astronomie'),
  normalize('objet céleste'),
  normalize('étoile'),
  normalize('étoiles'),
  normalize('constellation'),
  normalize('galaxie'),
  normalize('galaxies'),
  normalize('nébuleuse'),
  normalize('nébuleuses'),
  normalize('amas ouvert'),
  normalize('amas globulaire'),
  normalize('astérisme'),
  normalize('planète'),
  normalize('satellite naturel'),
  normalize('messier'),
  normalize('ngc'),
  normalize('caldwell'),
  normalize('hipparcos'),
  normalize('voie lactée'),
  normalize('supernova'),
]);

/**
 * Catégories qui correspondent généralement à un faux positif.
 */
export const FORBIDDEN_CATEGORIES = new Set([
  normalize('fiction'),
  normalize('personnage'),
  normalize('harry potter'), //bellatrix..
  normalize('film'),
  normalize('série télévisée'),
  normalize('roman'),
  normalize('manga'),
  normalize('jeu vidéo'),
  normalize('album'),
  normalize('musique'),
  normalize('chanson'),
  normalize('acteur'),
  normalize('actrice'),
  normalize('entreprise'),
  normalize('robotique'),
  normalize('marque'),
  normalize('automobile'),
  normalize('commune'),
  normalize('ville'),
  normalize('rivière'),
  normalize('fleuve'),
  normalize('homonymie'),
  normalize('sommet des alpes suisses'),
  normalize('Footballeur sénégalais'),
  normalize('observatoire'),
  normalize('telescope'),
]);

/**
 * Mots pénalisant une page lorsqu'ils apparaissent
 * dans la première phrase.
 */
export const FORBIDDEN_WORDS = new Set([
  normalize('personnage'),
  normalize('personnage fictif'),
  normalize('film'),
  normalize('roman'),
  normalize('manga'),
  normalize('anime'),
  normalize('jeu vidéo'),
  normalize('entreprise'),
  normalize('société'),
  normalize('robotique'),
  normalize('constructeur'),
  normalize('marque'),
  normalize('automobile'),
  normalize('ville'),
  normalize('commune'),
  normalize('village'),
  normalize('rivière'),
  normalize('fleuve'),
  normalize('album'),
  normalize('chanson'),
  normalize('groupe de musique'),
  normalize('acteur'),
  normalize('actrice'),
  normalize('montagne'),
  normalize('suisse'),
]);

/**
 * Expressions caractéristiques des pages d'homonymie qui listent simplement toutes les pages portant le même nom.
 */
export const DISAMBIGUATION_PATTERNS = new Set([
  normalize('peut désigner'),
  normalize('peut faire référence'),
  normalize('est utilisé dans différents contextes pour décrire des objets différents'),
  normalize('homonymie'),
]);
