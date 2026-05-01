import { useMemo, useState, type ReactNode } from "react";
import type { Chapter, Locale, Manga } from "@/entities/manga/model";
import type { Copy } from "@/shared/i18n/translations";
import { CoverArt } from "@/shared/components/CoverArt";
import { cn } from "@/shared/utils/cn";

type SortOrder = "desc" | "asc";
type ColumnCount = 2 | 3 | 4;

interface MangaDetailsProps {
  copy: Copy;
  locale: Locale;
  manga: Manga;
  relatedMangas: Manga[];
  onBack: () => void;
  onReadChapter: (chapterId: string) => void;
  onSelectManga: (mangaId: string) => void;
}

const columnClasses: Record<ColumnCount, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
};

export function MangaDetails({
  copy,
  locale,
  manga,
  relatedMangas,
  onBack,
  onReadChapter,
  onSelectManga,
}: MangaDetailsProps) {
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "chapters" | "comments" | "recommended"
  >("chapters");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [columnCount, setColumnCount] = useState<ColumnCount>(3);

  const synopsis = manga.synopsis[locale];
  const isLongSynopsis = synopsis.length > 300;
  const displaySynopsis =
    showFullSynopsis || !isLongSynopsis
      ? synopsis
      : `${synopsis.slice(0, 300)}...`;

  const orderedChapters = useMemo(
    () =>
      [...manga.chapters].sort((a, b) =>
        sortOrder === "desc" ? b.number - a.number : a.number - b.number,
      ),
    [manga.chapters, sortOrder],
  );

  return (
    <div className="animate-reader-in min-h-screen bg-[#090e1b]">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="fixed left-4 top-4 z-50 flex h-10 items-center gap-2 rounded-xl bg-slate-900/90 px-4 text-sm font-bold text-slate-200 shadow-lg shadow-black/40 ring-1 ring-white/10 backdrop-blur-xl transition hover:bg-slate-800 hover:text-white active:scale-95"
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
        <span className="hidden sm:inline">{copy.back}</span>
      </button>

      {/* Hero Background */}
      <div className="relative h-28 overflow-hidden sm:h-36 lg:h-40">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: `linear-gradient(135deg, ${manga.colorFrom}, ${manga.colorTo})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090e1b] via-[#090e1b]/70 to-transparent" />
      </div>

      {/* Main Content Container */}
      <div className="mx-auto max-w-[1600px] px-4 pb-20 sm:px-6 lg:px-8">
        {/* HEADER SECTION - Full Width */}
        <div className="-mt-14 sm:-mt-16 lg:-mt-20">
          {/* Top Row: Cover + Basic Info + Stats */}
          <div className="grid gap-5 lg:grid-cols-[240px_1fr] xl:grid-cols-[280px_1fr]">
            {/* LEFT: Cover Image Container */}
            <div className="mx-auto w-36 sm:mx-0 sm:w-44 lg:w-52 xl:w-56">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-2.5 shadow-2xl shadow-black/40 sm:p-3">
                <CoverArt manga={manga} compact />
              </div>
            </div>

            {/* RIGHT: Info Container */}
            <div className="flex flex-col justify-end">
              {/* Title Container */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-sm sm:p-5">
                {/* Genres Row */}
                <div className="mb-3 flex flex-wrap gap-1.5">
                  <span className="rounded-md bg-emerald-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/20">
                    {manga.safety}
                  </span>
                  <span className="rounded-md bg-amber-300/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-200 ring-1 ring-amber-300/20">
                    {manga.origin}
                  </span>
                  {manga.genres.slice(0, 5).map((g) => (
                    <span
                      key={g}
                      className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-300 ring-1 ring-white/10"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h1 className="text-xl font-black leading-tight tracking-tight text-white sm:text-2xl lg:text-3xl">
                  {manga.title}
                </h1>
                <p className="mt-1 text-sm font-semibold text-slate-400">
                  {manga.altTitle}
                </p>

                {/* Author */}
                <p className="mt-3 text-xs font-semibold text-slate-500">
                  {copy.author}:{" "}
                  <span className="text-slate-300">{manga.author}</span>
                  {manga.artist && manga.artist !== manga.author && (
                    <span className="text-slate-300">
                      {" "}
                      · {copy.artist}: {manga.artist}
                    </span>
                  )}
                </p>

                {/* Demographics */}
                {manga.demographics.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {manga.demographics.map((d) => (
                      <span
                        key={d}
                        className="rounded-md bg-slate-700/50 px-2 py-0.5 text-[10px] font-bold text-slate-300"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats Container */}
              <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:max-w-md sm:gap-3">
                <StatCard
                  label={copy.rating}
                  value={String(manga.rating)}
                  accent
                />
                <StatCard label={copy.bookmarks} value={manga.bookmarks} />
                <StatCard label={copy.views} value={manga.views} />
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION - Description & Details */}
        <div className="mt-6 grid gap-5 lg:grid-cols-2 lg:gap-6">
          {/* Description Container */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 lg:p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              <span className="h-4 w-1 rounded-full bg-amber-300" />
              {copy.status}
            </h3>
            <p className="text-sm leading-7 text-slate-300">
              {displaySynopsis}
            </p>
            {isLongSynopsis && (
              <button
                onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                className="mt-4 text-sm font-black text-amber-300 transition hover:text-amber-200"
              >
                {showFullSynopsis ? copy.showLess : copy.showMore}
              </button>
            )}
          </div>

          {/* Details Container */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 lg:p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              <span className="h-4 w-1 rounded-full bg-amber-300" />
              {copy.details}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow label={copy.publication} value={String(manga.year)} />
              <DetailRow label={copy.type} value={manga.origin} />
              <DetailRow label={copy.status} value={manga.status[locale]} />
              <DetailRow
                label={copy.totalChapters}
                value={String(manga.totalChapters)}
              />
              <DetailRow label={copy.lastUpdated} value={manga.lastUpdated} />
              <DetailRow label={copy.source} value={manga.source || "-"} />
              <DetailRow
                label={copy.scanGroup}
                value={manga.scanGroup || copy.noGroup}
              />
              <DetailRow label="ID" value={manga.slug} />
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION - Tabs & Content */}
        <div className="mt-8 lg:mt-10">
          {/* Tabs Header */}
          <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-4 md:flex-row md:items-end md:justify-between">
            <div className="flex overflow-x-auto scrollbar-soft">
              <TabButton
                active={activeTab === "chapters"}
                onClick={() => setActiveTab("chapters")}
              >
                {copy.chapters}
              </TabButton>
              <TabButton
                active={activeTab === "comments"}
                onClick={() => setActiveTab("comments")}
              >
                {copy.comments}
              </TabButton>
              <TabButton
                active={activeTab === "recommended"}
                onClick={() => setActiveTab("recommended")}
              >
                {copy.recommended}
              </TabButton>
            </div>

            {activeTab === "chapters" && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-xl border border-white/10 bg-white/[0.04] p-1">
                  <SmallToggle
                    active={sortOrder === "desc"}
                    onClick={() => setSortOrder("desc")}
                  >
                    Desc
                  </SmallToggle>
                  <SmallToggle
                    active={sortOrder === "asc"}
                    onClick={() => setSortOrder("asc")}
                  >
                    Asc
                  </SmallToggle>
                </div>
                <div className="hidden rounded-xl border border-white/10 bg-white/[0.04] p-1 sm:flex">
                  {([2, 3, 4] as const).map((n) => (
                    <SmallToggle
                      key={n}
                      active={columnCount === n}
                      onClick={() => setColumnCount(n)}
                    >
                      {n}
                    </SmallToggle>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === "chapters" && (
            <div className={cn("grid gap-4", columnClasses[columnCount])}>
              {orderedChapters.map((ch) => (
                <ChapterCard
                  key={ch.id}
                  copy={copy}
                  locale={locale}
                  manga={manga}
                  chapter={ch}
                  onRead={() => onReadChapter(ch.id)}
                />
              ))}
            </div>
          )}

          {activeTab === "comments" && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
              <p className="text-sm font-bold text-slate-500">
                {copy.comments} coming soon...
              </p>
            </div>
          )}

          {activeTab === "recommended" && (
            <RecommendedGrid
              copy={copy}
              mangas={relatedMangas}
              onSelect={onSelectManga}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Helper Components ---- */

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-center transition hover:bg-white/[0.06] sm:p-3 lg:p-4">
      <span
        className={cn(
          "block text-base font-black sm:text-xl lg:text-2xl",
          accent ? "text-amber-300" : "text-white",
        )}
      >
        {value}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-white/[0.02] px-3 py-2.5">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="text-right text-sm font-semibold text-white">
        {value}
      </span>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "whitespace-nowrap border-b-2 px-5 py-3 text-sm transition",
        active
          ? "border-amber-300 font-black text-white"
          : "border-transparent font-bold text-slate-500 hover:text-slate-300",
      )}
    >
      {children}
    </button>
  );
}

function SmallToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-2 text-xs font-black transition",
        active
          ? "bg-amber-300 text-slate-950"
          : "text-slate-400 hover:bg-white/10 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

function ChapterCard({
  copy,
  locale,
  manga,
  chapter,
  onRead,
}: {
  copy: Copy;
  locale: Locale;
  manga: Manga;
  chapter: Chapter;
  onRead: () => void;
}) {
  const langs = chapter.languages?.length ? chapter.languages : manga.languages;

  return (
    <button
      type="button"
      onClick={onRead}
      className="group flex overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] text-left transition hover:-translate-y-0.5 hover:border-amber-300/30 hover:bg-white/[0.06]"
    >
      {/* Thumbnail */}
      <div className="relative h-28 w-24 shrink-0 overflow-hidden sm:h-32 sm:w-28">
        <ChapterThumbnail manga={manga} chapter={chapter} />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/80">
              {copy.chapter}
            </span>
            <span className="text-lg font-black text-white group-hover:text-amber-100">
              {chapter.number}
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-500">
            {chapter.title[locale]}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-400">
          <span>{chapter.updatedAt}</span>
          <span className="h-1 w-1 rounded-full bg-slate-600" />
          <span>{langs.map((l) => l.toUpperCase()).join(" / ")}</span>
        </div>
      </div>
    </button>
  );
}

function ChapterThumbnail({
  manga,
  chapter,
}: {
  manga: Manga;
  chapter: Chapter;
}) {
  const image = chapter.pageImages?.[0];

  if (image) {
    return (
      <img
        src={image}
        alt={`Ch. ${chapter.number}`}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <div
      className="relative h-full w-full"
      style={{
        background: `linear-gradient(145deg, ${manga.colorFrom}, ${manga.colorTo})`,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3),transparent_50%)]" />
      <span className="absolute bottom-2 left-2 text-xl font-black text-white drop-shadow-lg">
        {chapter.number}
      </span>
    </div>
  );
}

function RecommendedGrid({
  copy,
  mangas,
  onSelect,
}: {
  copy: Copy;
  mangas: Manga[];
  onSelect: (id: string) => void;
}) {
  if (mangas.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
        <p className="text-sm font-bold text-slate-500">{copy.noResults}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {mangas.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onSelect(m.id)}
          className="group text-left"
        >
          <CoverArt
            manga={m}
            compact
            className="transition duration-500 group-hover:-translate-y-1"
          />
          <p className="mt-3 line-clamp-2 text-sm font-black leading-tight text-white group-hover:text-amber-100">
            {m.title}
          </p>
          <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">
            {m.genres.slice(0, 3).join(", ")}
          </p>
        </button>
      ))}
    </div>
  );
}
