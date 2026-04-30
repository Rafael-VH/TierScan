import { useMemo, useState, useEffect } from "react";
import type { Locale } from "@/entities/manga/model";
import { LibraryShelf } from "@/features/catalog/components/LibraryShelf";
import { HeroSpotlight } from "@/features/catalog/components/HeroSpotlight";
import { RankingPanel } from "@/features/catalog/components/RankingPanel";
import { MangaDetails } from "@/features/catalog/components/MangaDetails";
import { mangaCatalog } from "@/features/catalog/data/catalog";
import { loadMangaCatalog } from "@/features/catalog/api/mangaRepository";
import { ReaderPanel } from "@/features/reader/components/ReaderPanel";
import { getCopy } from "@/shared/i18n/translations";
import { TopNavigation } from "@/shared/layout/TopNavigation";

type View = "home" | "details" | "reader";

export function AppShell() {
  const [view, setView] = useState<View>("home");
  const [locale, setLocale] = useState<Locale>("es");
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState(mangaCatalog);
  const [selectedMangaId, setSelectedMangaId] = useState(mangaCatalog[0].id);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    null,
  );

  const copy = getCopy(locale);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, selectedMangaId]);

  useEffect(() => {
    let isMounted = true;

    loadMangaCatalog().then((loadedCatalog) => {
      if (!isMounted || loadedCatalog.length === 0) {
        return;
      }

      setCatalog(loadedCatalog);
      setSelectedMangaId((currentId) =>
        loadedCatalog.some((manga) => manga.id === currentId)
          ? currentId
          : loadedCatalog[0].id,
      );
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredMangas = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return catalog;

    return catalog.filter((manga) => {
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
  }, [catalog, query]);

  const selectedManga = useMemo(
    () =>
      catalog.find((m) => m.id === selectedMangaId) ||
      catalog[0] ||
      mangaCatalog[0],
    [catalog, selectedMangaId],
  );

  const recentMangas = useMemo(
    () =>
      [...catalog].sort((a, b) =>
        (b.chapters[0]?.updatedAt ?? b.lastUpdated).localeCompare(
          a.chapters[0]?.updatedAt ?? a.lastUpdated,
        ),
      ),
    [catalog],
  );

  const handleMangaSelect = (id: string) => {
    setSelectedMangaId(id);
    setView("details");
  };

  const handleReadChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setView("reader");
  };

  return (
    <div className="min-h-screen bg-[#090e1b] text-slate-100 selection:bg-amber-300 selection:text-slate-950">
      {view === "home" && (
        <TopNavigation
          copy={copy}
          locale={locale}
          query={query}
          onLocaleChange={setLocale}
          onQueryChange={(q) => {
            setQuery(q);
          }}
          onLibraryClick={() => setView("home")}
          onReaderClick={() => {
            setView("reader");
          }}
        />
      )}

      <main className={view === "home" ? "pt-16" : ""}>
        {view === "home" && (
          <div className="animate-reader-in">
            <HeroSpotlight
              copy={copy}
              locale={locale}
              manga={catalog[0] || mangaCatalog[0]}
              onRead={() =>
                handleMangaSelect((catalog[0] || mangaCatalog[0]).id)
              }
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
                mangas={catalog}
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
          <ReaderPanel
            copy={copy}
            locale={locale}
            manga={selectedManga}
            initialChapterId={selectedChapterId || selectedManga.chapters[0].id}
            onBack={() => setView("details")}
          />
        )}
      </main>
    </div>
  );
}
