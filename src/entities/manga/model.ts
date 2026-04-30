export type Locale = "es" | "en" | "pt" | "fr" | "ja";

export type ReadMode = "webtoon" | "paged";

export type DimensionPreset = "phone" | "tablet" | "desktop";

export type PublicationState = "ongoing" | "complete";

export type LocalizedText = Record<Locale, string>;

export interface Chapter {
  id: string;
  number: number;
  title: LocalizedText;
  pages: number;
  updatedAt: string;
  progress: number;
}

export interface Manga {
  id: string;
  slug: string;
  title: string;
  altTitle: string;
  author: string;
  origin: "Manga" | "Manhwa" | "Manhua";
  year: number;
  state: PublicationState;
  status: LocalizedText;
  safety: string;
  genres: string[];
  languages: Locale[];
  synopsis: LocalizedText;
  colorFrom: string;
  colorTo: string;
  accent: string;
  chapters: Chapter[];
  ranking: number;
  reads: string;
}