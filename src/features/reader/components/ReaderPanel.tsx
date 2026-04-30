import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type {
  DimensionPreset,
  Locale,
  Manga,
  ReadMode,
} from "@/entities/manga/model";
import type { Copy } from "@/shared/i18n/translations";
import { cn } from "@/utils/cn";

interface ReaderPanelProps {
  copy: Copy;
  locale: Locale;
  manga: Manga;
}

const readerWidthByPreset: Record<DimensionPreset, string> = {
  phone: "max-w-[390px]",
  tablet: "max-w-[720px]",
  desktop: "max-w-[980px]",
};

export function ReaderPanel({ copy, locale, manga }: ReaderPanelProps) {
  const [chapterId, setChapterId] = useState(manga.chapters[0].id);
  const [mode, setMode] = useState<ReadMode>("webtoon");
  const [screenPreset, setScreenPreset] = useState<DimensionPreset>("desktop");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setChapterId(manga.chapters[0].id);
    setCurrentPage(1);
  }, [manga]);

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
  };

  const movePage = (direction: -1 | 1) => {
    setCurrentPage((page) =>
      Math.min(chapter.pages, Math.max(1, page + direction)),
    );
  };

  return (
    <section id="reader" className="scroll-mt-24">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-200">
            {copy.reader}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
            {copy.onlineReader}
          </h2>
        </div>
        <p className="text-sm font-semibold text-slate-400">
          {copy.progress}: {progress}%
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/25">
        <div className="flex flex-col gap-4 border-b border-white/10 p-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="grid gap-2 text-sm font-bold text-slate-300">
            {copy.chapter}
            <select
              value={chapterId}
              onChange={(event) => handleChapterChange(event.target.value)}
              className="h-11 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-amber-300/70"
            >
              {manga.chapters.map((item) => (
                <option key={item.id} value={item.id}>
                  {copy.chapter} {item.number}: {item.title[locale]}
                </option>
              ))}
            </select>
          </label>

          <SegmentedControl
            label={copy.readingMode}
            options={[
              { id: "webtoon", label: copy.webtoon },
              { id: "paged", label: copy.paged },
            ]}
            value={mode}
            onChange={(value) => {
              setMode(value);
              setCurrentPage(1);
            }}
          />

          <SegmentedControl
            label={copy.screenSize}
            options={[
              { id: "phone", label: copy.phone },
              { id: "tablet", label: copy.tablet },
              { id: "desktop", label: copy.desktop },
            ]}
            value={screenPreset}
            onChange={setScreenPreset}
          />
        </div>

        <div className="bg-[#070b15] px-3 py-6 sm:px-6 lg:px-8">
          <div
            className={cn(
              "mx-auto transition-all duration-500",
              readerWidthByPreset[screenPreset],
            )}
          >
            <div
              className={cn(
                "grid gap-4",
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
              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => movePage(-1)}
                  disabled={currentPage === 1}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {copy.previous}
                </button>
                <span className="text-sm font-bold text-slate-300">
                  {copy.page} {currentPage} / {chapter.pages}
                </span>
                <button
                  type="button"
                  onClick={() => movePage(1)}
                  disabled={currentPage === chapter.pages}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {copy.next}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

interface SegmentedControlProps<T extends string> {
  label: string;
  options: Array<{ id: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}

function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-bold text-slate-300">{label}</span>
      <div className="flex rounded-xl border border-white/10 bg-slate-950 p-1">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-black transition",
              value === option.id
                ? "bg-amber-300 text-slate-950"
                : "text-slate-300 hover:bg-white/10 hover:text-white",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

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
        "reader-page animate-reader-in overflow-hidden rounded-sm border border-white/10 text-white shadow-2xl shadow-black/40",
        paged ? "aspect-[3/4] min-h-[520px] w-full" : "min-h-[72vh] w-full",
      )}
      style={pageStyle}
    >
      <div className="relative flex h-full min-h-[inherit] flex-col justify-between bg-[linear-gradient(180deg,rgba(2,6,23,0.05),rgba(2,6,23,0.78))] p-6 sm:p-10">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.28em] text-white/70">
          <span>{manga.origin}</span>
          <span>
            {copy.page} {page}/{totalPages}
          </span>
        </div>

        <div className="mx-auto grid w-full max-w-xl gap-5 py-12">
          <div className="h-28 rounded-full border border-white/20 bg-white/10 blur-[0.2px]" />
          <div className="grid gap-3">
            <div className="h-4 w-3/4 rounded-full bg-white/75" />
            <div className="h-4 w-full rounded-full bg-white/45" />
            <div className="h-4 w-2/3 rounded-full bg-white/35" />
          </div>
        </div>

        <div>
          <p className="text-3xl font-black tracking-tight sm:text-5xl">
            {manga.title}
          </p>
          <p className="mt-3 text-sm font-bold uppercase tracking-[0.2em] text-white/65">
            {copy.pages} {totalPages}
          </p>
        </div>
      </div>
    </article>
  );
}
