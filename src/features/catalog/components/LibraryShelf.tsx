import type { Locale, Manga } from "@/entities/manga/model";
import type { Copy } from "@/shared/i18n/translations";
import { CoverArt } from "@/shared/components/CoverArt";
import { cn } from "@/utils/cn";

interface LibraryShelfProps {
  copy: Copy;
  locale: Locale;
  title: string;
  subtitle?: string;
  mangas: Manga[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function LibraryShelf({
  copy,
  locale,
  title,
  subtitle,
  mangas,
  selectedId,
  onSelect,
}: LibraryShelfProps) {
  return (
    <section className="scroll-mt-24">
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="block h-6 w-1 rounded-full bg-amber-300" />
            <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="mt-2 pl-4 text-sm text-slate-400">{subtitle}</p>
          )}
        </div>
        <button
          type="button"
          className="hidden text-sm font-bold text-amber-200 transition hover:text-amber-100 sm:block"
        >
          {copy.viewAll}
        </button>
      </div>

      {mangas.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.04] p-6 text-sm text-slate-300">
          {copy.noResults}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 md:gap-x-6 xl:grid-cols-5 2xl:grid-cols-6">
          {mangas.map((manga) => (
            <button
              key={manga.id}
              type="button"
              onClick={() => onSelect(manga.id)}
              aria-pressed={selectedId === manga.id}
              className="group text-left outline-none"
            >
              <CoverArt
                manga={manga}
                compact
                className={cn(
                  "transition duration-500 group-hover:-translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-amber-200",
                  selectedId === manga.id && "ring-2 ring-amber-300",
                )}
              />
              <p className="mt-3 line-clamp-2 text-sm font-black leading-tight text-white transition group-hover:text-amber-100">
                {manga.title}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                {copy.chapter} {manga.chapters[0]?.number ?? "—"} ·{" "}
                {manga.status[locale]}
              </p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
