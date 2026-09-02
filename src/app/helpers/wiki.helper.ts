import {
  DISAMBIGUATION_PATTERNS,
  ASTRONOMY_CATEGORIES,
  FORBIDDEN_CATEGORIES,
} from '../constants/wiki.constant';
import { IWikipediaPage } from '../models/wiki.model';

/**
 * Normalise une chaîne pour effectuer des comparaisons.
 */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();
}

/**
 * Retourne uniquement la première phrase d'un extrait Wikipédia.
 */
export function getIntroduction(extract?: string): string {
  if (!extract) {
    return '';
  }

  return normalize(extract.split(/[.!?]/)[0].trim());
}

/**
 * Détermine si une page est une page de liste d'homonymes.
 */
export function isDisambiguation(page: IWikipediaPage): boolean {
  const introduction = getIntroduction(page.extract);

  for (const pattern of DISAMBIGUATION_PATTERNS) {
    if (introduction.includes(pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * Retourne les catégories normalisées.
 */
export function getCategories(page: IWikipediaPage): string[] {
  return page.categories?.map((category) => normalize(category.title)) ?? [];
}

/**
 * Vérifie si la page possède au moins une catégorie astronomique.
 */
export function hasAstronomyCategory(page: IWikipediaPage): boolean {
  const categories = getCategories(page);

  for (const category of categories) {
    for (const keyword of ASTRONOMY_CATEGORIES) {
      if (category.includes(keyword)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Vérifie si la page possède une catégorie interdite.
 */
export function hasForbiddenCategory(page: IWikipediaPage): boolean {
  const categories = getCategories(page);

  for (const category of categories) {
    for (const keyword of FORBIDDEN_CATEGORIES) {
      if (category.includes(keyword)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Supprime les doublons d'une liste de termes de recherche.
 */
export function uniqueTerms(...terms: string[]): string[] {
  const unique = new Set<string>();

  for (const term of terms) {
    if (!term.trim()) {
      continue;
    }

    unique.add(term.trim());
  }

  return [...unique];
}

/**
 * Vérifie si le texte contient un des éléments du Set.
 */
export function containsAny(text: string, values: Iterable<string>): boolean {
  for (const value of values) {
    if (text.includes(value)) {
      return true;
    }
  }

  return false;
}

/**
 * Compte combien d'éléments du Set sont présents.
 */
export function countMatches(text: string, values: Iterable<string>): number {
  let count = 0;

  for (const value of values) {
    if (text.includes(value)) {
      count++;
    }
  }

  return count;
}

/**
 * Vérifie si deux chaînes sont identiques après normalisation.
 */
export function equalsNormalized(left: string, right: string): boolean {
  return normalize(left) === normalize(right);
}
