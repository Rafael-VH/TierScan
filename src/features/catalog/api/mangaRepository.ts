import type { Chapter, Locale, LocalizedText, Manga, PublicationState } from "@/entities/manga/model";
import { mangaCatalog } from "@/features/catalog/data/catalog";
import { isSupabaseConfigured, supabase } from "@/shared/api/supabaseClient";

type SupabaseChapterRow = {
  id: string;
  manga_id: string;
  number: number;
  title: Partial<LocalizedText> | null;
  pages: number | null;
  page_images: string[] | null;
  languages?: Locale[] | null;
  updated_at: string | null;
  progress: number | null;
};

type SupabaseMangaRow = {
  id: string;
  slug: string;
  title: string;
  alt_title: string | null;
  author: string;
  artist: string | null;
  origin: Manga["origin"];
  year: number;
  state: PublicationState;
  status: Partial<LocalizedText> | null;
  safety: string | null;
  genres: string[] | null;
  demographics: string[] | null;
  languages: Locale[] | null;
  synopsis: Partial<LocalizedText> | null;
  color_from: string | null;
  color_to: string | null;
  accent: string | null;
  ranking: number | null;
  reads: string | null;
  rating: number | null;
  rating_count: string | null;
  bookmarks: string | null;
  views: string | null;
  total_chapters: number | null;
  last_updated: string | null;
  source: string | null;
  scan_group: string | null;
  manga_chapters?: SupabaseChapterRow[] | null;
};

const fallbackText: LocalizedText = {
  es: "Sin traduccion disponible.",
  en: "No translation available.",
  pt: "Sem traducao disponivel.",
  fr: "Traduction non disponible.",
  ja: "Translation unavailable.",
};

function localizedText(value: Partial<LocalizedText> | null | undefined, fallback = fallbackText): LocalizedText {
  return {
    es: value?.es || fallback.es,
    en: value?.en || value?.es || fallback.en,
    pt: value?.pt || value?.es || fallback.pt,
    fr: value?.fr || value?.es || fallback.fr,
    ja: value?.ja || value?.en || value?.es || fallback.ja,
  };
}

function mapChapter(row: SupabaseChapterRow): Chapter {
  return {
    id: row.id,
    number: row.number,
    title: localizedText(row.title, {
      es: `Capitulo ${row.number}`,
      en: `Chapter ${row.number}`,
      pt: `Capitulo ${row.number}`,
      fr: `Chapitre ${row.number}`,
      ja: `Chapter ${row.number}`,
    }),
    pages: row.pages ?? 1,
    pageImages: row.page_images ?? undefined,
    languages: row.languages ?? undefined,
    updatedAt: row.updated_at ?? new Date().toISOString().slice(0, 10),
    progress: row.progress ?? 0,
  };
}

function mapManga(row: SupabaseMangaRow): Manga {
  const chapters = [...(row.manga_chapters ?? [])].sort((a, b) => b.number - a.number).map(mapChapter);
  const safeChapters =
    chapters.length > 0
      ? chapters
      : [
        {
          id: `${row.id}-chapter-1`,
          number: 1,
          title: localizedText(null, {
            es: "Capitulo 1",
            en: "Chapter 1",
            pt: "Capitulo 1",
            fr: "Chapitre 1",
            ja: "Chapter 1",
          }),
          pages: 1,
          updatedAt: row.last_updated ?? new Date().toISOString().slice(0, 10),
          progress: 0,
        },
      ];

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    altTitle: row.alt_title ?? row.title,
    author: row.author,
    artist: row.artist ?? undefined,
    origin: row.origin,
    year: row.year,
    state: row.state,
    status: localizedText(row.status, {
      es: row.state === "complete" ? "Completo" : "En emision",
      en: row.state === "complete" ? "Complete" : "Ongoing",
      pt: row.state === "complete" ? "Completo" : "Em lancamento",
      fr: row.state === "complete" ? "Termine" : "En cours",
      ja: row.state === "complete" ? "Kanryo" : "Renzoku chu",
    }),
    safety: row.safety ?? "Safe",
    genres: row.genres ?? [],
    demographics: row.demographics ?? [],
    languages: row.languages ?? ["es"],
    synopsis: localizedText(row.synopsis),
    colorFrom: row.color_from ?? "#0f172a",
    colorTo: row.color_to ?? "#334155",
    accent: row.accent ?? "#fbbf24",
    chapters: safeChapters,
    ranking: row.ranking ?? 999,
    reads: row.reads ?? "0",
    rating: row.rating ?? 0,
    ratingCount: row.rating_count ?? "0",
    bookmarks: row.bookmarks ?? "0",
    views: row.views ?? "0",
    totalChapters: row.total_chapters ?? safeChapters.length,
    lastUpdated: row.last_updated ?? safeChapters[0].updatedAt,
    source: row.source ?? undefined,
    scanGroup: row.scan_group ?? undefined,
  };
}

export async function loadMangaCatalog(): Promise<Manga[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mangaCatalog;
  }

  const { data, error } = await supabase
    .from("manga_titles")
    .select("*, manga_chapters(*)")
    .order("ranking", { ascending: true });

  if (error) {
    console.warn("Supabase catalog load failed. Falling back to local data.", error.message);
    return mangaCatalog;
  }

  if (!data?.length) {
    return mangaCatalog;
  }

  return (data as SupabaseMangaRow[]).map(mapManga);
}