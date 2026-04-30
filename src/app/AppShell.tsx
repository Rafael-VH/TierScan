import { useMemo, useState } from "react";
import type { Locale } from "@/entities/manga/model";
import { LibraryShelf } from "@/features/catalog/components/LibraryShelf";
import { HeroSpotlight } from "@/features/catalog/components/HeroSpotlight";
import { RankingPanel } from "@/features/catalog/components/RankingPanel";
import { mangaCatalog } from "@/features/catalog/data/catalog";
import { ReaderPanel } from "@/features/reader/components/ReaderPanel";
import { getCopy } from "@/shared/i18n/translations";
import { TopNavigation } from "@/shared/layout/TopNavigation";

export function AppShell() {
  const [locale, setLocale] = useState<Locale>("es");
  const [query, setQuery] = useState("");
  const [selectedMangaId, setSelectedMangaId] = useState(mangaCatalog[0].id);

  const copy = getCopy(locale);

  const filteredMangas = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return mangaCatalog;
    }

    return mangaCatalog.filter((manga) => {
      const searchable = [
        manga.title,
        manga.altTitle,
        manga.author,
        manga.origin,
        manga.status[locale],
        manga.synopsis[locale],
        ...manga.genres,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [locale, query]);

  const selectedManga =
    mangaCatalog.find((manga) => manga.id === selectedMangaId) ??
    mangaCatalog[0];
  const recentMangas = [...mangaCatalog].sort((a, b) =>
    b.chapters[0].updatedAt.localeCompare(a.chapters[0].updatedAt),
  );

  const selectManga = (id: string) => {
    setSelectedMangaId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#090e1b] text-slate-100 selection:bg-amber-300 selection:text-slate-950">
      <TopNavigation
        copy={copy}
        locale={locale}
        query={query}
        onLocaleChange={setLocale}
        onQueryChange={setQuery}
        onLibraryClick={() => scrollToSection("library")}
        onReaderClick={() => scrollToSection("reader")}
      />

      <main>
        <HeroSpotlight
          copy={copy}
          locale={locale}
          manga={selectedManga}
          onRead={() => scrollToSection("reader")}
        />

        <div className="mx-auto grid max-w-[1480px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8 xl:gap-14">
          <div className="space-y-14">
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-200/20">
                AI
              </span>
              <p>{copy.announcement}</p>
            </div>

            <LibraryShelf
              copy={copy}
              locale={locale}
              title={copy.readingHistory}
              mangas={filteredMangas}
              selectedId={selectedManga.id}
              onSelect={selectManga}
            />

            <LibraryShelf
              copy={copy}
              locale={locale}
              title={copy.mostRecent}
              mangas={recentMangas}
              selectedId={selectedManga.id}
              onSelect={selectManga}
            />

            <ReaderPanel copy={copy} locale={locale} manga={selectedManga} />
          </div>

          <RankingPanel
            copy={copy}
            locale={locale}
            mangas={mangaCatalog}
            onSelect={selectManga}
          />
        </div>
      </main>
    </div>
  );
}
