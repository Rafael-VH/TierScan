import type { CSSProperties } from "react";
import type { Locale, Manga } from "@/entities/manga/model";
import type { Copy } from "@/shared/i18n/translations";
import { CoverArt } from "@/shared/components/CoverArt";

interface HeroSpotlightProps {
  copy: Copy;
  locale: Locale;
  manga: Manga;
  onRead: () => void;
}

export function HeroSpotlight({
  copy,
  locale,
  manga,
  onRead,
}: HeroSpotlightProps) {
  const heroStyle: CSSProperties = {
    background: `radial-gradient(circle at 18% 12%, ${manga.accent}42, transparent 30%), linear-gradient(120deg, ${manga.colorFrom}33, transparent 46%), linear-gradient(180deg, rgba(9,14,27,0.55), #090e1b 92%)`,
  };

  return (
    <section
      className="relative isolate overflow-hidden pt-24 md:pt-20"
      style={heroStyle}
    >
      <div className="absolute inset-0 -z-10 animate-aurora bg-[radial-gradient(circle_at_70%_12%,rgba(255,255,255,0.16),transparent_20%),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:auto,76px_76px,76px_76px]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-[#090e1b] to-transparent" />

      <div className="mx-auto grid min-h-[620px] max-w-[1480px] items-center gap-8 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
        <div className="mx-auto w-44 animate-float-slow sm:w-56 md:mx-0 lg:w-64">
          <CoverArt manga={manga} />
        </div>

        <div className="max-w-5xl text-center md:text-left">
          <p className="text-sm font-black uppercase tracking-[0.32em] text-amber-200/90">
            {copy.appName}
          </p>
          <h1 className="mt-5 max-w-5xl text-balance text-4xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {manga.title}
          </h1>
          <p className="mt-3 text-lg font-semibold text-slate-300">
            {manga.altTitle}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start">
            {[manga.safety, manga.origin, ...manga.genres.slice(0, 4)].map(
              (label) => (
                <span
                  key={label}
                  className="rounded-md bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-100 ring-1 ring-white/10"
                >
                  {label}
                </span>
              ),
            )}
          </div>

          <p className="mt-6 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
            {manga.synopsis[locale]}
          </p>
          <p className="mt-8 text-sm font-bold italic text-slate-200">
            {manga.author}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
            <button
              type="button"
              onClick={onRead}
              className="rounded-xl bg-amber-300 px-6 py-3 text-sm font-black uppercase tracking-wide text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-100"
            >
              {copy.continueReading}
            </button>
            <button
              type="button"
              onClick={onRead}
              className="rounded-xl border border-white/15 px-6 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              {copy.startReading}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
