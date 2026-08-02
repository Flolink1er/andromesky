import { IAstronomicalObject } from '../models/astronomical-object.model';

/**
 * Résumé affiché dans le panneau latéral.
 * C'est le modèle utilisé par l'application.
 */
export interface IWikipediaSummary {
  title: string;
  extract: string;
  pageUrl: string;
  thumbnailUrl?: string;
}

/**
 * Réponse principale de l'API MediaWiki.
 */
export interface IWikipediaResponse {
  query?: {
    pages: Record<string, IWikipediaPage>;
  };
}

/**
 * Page Wikipédia brute.
 */
export interface IWikipediaPage {
  pageid: number;
  title: string;
  extract?: string;
  fullurl?: string;

  thumbnail?: {
    source: string;
  };

  categories?: IWikipediaCategory[];
  length: number;
}

/**
 * Catégorie Wikipédia.
 */
export interface IWikipediaCategory {
  title: string;
}

/**
 * Résultat d'une recherche avec son score.
 * Utilisé uniquement en interne par le service.
 */
export interface IWikipediaSearchResult {
  page: IWikipediaPage;
  score: number;
}

/**
 * Une stratégie de recherche.
 * Une stratégie représente une requête envoyée à Wikipédia.
 *
 * Exemple :
 * - "Vega"
 * - "Vega star"
 * - "Étoile Vega"
 * - "Messier 31"
 */
export interface IWikipediaSearchStrategy {
  term: string;
  priority: number;

  /**
   * Nom de la stratégie.
   * Permet de savoir facilement
   * quelle recherche a fonctionné.
   */
  name: string;
}

/**
 * Contexte utilisé pour calculer le score d'une page.
 * Cela évite de recalculer les mêmes valeurs à chaque comparaison.
 */
export interface IWikipediaScoreContext {
  object: IAstronomicalObject;

  englishName: string;

  frenchName: string;

  searchTerms: string[];

  introduction: string;

  categories: string[];
}
