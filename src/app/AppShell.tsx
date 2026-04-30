import { useMemo, useState, useEffect } from "react";
import type { Locale } from "@/entities/manga/model";
import { LibraryShelf } from "@/features/catalog/components/LibraryShelf";
import { HeroSpotlight } from "@/features/catalog/components/HeroSpotlight";
import { RankingPanel } from "@/features/catalog/components/RankingPanel";
import { MangaDetails } from "@/features/catalog/components/MangaDetails";
import { mangaCatalog } from "@/features/catalog/data/catalog";
import { ReaderPanel } from "@/features/reader/components/ReaderPanel";
import { getCopy } from "@/shared/i18n/translations";
import { TopNavigation } from "@/shared/layout/TopNavigation";

type View = "home" | "details" | "reader";

export function AppShell() {
  const [view, setView] = useState<View>("home");
  const [locale, setLocale] = useState<Locale>("es");
  const [query, setQuery] = useState("");
  const [selectedMangaId, setSelectedMangaId] = useState(mangaCatalog[0].id);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    null,
  );

  const copy = getCopy(locale);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, selectedMangaId]);

  const filteredMangas = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return mangaCatalog;

    return mangaCatalog.filter((manga) => {
      const searchable = [
        manga.title,
        manga.altTitle,
        manga.author,
        manga.origin,
        ...manga.genres,
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [query]);

  const selectedManga = useMemo(
    () => mangaCatalog.find((m) => m.id === selectedMangaId) || mangaCatalog[0],
    [selectedMangaId],
  );

  const recentMangas = useMemo(
    () =>
      [...mangaCatalog].sort((a, b) =>
        b.chapters[0].updatedAt.localeCompare(a.chapters[0].updatedAt),
      ),
    [],
  );

  const handleMangaSelect = (id: string) => {
    setSelectedMangaId(id);
    setView("details");
  };

  const handleReadChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setView("reader");
  };

  const showFullHeader = view === "home";

  return (
    <div className="min-h-screen bg-[#090e1b] text-slate-100 selection:bg-amber-300 selection:text-slate-950">
      {showFullHeader && (
        <TopNavigation
          copy={copy}
          locale={locale}
          query={query}
          onLocaleChange={setLocale}
          onQueryChange={(q) => {
            setQuery(q);
            if (view !== "home") setView("home");
          }}
          onLibraryClick={() => setView("home")}
          onReaderClick={() => {
            setView("reader");
          }}
        />
      )}

      {/* Minimalist header for details/reader */}
      {!showFullHeader && (
        <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between px-4 backdrop-blur-xl bg-[#090e1b]/80">
          <button
            onClick={() =>
              view === "details" ? setView("home") : setView("details")
            }
            className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {view === "details" ? copy.back : copy.backToDetails}
          </button>
          <span className="text-sm font-black text-white">{copy.appName}</span>
          <div className="w-20" />
        </div>
      )}

      <main className={showFullHeader ? "pt-16" : "pt-14"}>
        {view === "home" && (
          <div className="animate-reader-in">
            <HeroSpotlight
              copy={copy}
              locale={locale}
              manga={mangaCatalog[0]}
              onRead={() => handleMangaSelect(mangaCatalog[0].id)}
            />
            <div className="mx-auto grid max-w-[1480px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8 xl:gap-14">
              <div className="space-y-14">
                <LibraryShelf
                  copy={copy}
                  locale={locale}
                  title={copy.readingHistory}
                  mangas={filteredMangas}
                  selectedId={selectedMangaId}
                  onSelect={handleMangaSelect}
                />
                <LibraryShelf
                  copy={copy}
                  locale={locale}
                  title={copy.mostRecent}
                  mangas={recentMangas}
                  selectedId={selectedMangaId}
                  onSelect={handleMangaSelect}
                />
              </div>
              <RankingPanel
                copy={copy}
                locale={locale}
                mangas={mangaCatalog}
                onSelect={handleMangaSelect}
              />
            </div>
          </div>
        )}

        {view === "details" && (
          <MangaDetails
            copy={copy}
            locale={locale}
            manga={selectedManga}
            onBack={() => setView("home")}
            onReadChapter={handleReadChapter}
          />
        )}

        {view === "reader" && (
          <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">
            <ReaderPanel
              copy={copy}
              locale={locale}
              manga={selectedManga}
              initialChapterId={
                selectedChapterId || selectedManga.chapters[0].id
              }
            />
          </div>
        )}
      </main>
    </div>
  );
}
