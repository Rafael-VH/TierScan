import { useEffect, useMemo } from "react";
import type { Locale, Manga, SpotlightMode } from "@/entities/manga/model";
import type { Copy } from "@/shared/i18n/translations";
import { languages } from "@/shared/i18n/translations";
import { cn } from "@/utils/cn";

interface SideDrawerProps {
  open: boolean;
  copy: Copy;
  locale: Locale;
  catalog: Manga[];
  onClose: () => void;
  onLocaleChange: (locale: Locale) => void;
  onSelectGenre: (genre: string) => void;
  onSelectOrigin: (origin: Manga["origin"]) => void;
  spotlightMode: SpotlightMode;
  onSpotlightModeChange: (mode: SpotlightMode) => void;
  onHomeClick: () => void;
}

export function SideDrawer({
  open,
  copy,
  locale,
  catalog,
  onClose,
  onLocaleChange,
  onSelectGenre,
  onSelectOrigin,
  spotlightMode,
  onSpotlightModeChange,
  onHomeClick,
}: SideDrawerProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    for (const m of catalog) for (const g of m.genres) set.add(g);
    return Array.from(set).sort();
  }, [catalog]);

  const origins: Manga["origin"][] = ["Manga", "Manhwa", "Manhua"];
  const spotlightOptions: Array<{ id: SpotlightMode; label: string }> = [
    { id: "reads", label: "Mas leidos" },
    { id: "new", label: copy.recent },
    { id: "ranking", label: "Ranking" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[80] flex w-[88%] max-w-sm flex-col bg-[#0b1120] shadow-2xl shadow-black/60 ring-1 ring-white/10 transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-base font-black tracking-tight text-white">
              {copy.appName}
            </p>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              {copy.library}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M6 18L18 6"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* Quick links */}
          <button
            type="button"
            onClick={() => {
              onHomeClick();
              onClose();
            }}
            className="mb-6 flex w-full items-center gap-3 rounded-xl bg-white/[0.04] px-4 py-3 text-left text-sm font-black text-white transition hover:bg-white/[0.08]"
          >
            <svg
              className="h-5 w-5 text-amber-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l9-9 9 9M5 10v10h14V10"
              />
            </svg>
            {copy.library}
          </button>

          {/* Spotlight selector */}
          <h3 className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            Slider principal
          </h3>
          <div className="mb-7 grid gap-2">
            {spotlightOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onSpotlightModeChange(option.id);
                  onClose();
                }}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left text-sm font-black transition",
                  spotlightMode === option.id
                    ? "border-amber-300/50 bg-amber-300/15 text-amber-100"
                    : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-amber-300/40 hover:bg-amber-300/10 hover:text-amber-200",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Origin filter */}
          <h3 className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            {copy.type}
          </h3>
          <div className="mb-7 grid grid-cols-3 gap-2">
            {origins.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => {
                  onSelectOrigin(o);
                  onClose();
                }}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs font-black text-slate-200 transition hover:border-amber-300/40 hover:bg-amber-300/10 hover:text-amber-200"
              >
                {o}
              </button>
            ))}
          </div>

          {/* Genres */}
          <h3 className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            {copy.genres}
          </h3>
          <div className="mb-7 flex flex-wrap gap-2">
            {allGenres.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  onSelectGenre(g);
                  onClose();
                }}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-amber-300/40 hover:bg-amber-300/10 hover:text-amber-200"
              >
                {g}
              </button>
            ))}
          </div>

          {/* Language */}
          <h3 className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            {copy.language}
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => onLocaleChange(lang.code)}
                className={cn(
                  "rounded-lg px-2 py-2 text-xs font-black transition",
                  locale === lang.code
                    ? "bg-amber-300 text-slate-950"
                    : "border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10",
                )}
                title={lang.label}
              >
                {lang.short}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-5 py-4">
          <p className="text-[11px] font-semibold text-slate-500">
            © {new Date().getFullYear()} {copy.appName}
          </p>
        </div>
      </aside>
    </>
  );
}
