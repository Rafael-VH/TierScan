import type { Locale } from "@/entities/manga/model";
import type { Copy } from "@/shared/i18n/translations";
import { languages } from "@/shared/i18n/translations";

interface TopNavigationProps {
  copy: Copy;
  locale: Locale;
  query: string;
  onLocaleChange: (locale: Locale) => void;
  onQueryChange: (query: string) => void;
  onLibraryClick: () => void;
  onReaderClick: () => void;
}

export function TopNavigation({
  copy,
  locale,
  query,
  onLocaleChange,
  onQueryChange,
  onLibraryClick,
  onReaderClick,
}: TopNavigationProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0d1424]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1480px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label={copy.library}
          onClick={onLibraryClick}
          className="grid h-10 w-10 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>

        <button type="button" onClick={onLibraryClick} className="text-left">
          <span className="block text-base font-black tracking-tight text-white">{copy.appName}</span>
          <span className="hidden text-xs text-slate-400 sm:block">{copy.brandLine}</span>
        </button>

        <label className="relative ml-auto hidden min-w-0 flex-1 max-w-xl md:block">
          <span className="sr-only">{copy.searchPlaceholder}</span>
          <svg className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={copy.searchPlaceholder}
            className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/60 focus:bg-white/[0.09]"
          />
        </label>

        <nav className="hidden items-center gap-1 lg:flex">
          <button type="button" onClick={onLibraryClick} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white">
            {copy.library}
          </button>
          <button type="button" onClick={onReaderClick} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white">
            {copy.reader}
          </button>
        </nav>

        <label className="relative">
          <span className="sr-only">{copy.language}</span>
          <select
            value={locale}
            onChange={(event) => onLocaleChange(event.target.value as Locale)}
            className="h-10 rounded-lg border border-white/10 bg-white/[0.06] px-3 text-sm font-bold text-white outline-none transition focus:border-amber-300/70"
          >
            {languages.map((language) => (
              <option key={language.code} value={language.code} className="bg-slate-950 text-white">
                {language.short}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          aria-label={copy.reader}
          onClick={onReaderClick}
          className="grid h-10 w-10 place-items-center rounded-full border border-amber-300/30 bg-amber-300/10 text-amber-200 transition hover:border-amber-200 hover:bg-amber-300/20"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 4h9a3 3 0 0 1 3 3v13H9a3 3 0 0 0-3-3V4Z" />
            <path d="M6 4v13" />
          </svg>
        </button>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <label className="relative block">
          <span className="sr-only">{copy.searchPlaceholder}</span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={copy.searchPlaceholder}
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-300/60"
          />
        </label>
      </div>
    </header>
  );
}