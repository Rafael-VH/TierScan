export type Locale = "es" | "en" | "pt" | "fr" | "ja";

export type ReadMode = "webtoon" | "paged";

export type SpotlightMode = "reads" | "new" | "ranking";



export type PublicationState = "ongoing" | "complete";

export type LocalizedText = Record<Locale, string>;

export interface Chapter {
  id: string;
  number: number;
  title: LocalizedText;
  pages: number;
  pageImages?: string[];
  languages?: Locale[];
  updatedAt: string;
  progress: number;
}

export interface Manga {
  id: string;
  slug: string;
  title: string;
  altTitle: string;
  author: string;
  artist?: string;
  origin: "Manga" | "Manhwa" | "Manhua";
  year: number;
  state: PublicationState;
  status: LocalizedText;
  safety: string;
  genres: string[];
  demographics: string[];
  languages: Locale[];
  synopsis: LocalizedText;
  description?: LocalizedText;
  colorFrom: string;
  colorTo: string;
  accent: string;
  chapters: Chapter[];
  ranking: number;
  reads: string;
  rating: number;
  ratingCount: string;
  bookmarks: string;
  views: string;
  totalChapters: number;
  lastUpdated: string;
  source?: string;
  scanGroup?: string;
}