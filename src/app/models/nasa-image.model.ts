export interface IAstronomicalImage {
  title: string;
  imageUrl: string;
  description?: string;
  photographer?: string;
  source?: string;
}

export interface INasaSearchResponse {
  collection: {
    items: INasaItem[];
  };
}

export interface INasaItem {
  data: INasaData[];
  links?: INasaLink[];
}

export interface INasaData {
  title: string;
  description?: string;
  photographer?: string;
}

interface INasaLink {
  href: string;
}
