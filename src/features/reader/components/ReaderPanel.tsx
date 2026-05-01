import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { Locale, Manga, ReadMode } from "@/entities/manga/model";
import type { Copy } from "@/shared/i18n/translations";
import { cn } from "@/shared/utils/cn";

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
  const [toolbarVisible, setToolbarVisible] = useState(true);

  const lastScrollY = useRef(0);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  /* ---- sync on prop change ---- */
  useEffect(() => {
    if (initialChapterId) setChapterId(initialChapterId);
    setCurrentPage(1);
  }, [initialChapterId, manga]);

  /* ---- chapter data ---- */
  const chapter = useMemo(
    () => manga.chapters.find((c) => c.id === chapterId) ?? manga.chapters[0],
    [chapterId, manga.chapters],
  );

  const chapterIndex = manga.chapters.findIndex((c) => c.id === chapterId);
  const prevChapter = manga.chapters[chapterIndex + 1] ?? null;
  const nextChapter = manga.chapters[chapterIndex - 1] ?? null;

  const pages =
    mode === "webtoon"
      ? Array.from({ length: chapter.pages }, (_, i) => i + 1)
      : [currentPage];

  const progress =
    mode === "webtoon"
      ? chapter.progress
      : Math.round((currentPage / chapter.pages) * 100);

  /* ---- toolbar visibility ---- */
  const showToolbar = useCallback(() => {
    setToolbarVisible(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setToolbarVisible(false), 4000);
  }, []);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastScrollY.current + 12) {
        setToolbarVisible(false);
        clearTimeout(hideTimerRef.current);
      } else if (y < lastScrollY.current - 12) {
        showToolbar();
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showToolbar]);

  // Hide on tap outside toolbar
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(e.target as Node)
      ) {
        if (toolbarVisible) {
          setToolbarVisible(false);
          clearTimeout(hideTimerRef.current);
        } else {
          showToolbar();
        }
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [toolbarVisible, showToolbar]);

  // Show initially then auto-hide
  useEffect(() => {
    showToolbar();
    return () => clearTimeout(hideTimerRef.current);
  }, [showToolbar]);

  /* ---- actions ---- */
  const handleChapterChange = (id: string) => {
    setChapterId(id);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToolbar();
  };

  const movePage = (dir: -1 | 1) => {
    setCurrentPage((p) => Math.min(chapter.pages, Math.max(1, p + dir)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToChapter = (ch: typeof prevChapter) => {
    if (!ch) return;
    handleChapterChange(ch.id);
  };

  return (
    <div className="min-h-screen select-none bg-[#050810]">
      {/* ---- Floating back button (top-left, always visible) ---- */}
      <button
        onClick={onBack}
        className="fixed left-4 top-4 z-[60] flex h-10 items-center gap-2 rounded-xl bg-slate-900/80 px-4 text-sm font-bold text-slate-200 shadow-lg shadow-black/40 ring-1 ring-white/10 backdrop-blur-xl transition hover:bg-slate-800 hover:text-white active:scale-95 sm:left-5 sm:top-5"
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

      {/* ---- Minimal top info (fades with toolbar) ---- */}
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-black/70 via-black/30 to-transparent px-4 pb-10 pt-5 transition-all duration-500 sm:px-6",
          toolbarVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0",
        )}
      >
        <div className="mx-auto max-w-4xl pl-16">
          <p className="truncate text-xs font-black uppercase tracking-[0.24em] text-amber-200/70">
            {manga.title}
          </p>
          <p className="mt-1 truncate text-sm font-bold text-white/80">
            {copy.chapter} {chapter.number} — {chapter.title[locale]}
          </p>
        </div>
      </div>

      {/* ---- Reader viewport ---- */}
      <div className="mx-auto w-full max-w-4xl">
        {/* Webtoon: seamless vertical strip, zero gap */}
        {mode === "webtoon" && (
          <div className="flex flex-col">
            {pages.map((page) => (
              <ComicPage
                key={`${chapter.id}-${page}-w`}
                copy={copy}
                manga={manga}
                page={page}
                totalPages={chapter.pages}
                imageUrl={chapter.pageImages?.[page - 1]}
                paged={false}
              />
            ))}

            {/* End-of-chapter navigation */}
            <div className="flex flex-col items-center gap-4 bg-[#050810] px-4 py-16">
              <p className="text-sm font-bold text-slate-500">
                {copy.chapter} {chapter.number} — {copy.complete}
              </p>
              <div className="flex gap-3">
                {prevChapter && (
                  <button
                    onClick={() => goToChapter(prevChapter)}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-black text-white transition hover:bg-white/10"
                  >
                    ← {copy.previous}
                  </button>
                )}
                {nextChapter && (
                  <button
                    onClick={() => goToChapter(nextChapter)}
                    className="rounded-xl bg-amber-300 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:bg-amber-200"
                  >
                    {copy.next} →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Paged mode */}
        {mode === "paged" && (
          <div className="flex min-h-screen flex-col items-center justify-center px-2 py-16 sm:px-4">
            <ComicPage
              key={`${chapter.id}-${currentPage}-p`}
              copy={copy}
              manga={manga}
              page={currentPage}
              totalPages={chapter.pages}
              imageUrl={chapter.pageImages?.[currentPage - 1]}
              paged
            />

            <div className="mt-6 flex w-full max-w-md items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => movePage(-1)}
                disabled={currentPage === 1}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {copy.previous}
              </button>
              <span className="text-sm font-bold text-slate-400">
                {currentPage} / {chapter.pages}
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
          </div>
        )}
      </div>

      {/* ---- Floating bottom toolbar ---- */}
      <div
        ref={toolbarRef}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-4 transition-all duration-500 sm:px-6",
          toolbarVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-[calc(100%+1rem)] opacity-0",
        )}
      >
        <div className="flex w-full max-w-xl items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/90 p-2 shadow-2xl shadow-black/60 ring-1 ring-black/30 backdrop-blur-2xl sm:gap-3 sm:p-2.5">
          {/* Chapter selector */}
          <select
            value={chapterId}
            onChange={(e) => handleChapterChange(e.target.value)}
            className="h-10 min-w-0 flex-1 truncate rounded-xl border border-white/10 bg-white/[0.06] px-3 text-xs font-bold text-white outline-none transition focus:border-amber-300/60 sm:text-sm"
          >
            {manga.chapters.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-950">
                Ch. {c.number}: {c.title[locale]}
              </option>
            ))}
          </select>

          {/* Divider */}
          <div className="h-6 w-px shrink-0 bg-white/10" />

          {/* Mode toggle */}
          <div className="flex shrink-0 rounded-xl border border-white/10 bg-white/[0.04] p-0.5">
            <button
              type="button"
              onClick={() => {
                setMode("webtoon");
                setCurrentPage(1);
                showToolbar();
              }}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-black transition",
                mode === "webtoon"
                  ? "bg-amber-300 text-slate-950"
                  : "text-slate-400 hover:bg-white/10 hover:text-white",
              )}
            >
              {/* Cascade icon */}
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
              >
                <rect x="3" y="1" width="10" height="4" rx="1" />
                <rect x="3" y="6" width="10" height="4" rx="1" />
                <rect x="3" y="11" width="10" height="4" rx="1" />
              </svg>
              <span className="hidden sm:inline">{copy.webtoon}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("paged");
                setCurrentPage(1);
                showToolbar();
              }}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-black transition",
                mode === "paged"
                  ? "bg-amber-300 text-slate-950"
                  : "text-slate-400 hover:bg-white/10 hover:text-white",
              )}
            >
              {/* Single page icon */}
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
              >
                <rect x="2" y="1" width="12" height="14" rx="2" />
              </svg>
              <span className="hidden sm:inline">{copy.paged}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="h-6 w-px shrink-0 bg-white/10" />

          {/* Progress badge */}
          <div className="hidden shrink-0 items-center gap-1.5 rounded-lg bg-white/[0.06] px-2.5 py-1.5 sm:flex">
            <div className="h-1.5 w-12 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-amber-300 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-black tabular-nums text-slate-400">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  Comic Page                                                      */
