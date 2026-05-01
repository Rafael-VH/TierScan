import { useMemo, useState } from "react";
import type { Locale, Manga, PublicationState } from "@/entities/manga/model";
import type { Copy } from "@/shared/i18n/translations";
import { CoverArt } from "@/shared/components/CoverArt";
import { cn } from "@/shared/utils/cn";

interface RankingPanelProps {
  copy: Copy;
  locale: Locale;
  mangas: Manga[];
  onSelect: (id: string) => void;
}

type RankingTab = "popular" | "recent" | PublicationState;

export function RankingPanel({
  copy,
  locale,
  mangas,
  onSelect,
}: RankingPanelProps) {
  const [activeTab, setActiveTab] = useState<RankingTab>("popular");
  const tabs: Array<{ id: RankingTab; label: string }> = [
    { id: "popular", label: copy.popular },
    { id: "recent", label: copy.recent },
    { id: "complete", label: copy.complete },
  ];

  const rankedMangas = useMemo(() => {
    if (activeTab === "complete") {
      return mangas
        .filter((manga) => manga.state === "complete")
        .sort((a, b) => a.ranking - b.ranking);
    }

    if (activeTab === "recent") {
      return [...mangas].sort((a, b) =>
        (b.chapters[0]?.updatedAt ?? b.lastUpdated).localeCompare(
          a.chapters[0]?.updatedAt ?? a.lastUpdated,
        ),
      );
    }

    return [...mangas].sort((a, b) => a.ranking - b.ranking);
  }, [activeTab, mangas]);

  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <div className="border-t border-white/10 pt-4 lg:border-t-0 lg:pt-0">
        <div className="mb-4 flex items-center gap-2 overflow-x-auto scrollbar-soft">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap border-b-2 px-3 py-2 text-sm font-black transition",
                activeTab === tab.id
                  ? "border-amber-300 text-white"
                  : "border-transparent text-slate-400 hover:text-white",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {rankedMangas.map((manga, index) => (
            <li key={manga.id}>
              <button
                type="button"
                onClick={() => onSelect(manga.id)}
                className="group grid w-full grid-cols-[1.75rem_3rem_minmax(0,1fr)] items-center gap-3 text-left sm:grid-cols-[2rem_3.25rem_minmax(0,1fr)]"
              >
                <span className="text-center text-sm font-black text-slate-500">
                  {index + 1}
                </span>
                <CoverArt
                  manga={manga}
                  compact
                  className="rounded-lg transition duration-300 group-hover:-translate-y-0.5"
                />
                <span className="min-w-0">
                  <span className="line-clamp-1 text-sm font-black text-white group-hover:text-amber-100">
                    {manga.title}
                  </span>
                  <span className="mt-1 line-clamp-1 text-xs text-slate-400">
                    {manga.genres.slice(0, 3).join(", ")}
                  </span>
                  <span className="mt-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    {manga.reads} {copy.reads} · {manga.status[locale]}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
