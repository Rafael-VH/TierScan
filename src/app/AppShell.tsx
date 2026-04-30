import { useEffect, useMemo, useState } from "react";
import type { Locale, Manga, SpotlightMode } from "@/entities/manga/model";
import { LibraryShelf } from "@/features/catalog/components/LibraryShelf";
import { HomeSlider } from "@/features/catalog/components/HomeSlider";
import { RankingPanel } from "@/features/catalog/components/RankingPanel";
import { MangaDetails } from "@/features/catalog/components/MangaDetails";
import { mangaCatalog } from "@/features/catalog/data/catalog";
import { loadMangaCatalog } from "@/features/catalog/api/mangaRepository";
import { ReaderPanel } from "@/features/reader/components/ReaderPanel";
import { getCopy } from "@/shared/i18n/translations";
import { TopNavigation } from "@/shared/layout/TopNavigation";
import { SideDrawer } from "@/shared/layout/SideDrawer";

type View = "home" | "details" | "reader";

interface ActiveFilter {
  type: "genre" | "origin";
  value: string;
}

function parseMetric(value: string) {
  const cleanValue = value.trim().toUpperCase();
  const multiplier = cleanValue.endsWith("M")
    ? 1_000_000
    : cleanValue.endsWith("K")
      ? 1_000
      : 1;
  return Number.parseFloat(cleanValue.replace(/[MK]/g, "")) * multiplier;
}

export function AppShell() {
  const [view, setView] = useState<View>("home");
  const [locale, setLocale] = useState<Locale>("es");
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter | null>(null);
  const [spotlightMode, setSpotlightMode] = useState<SpotlightMode>("reads");
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
    loadMangaCatalog().then((loaded) => {
      if (!isMounted || loaded.length === 0) return;
      setCatalog(loaded);
      setSelectedMangaId((id) =>
        loaded.some((m) => m.id === id) ? id : loaded[0].id,
      );
    });
    return () => {
      isMounted = false;
    };
  }, []);

  /* ---- filtering ---- */

  const filteredMangas = useMemo(() => {
    let items = catalog;

    if (activeFilter) {
      items = items.filter((m) =>
        activeFilter.type === "genre"
          ? m.genres.includes(activeFilter.value)
          : m.origin === activeFilter.value,
      );
    }

    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter((m) =>
        [m.title, m.altTitle, m.author, m.origin, ...m.genres]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    return items;
  }, [catalog, activeFilter, query]);

  const selectedManga = useMemo(
    () =>
      catalog.find((m) => m.id === selectedMangaId) ||
      catalog[0] ||
      mangaCatalog[0],
    [catalog, selectedMangaId],
  );

  const recentMangas = useMemo(
    () =>
      [...filteredMangas].sort((a, b) =>
        (b.chapters[0]?.updatedAt ?? b.lastUpdated).localeCompare(
          a.chapters[0]?.updatedAt ?? a.lastUpdated,
        ),
      ),
    [filteredMangas],
  );

  const spotlightMangas = useMemo(() => {
    const items = [...catalog];

    if (spotlightMode === "reads") {
      return items
        .sort((a, b) => parseMetric(b.reads) - parseMetric(a.reads))
        .slice(0, 5);
    }

    if (spotlightMode === "new") {
      return items
        .sort((a, b) =>
          (b.chapters[0]?.updatedAt ?? b.lastUpdated).localeCompare(
            a.chapters[0]?.updatedAt ?? a.lastUpdated,
          ),
        )
        .slice(0, 5);
    }

    return items.sort((a, b) => a.ranking - b.ranking).slice(0, 5);
  }, [catalog, spotlightMode]);

  const relatedMangas = useMemo(() => {
    return catalog
      .filter((manga) => manga.id !== selectedManga.id)
      .map((manga) => ({
        manga,
        score: manga.genres.filter((genre) =>
          selectedManga.genres.includes(genre),
        ).length,
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.manga.ranking - b.manga.ranking)
      .map((item) => item.manga)
      .slice(0, 10);
  }, [catalog, selectedManga]);

  /* ---- handlers ---- */

  const handleMangaSelect = (id: string) => {
    setSelectedMangaId(id);
    setView("details");
  };

  const handleReadChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setView("reader");
  };

  const goHome = () => {
    setView("home");
  };

  const handleSelectGenre = (genre: string) => {
    setActiveFilter({ type: "genre", value: genre });
    setView("home");
  };

  const handleSelectOrigin = (origin: Manga["origin"]) => {
    setActiveFilter({ type: "origin", value: origin });
    setView("home");
  };

  const clearFilter = () => setActiveFilter(null);

  return (
    <div className="min-h-screen bg-[#090e1b] text-slate-100 selection:bg-amber-300 selection:text-slate-950">
      {view === "home" && (
        <TopNavigation
          copy={copy}
          locale={locale}
          query={query}
          catalog={catalog}
          onLocaleChange={setLocale}
          onQueryChange={setQuery}
          onOpenDrawer={() => setDrawerOpen(true)}
          onHomeClick={goHome}
          onSelectManga={handleMangaSelect}
        />
      )}

      <SideDrawer
        open={drawerOpen}
        copy={copy}
        locale={locale}
        catalog={catalog}
        onClose={() => setDrawerOpen(false)}
        onLocaleChange={setLocale}
        onSelectGenre={handleSelectGenre}
        onSelectOrigin={handleSelectOrigin}
        spotlightMode={spotlightMode}
        onSpotlightModeChange={setSpotlightMode}
        onHomeClick={() => {
          clearFilter();
          goHome();
        }}
      />

      <main className={view === "home" ? "pt-14 sm:pt-16" : ""}>
        {view === "home" && (
          <div className="animate-reader-in">
            <HomeSlider
              copy={copy}
              locale={locale}
              mangas={
                spotlightMangas.length > 0
                  ? spotlightMangas
                  : [catalog[0] || mangaCatalog[0]]
              }
              mode={spotlightMode}
              onSelect={handleMangaSelect}
            />

            <div className="mx-auto grid max-w-[1480px] gap-10 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12 lg:px-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-14">
              <div className="space-y-12 sm:space-y-14 lg:space-y-16">
                {activeFilter && (
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-300/30 bg-amber-300/10 px-5 py-4">
                    <p className="text-sm font-bold text-amber-100">
                      <span className="opacity-70">
                        {activeFilter.type === "genre"
                          ? copy.genres
                          : copy.type}
                        :
                      </span>{" "}
                      <span className="font-black">{activeFilter.value}</span>
                    </p>
                    <button
                      type="button"
                      onClick={clearFilter}
                      className="rounded-lg border border-amber-200/30 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-amber-100 transition hover:bg-amber-200/10"
                    >
                      ×
                    </button>
                  </div>
                )}

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
            key={selectedManga.id}
            copy={copy}
            locale={locale}
            manga={selectedManga}
            relatedMangas={relatedMangas}
            onBack={() => setView("home")}
            onReadChapter={handleReadChapter}
            onSelectManga={handleMangaSelect}
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
