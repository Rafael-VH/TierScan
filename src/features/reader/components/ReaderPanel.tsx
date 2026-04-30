import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { Locale, Manga, ReadMode } from "@/entities/manga/model";
import type { Copy } from "@/shared/i18n/translations";
import { cn } from "@/utils/cn";

interface ReaderPanelProps {
  copy: Copy;
  locale: Locale;
  manga: Manga;
  initialChapterId?: string;
  onBack: () => void;
}

export function ReaderPanel({
  copy,
  locale,
  manga,
  initialChapterId,
  onBack,
}: ReaderPanelProps) {
  const [chapterId, setChapterId] = useState(
    initialChapterId || manga.chapters[0].id,
  );
  const [mode, setMode] = useState<ReadMode>("webtoon");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (initialChapterId) {
      setChapterId(initialChapterId);
    }
    setCurrentPage(1);
  }, [initialChapterId, manga]);

  const chapter = useMemo(
    () =>
      manga.chapters.find((item) => item.id === chapterId) ?? manga.chapters[0],
    [chapterId, manga.chapters],
  );

  const pages =
    mode === "webtoon"
      ? Array.from({ length: chapter.pages }, (_, index) => index + 1)
      : [currentPage];
  const progress =
    mode === "webtoon"
      ? chapter.progress
      : Math.round((currentPage / chapter.pages) * 100);

  const handleChapterChange = (nextChapterId: string) => {
    setChapterId(nextChapterId);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const movePage = (direction: -1 | 1) => {
    setCurrentPage((page) =>
      Math.min(chapter.pages, Math.max(1, page + direction)),
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="animate-reader-in min-h-screen">
      {/* Floating back button */}
      <button
        onClick={onBack}
        className="fixed left-4 top-4 z-50 flex h-10 items-center gap-2 rounded-xl bg-slate-900/80 px-4 text-sm font-bold text-slate-200 shadow-lg shadow-black/30 ring-1 ring-white/10 backdrop-blur-xl transition hover:bg-slate-800 hover:text-white active:scale-95 sm:left-5 sm:top-5"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span className="hidden sm:inline">{copy.backToDetails}</span>
      </button>

      {/* Reader header */}
      <div className="mx-auto max-w-4xl px-4 pb-4 pt-20 sm:px-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-200/80">
          {manga.title}
        </p>
        <h2 className="mt-1.5 text-xl font-black tracking-tight text-white sm:text-2xl">
          {copy.chapter} {chapter.number}: {chapter.title[locale]}
        </h2>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          {copy.progress}: {progress}%
        </p>
      </div>

      {/* Controls bar */}
      <div className="mx-auto max-w-4xl px-4 pb-6 sm:px-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          {/* Chapter selector */}
          <select
            value={chapterId}
            onChange={(event) => handleChapterChange(event.target.value)}
            className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm font-bold text-white outline-none focus:border-amber-300/70"
          >
            {manga.chapters.map((item) => (
              <option key={item.id} value={item.id}>
                {copy.chapter} {item.number}: {item.title[locale]}
              </option>
            ))}
          </select>

          {/* Reading mode toggle */}
          <div className="flex shrink-0 rounded-xl border border-white/10 bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("webtoon");
                setCurrentPage(1);
              }}
              className={cn(
                "rounded-lg px-3.5 py-2 text-xs font-black transition",
                mode === "webtoon"
                  ? "bg-amber-300 text-slate-950"
                  : "text-slate-400 hover:bg-white/10 hover:text-white",
              )}
            >
              {copy.webtoon}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("paged");
                setCurrentPage(1);
              }}
              className={cn(
                "rounded-lg px-3.5 py-2 text-xs font-black transition",
                mode === "paged"
                  ? "bg-amber-300 text-slate-950"
                  : "text-slate-400 hover:bg-white/10 hover:text-white",
              )}
            >
              {copy.paged}
            </button>
          </div>
        </div>
      </div>

      {/* Reader viewport — fully responsive, no manual dimension picker */}
      <div className="bg-[#060a14] px-2 pb-16 sm:px-4 md:px-6">
        <div className="mx-auto w-full max-w-4xl">
          <div
            className={cn(
              "grid gap-1",
              mode === "paged" && "place-items-center",
            )}
          >
            {pages.map((page) => (
              <ComicPage
                key={`${chapter.id}-${page}-${mode}`}
                copy={copy}
                manga={manga}
                page={page}
                totalPages={chapter.pages}
                paged={mode === "paged"}
              />
            ))}
          </div>

          {mode === "paged" && (
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => movePage(-1)}
                disabled={currentPage === 1}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {copy.previous}
              </button>
              <span className="text-sm font-bold text-slate-400">
                {copy.page} {currentPage} / {chapter.pages}
              </span>
              <button
                type="button"
                onClick={() => movePage(1)}
                disabled={currentPage === chapter.pages}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {copy.next}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Comic Page ---- */

interface ComicPageProps {
  copy: Copy;
  manga: Manga;
  page: number;
  totalPages: number;
  paged: boolean;
}

function ComicPage({ copy, manga, page, totalPages, paged }: ComicPageProps) {
  const pageStyle: CSSProperties = {
    background: `linear-gradient(150deg, ${manga.colorFrom}, ${manga.colorTo}), radial-gradient(circle at 70% 12%, rgba(255,255,255,0.34), transparent 22%)`,
  };

  return (
    <article
      className={cn(
        "reader-page animate-reader-in overflow-hidden text-white",
        paged
          ? "aspect-[3/4] w-full rounded-lg border border-white/10 shadow-2xl shadow-black/40"
          : "min-h-[80vh] w-full sm:min-h-[90vh]",
      )}
      style={pageStyle}
    >
      <div className="relative flex h-full min-h-[inherit] flex-col justify-between bg-[linear-gradient(180deg,rgba(2,6,23,0.05),rgba(2,6,23,0.78))] p-5 sm:p-8 md:p-10">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.28em] text-white/50">
          <span>{manga.origin}</span>
          <span>
            {copy.page} {page}/{totalPages}
          </span>
        </div>

        <div className="mx-auto grid w-full max-w-md gap-5 py-8 sm:py-12">
          <div className="h-24 rounded-full border border-white/20 bg-white/10 sm:h-28" />
          <div className="grid gap-3">
            <div className="h-3 w-3/4 rounded-full bg-white/70 sm:h-4" />
            <div className="h-3 w-full rounded-full bg-white/40 sm:h-4" />
            <div className="h-3 w-2/3 rounded-full bg-white/30 sm:h-4" />
          </div>
        </div>

        <div>
          <p className="text-2xl font-black tracking-tight sm:text-4xl md:text-5xl">
            {manga.title}
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-white/50">
            {copy.pages} {totalPages}
          </p>
        </div>
      </div>
    </article>
  );
}
