import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale, Manga } from "@/entities/manga/model";
import type { Copy } from "@/shared/i18n/translations";
import { languages } from "@/shared/i18n/translations";
import { cn } from "@/shared/utils/cn";

interface TopNavigationProps {
  copy: Copy;
  locale: Locale;
  query: string;
  catalog: Manga[];
  onLocaleChange: (locale: Locale) => void;
  onQueryChange: (query: string) => void;
  onOpenDrawer: () => void;
  onHomeClick: () => void;
  onSelectManga: (id: string) => void;
}

export function TopNavigation({
  copy,
  locale,
  query,
  catalog,
  onLocaleChange,
  onQueryChange,
  onOpenDrawer,
  onHomeClick,
  onSelectManga,
}: TopNavigationProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Live search results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return catalog
      .filter((m) =>
        [m.title, m.altTitle, m.author, m.origin, ...m.genres]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 6);
  }, [catalog, query]);

  // Close dropdown on outside click
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  const showDropdown = focused && query.trim().length > 0;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0d1424]/85 backdrop-blur-xl">
      <div
        ref={containerRef}
        className="mx-auto flex h-14 max-w-[1480px] items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6 lg:px-8"
      >
        {/* Drawer trigger */}
        <button
          type="button"
          aria-label="Open menu"
          onClick={onOpenDrawer}
          className="grid h-11 w-11 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>

        {/* Brand (no subtitle) */}
        <button
          type="button"
          onClick={onHomeClick}
          className="text-sm font-black tracking-tight text-white sm:text-base"
        >
          {copy.appName}
        </button>

        {/* Desktop search with dropdown */}
        <div className="relative ml-auto hidden min-w-0 flex-1 max-w-xl md:block">
          <label className="relative block">
            <span className="sr-only">{copy.searchPlaceholder}</span>
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder={copy.searchPlaceholder}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/60 focus:bg-white/[0.09]"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-white/10 hover:text-white"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6l12 12M6 18L18 6"
                  />
                </svg>
              </button>
            )}
          </label>

          {showDropdown && (
            <SearchDropdown
              copy={copy}
              locale={locale}
              results={results}
              onSelect={(id) => {
                onSelectManga(id);
                onQueryChange("");
                setFocused(false);
              }}
            />
          )}
        </div>

        {/* Mobile search toggle */}
        <button
          type="button"
          aria-label="Search"
          onClick={() => setSearchOpen((v) => !v)}
          className="ml-auto grid h-11 w-11 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white md:hidden"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Language selector */}
        <label className="relative">
          <span className="sr-only">{copy.language}</span>
          <select
            value={locale}
            onChange={(e) => onLocaleChange(e.target.value as Locale)}
            className="h-11 rounded-lg border border-white/10 bg-white/[0.06] px-3 text-sm font-bold text-white outline-none transition focus:border-amber-300/70"
          >
            {languages.map((lang) => (
              <option
                key={lang.code}
                value={lang.code}
                className="bg-slate-950 text-white"
              >
                {lang.short}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Mobile expandable search */}
      <div
        className={cn(
          "overflow-hidden border-t border-white/10 transition-all duration-300 md:hidden",
          searchOpen ? "max-h-[28rem]" : "max-h-0 border-transparent",
        )}
      >
        <div className="space-y-2 px-4 py-3">
          <label className="relative block">
            <span className="sr-only">{copy.searchPlaceholder}</span>
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              autoFocus={searchOpen}
              placeholder={copy.searchPlaceholder}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-300/60"
            />
          </label>

          {results.length > 0 && (
            <div className="max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/60 p-1">
              {results.map((m) => (
                <SearchResultRow
                  key={m.id}
                  copy={copy}
                  locale={locale}
                  manga={m}
                  onSelect={() => {
                    onSelectManga(m.id);
                    onQueryChange("");
                    setSearchOpen(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* --------- Helpers --------- */

interface SearchDropdownProps {
  copy: Copy;
  locale: Locale;
  results: Manga[];
  onSelect: (id: string) => void;
}

function SearchDropdown({
  copy,
  locale,
  results,
  onSelect,
}: SearchDropdownProps) {
  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 p-1 shadow-2xl shadow-black/60 ring-1 ring-black/30 backdrop-blur-xl">
      {results.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm font-bold text-slate-500">
          {copy.noResults}
        </p>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {results.map((m) => (
            <SearchResultRow
              key={m.id}
              copy={copy}
              locale={locale}
              manga={m}
              onSelect={() => onSelect(m.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SearchResultRowProps {
  copy: Copy;
  locale: Locale;
  manga: Manga;
  onSelect: () => void;
}

function SearchResultRow({
  copy,
  locale,
  manga,
  onSelect,
}: SearchResultRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-white/[0.06]"
    >
      <div
        className="h-12 w-9 shrink-0 rounded-md ring-1 ring-white/10"
        style={{
          background: `linear-gradient(145deg, ${manga.colorFrom}, ${manga.colorTo})`,
        }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-white group-hover:text-amber-100">
          {manga.title}
        </p>
        <p className="truncate text-xs font-semibold text-slate-500">
          {manga.origin} · {manga.status[locale]} ·{" "}
          {manga.genres.slice(0, 2).join(", ")}
        </p>
      </div>
      <span className="hidden shrink-0 rounded-md bg-amber-300/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-200 ring-1 ring-amber-300/20 sm:inline">
        {copy.chapter} {manga.chapters[0]?.number ?? "—"}
      </span>
    </button>
  );
}
