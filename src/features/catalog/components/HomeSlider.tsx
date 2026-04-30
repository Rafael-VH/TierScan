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
    const id = window.setInterval(
      () => setActiveIndex((i) => (i + 1) % mangas.length),
      5200,
    );
    return () => window.clearInterval(id);
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
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-[#090e1b] to-transparent" />

      <div className="mx-auto grid max-w-[1480px] items-center gap-6 px-4 py-10 sm:px-6 md:grid-cols-[180px_minmax(0,1fr)] md:py-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <button
          type="button"
          onClick={() => onSelect(activeManga.id)}
          className="mx-auto w-36 animate-float-slow transition hover:scale-[1.02] active:scale-[0.98] sm:w-44 md:mx-0 lg:w-52"
          aria-label={activeManga.title}
        >
          <CoverArt manga={activeManga} compact />
        </button>

        <div className="max-w-3xl text-center md:text-left">
          <p className="text-[11px] font-black uppercase tracking-[0.34em] text-amber-200/90">
            {label}
          </p>

          <h1 className="mt-3 line-clamp-2 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
            {activeManga.title}
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            {activeManga.altTitle}
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-1.5 md:justify-start">
            {[
              activeManga.origin,
              activeManga.status[locale],
              ...activeManga.genres.slice(0, 3),
            ].map((t) => (
              <span
                key={t}
                className="rounded-md bg-white/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-200 ring-1 ring-white/10"
              >
                {t}
              </span>
            ))}
          </div>

          <p className="mt-4 line-clamp-3 max-w-2xl text-sm leading-6 text-slate-300">
            {activeManga.synopsis[locale]}
          </p>

          <div className="mt-5 flex flex-col items-center gap-4 md:items-start">
            <button
              type="button"
              onClick={() => onSelect(activeManga.id)}
              className="rounded-xl bg-amber-300 px-5 py-2.5 text-sm font-black uppercase tracking-wide text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-200"
            >
              {copy.details}
            </button>

            <div className="flex items-center gap-2">
              {mangas.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === activeIndex
                      ? "w-8 bg-amber-300"
                      : "w-2 bg-white/25 hover:bg-white/50",
                  )}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
