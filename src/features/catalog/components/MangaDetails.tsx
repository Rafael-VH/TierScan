import { useMemo, useState, type ReactNode } from "react";
import type { Chapter, Locale, Manga } from "@/entities/manga/model";
import type { Copy } from "@/shared/i18n/translations";
import { CoverArt } from "@/shared/components/CoverArt";
import { cn } from "@/utils/cn";

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
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
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
  const isLongSynopsis = synopsis.length > 220;
  const displaySynopsis =
    showFullSynopsis || !isLongSynopsis
      ? synopsis
      : `${synopsis.slice(0, 220)}...`;

  const orderedChapters = useMemo(() => {
    return [...manga.chapters].sort((a, b) =>
      sortOrder === "desc" ? b.number - a.number : a.number - b.number,
    );
  }, [manga.chapters, sortOrder]);

  const metadataItems = [
    { label: copy.status, value: manga.status[locale] },
    { label: copy.publication, value: String(manga.year) },
    { label: copy.type, value: manga.origin },
    { label: copy.author, value: manga.author },
    { label: copy.artist, value: manga.artist || manga.author },
    { label: copy.source, value: manga.source || "-" },
    { label: copy.scanGroup, value: manga.scanGroup || copy.noGroup },
    { label: copy.lastUpdated, value: manga.lastUpdated },
  ];

  return (
    <div className="animate-reader-in min-h-screen bg-[#090e1b]">
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
        <span className="hidden sm:inline">{copy.back}</span>
      </button>

      <div className="relative h-52 overflow-hidden sm:h-64">
        <div
          className="absolute inset-0 opacity-45"
          style={{
            background: `linear-gradient(135deg, ${manga.colorFrom}, ${manga.colorTo})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090e1b] via-[#090e1b]/65 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_52%)]" />
      </div>

      <div className="mx-auto -mt-20 max-w-[1420px] px-4 pb-20 sm:px-6 lg:px-8">
        <section className="relative grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
          <div className="mx-auto w-40 sm:w-48 lg:mx-0 lg:w-52">
            <CoverArt manga={manga} />
          </div>

          <div className="self-end pb-2 text-center lg:text-left">
            <div className="mb-3 flex flex-wrap justify-center gap-2 lg:justify-start">
              <span className="rounded-md bg-emerald-400/10 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/20">
                {manga.safety}
              </span>
              {[manga.origin, ...manga.genres.slice(0, 5)].map((label) => (
                <span
                  key={label}
                  className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-300 ring-1 ring-white/10"
                >
                  {label}
                </span>
              ))}
            </div>

            <h1 className="text-balance text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              {manga.title}
            </h1>
            <p className="mt-2 text-base font-bold text-slate-400 sm:text-lg">
              {manga.altTitle}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2 sm:max-w-lg lg:max-w-xl">
              <StatBlock
                label={copy.rating}
                value={String(manga.rating)}
                accent
              />
              <StatBlock label={copy.bookmarks} value={manga.bookmarks} />
              <StatBlock label={copy.views} value={manga.views} />
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <button
              onClick={() => onReadChapter(manga.chapters[0].id)}
              className="w-full rounded-xl bg-amber-300 py-3.5 text-sm font-black uppercase tracking-wider text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-200 active:translate-y-0"
            >
              {copy.startReading}
            </button>
            <button className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 text-sm font-black uppercase tracking-wider text-white transition hover:bg-white/[0.08]">
              {copy.addToLibrary}
            </button>

            <InfoPanel title={copy.details} items={metadataItems} />

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                {copy.demographics}
              </h3>
              <div className="flex flex-wrap gap-2">
                {manga.demographics.map((demo) => (
                  <span
                    key={demo}
                    className="rounded-lg bg-amber-300/10 px-3 py-1.5 text-xs font-bold text-amber-200 ring-1 ring-amber-300/20"
                  >
                    {demo}
                  </span>
                ))}
              </div>
            </section>
          </aside>

          <main className="space-y-8">
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <p className="text-base leading-7 text-slate-300">
                {displaySynopsis}
              </p>
              {isLongSynopsis && (
                <button
                  onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                  className="mt-3 text-sm font-black text-amber-300 transition hover:text-amber-200"
                >
                  {showFullSynopsis ? copy.showLess : copy.showMore}
                </button>
              )}
            </section>

            <section>
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
                      {[2, 3, 4].map((count) => (
                        <SmallToggle
                          key={count}
                          active={columnCount === count}
                          onClick={() => setColumnCount(count as ColumnCount)}
                        >
                          {count}
                        </SmallToggle>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {activeTab === "chapters" && (
                <div className={cn("grid gap-3", columnClasses[columnCount])}>
                  {orderedChapters.map((chapter) => (
                    <ChapterCard
                      key={chapter.id}
                      copy={copy}
                      locale={locale}
                      manga={manga}
                      chapter={chapter}
                      onRead={() => onReadChapter(chapter.id)}
                    />
                  ))}
                </div>
              )}

              {activeTab === "comments" && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
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
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
      <span
        className={cn(
          "block text-lg font-black",
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

function InfoPanel({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
        {title}
      </h3>
      <dl className="space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-start justify-between gap-2 text-sm"
          >
            <dt className="font-bold text-slate-500">{item.label}</dt>
            <dd className="text-right font-semibold text-white">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
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
  const languages = chapter.languages?.length
    ? chapter.languages
    : manga.languages;

  return (
    <button
      type="button"
      onClick={onRead}
      className="group grid min-h-32 grid-cols-[92px_minmax(0,1fr)] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] text-left transition hover:-translate-y-0.5 hover:border-amber-300/30 hover:bg-white/[0.06]"
    >
      <ChapterThumbnail manga={manga} chapter={chapter} />
      <div className="flex min-w-0 flex-col justify-between p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200/80">
            {copy.chapter}
          </p>
          <h3 className="mt-1 truncate text-lg font-black text-white group-hover:text-amber-100">
            {chapter.number}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">
            {chapter.title[locale]}
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-400">
          <span>{chapter.updatedAt}</span>
          <span className="h-1 w-1 rounded-full bg-slate-600" />
          <span>
            {languages.map((language) => language.toUpperCase()).join(" / ")}
          </span>
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
        alt={`${manga.title} chapter ${chapter.number}`}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: `linear-gradient(145deg, ${manga.colorFrom}, ${manga.colorTo})`,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_20%,rgba(255,255,255,0.45),transparent_18%),linear-gradient(180deg,transparent,rgba(2,6,23,0.72))]" />
      <span className="absolute bottom-3 left-3 text-2xl font-black text-white drop-shadow-lg">
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
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-sm font-bold text-slate-500">{copy.noResults}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {mangas.map((related) => (
        <button
          key={related.id}
          type="button"
          onClick={() => onSelect(related.id)}
          className="group text-left"
        >
          <CoverArt
            manga={related}
            compact
            className="transition duration-500 group-hover:-translate-y-1"
          />
          <p className="mt-3 line-clamp-2 text-sm font-black leading-tight text-white group-hover:text-amber-100">
            {related.title}
          </p>
          <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">
            {related.genres.slice(0, 3).join(", ")}
          </p>
        </button>
      ))}
    </div>
  );
}