/* ================================================================ */

interface ComicPageProps {
  copy: Copy;
  manga: Manga;
  page: number;
  totalPages: number;
  imageUrl?: string;
  paged: boolean;
}

function ComicPage({
  copy,
  manga,
  page,
  totalPages,
  imageUrl,
  paged,
}: ComicPageProps) {
  const pageStyle: CSSProperties = {
    background: `linear-gradient(150deg, ${manga.colorFrom}, ${manga.colorTo}), radial-gradient(circle at 70% 12%, rgba(255,255,255,0.34), transparent 22%)`,
  };

  if (imageUrl) {
    return (
      <article
        className={cn(
          "reader-page w-full overflow-hidden",
          paged
            ? "aspect-[3/4] rounded-lg border border-white/10 shadow-2xl shadow-black/40"
            : "",
        )}
      >
        <img
          src={imageUrl}
          alt={`${manga.title} ${copy.page} ${page}`}
          className={cn("w-full", paged ? "h-full object-contain" : "block")}
          loading="lazy"
          draggable={false}
        />
      </article>
    );
  }

  // Demo placeholder page
  return (
    <article
      className={cn(
        "reader-page overflow-hidden text-white",
        paged
          ? "aspect-[3/4] w-full rounded-lg border border-white/10 shadow-2xl shadow-black/40"
          : "w-full",
      )}
      style={pageStyle}
    >
      <div
        className={cn(
          "relative flex flex-col justify-between bg-[linear-gradient(180deg,rgba(2,6,23,0.05),rgba(2,6,23,0.78))]",
          paged
            ? "h-full p-5 sm:p-8 md:p-10"
            : "min-h-[80vh] p-5 sm:min-h-[90vh] sm:p-8 md:p-10",
        )}
      >
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.28em] text-white/40">
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
            {copy.page} {page} · {copy.pages} {totalPages}
          </p>
        </div>
      </div>
    </article>
  );
}
