import { useEffect, useMemo, useState } from "react";
import type { Locale, Manga, SpotlightMode } from "@/entities/manga/model";
import type { Copy } from "@/shared/i18n/translations";
import { CoverArt } from "@/shared/components/CoverArt";
import { cn } from "@/utils/cn";

interface HomeSliderProps {
  copy: Copy;
  locale: Locale;
  mangas: Manga[];
  mode: SpotlightMode;
  onSelect: (id: string) => void;
}

export function HomeSlider({
  copy,
  locale,
  mangas,
  mode,
  onSelect,
}: HomeSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeManga = mangas[activeIndex] ?? mangas[0];

  useEffect(() => {
    setActiveIndex(0);
  }, [mode, mangas]);

  useEffect(() => {
    if (mangas.length <= 1) return;
    const intervalId = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % mangas.length);
    }, 5200);
    return () => window.clearInterval(intervalId);
  }, [mangas.length]);

  const label = useMemo(() => {
    if (mode === "reads") return "Mas leidos";
    if (mode === "new") return copy.recent;
    return "Mejor ranking";
  }, [copy.recent, mode]);

  if (!activeManga) return null;

  return (
    <section
      className="relative isolate overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${activeManga.colorFrom}55, transparent 45%), radial-gradient(circle at 78% 14%, ${activeManga.accent}3d, transparent 26%), #090e1b`,
      }}
    >
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[length:72px_72px]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-t from-[#090e1b] to-transparent" />

      <div className="mx-auto grid min-h-[520px] max-w-[1480px] items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-[240px_minmax(0,1fr)] lg:min-h-[560px] lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <button
          type="button"
          onClick={() => onSelect(activeManga.id)}
          className="mx-auto w-44 animate-float-slow transition hover:scale-[1.02] active:scale-[0.98] sm:w-56 md:mx-0 lg:w-64"
          aria-label={activeManga.title}
        >
          <CoverArt manga={activeManga} />
        </button>

        <div className="max-w-5xl text-center md:text-left">
          <p className="text-xs font-black uppercase tracking-[0.34em] text-amber-200/90">
            {label}
          </p>
          <h1 className="mt-5 max-w-5xl text-balance text-4xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {activeManga.title}
          </h1>
          <p className="mt-3 text-lg font-semibold text-slate-300">
            {activeManga.altTitle}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start">
            {[
              activeManga.origin,
              activeManga.status[locale],
              ...activeManga.genres.slice(0, 3),
            ].map((item) => (
              <span
                key={item}
                className="rounded-md bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-100 ring-1 ring-white/10"
              >
                {item}
              </span>
            ))}
          </div>

          <p className="mt-6 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
            {activeManga.synopsis[locale]}
          </p>

          <div className="mt-8 flex flex-col items-center gap-5 md:items-start">
            <button
              type="button"
              onClick={() => onSelect(activeManga.id)}
              className="rounded-xl bg-amber-300 px-6 py-3 text-sm font-black uppercase tracking-wide text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-200"
            >
              {copy.details}
            </button>

            <div className="flex items-center gap-2">
              {mangas.map((manga, index) => (
                <button
                  key={manga.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "h-2.5 rounded-full transition-all",
                    index === activeIndex
                      ? "w-9 bg-amber-300"
                      : "w-2.5 bg-white/25 hover:bg-white/50",
                  )}
                  aria-label={`${copy.page} ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
