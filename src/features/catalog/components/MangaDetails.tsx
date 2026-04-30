import { useState } from "react";
import type { Locale, Manga } from "@/entities/manga/model";
import type { Copy } from "@/shared/i18n/translations";
import { CoverArt } from "@/shared/components/CoverArt";
import { cn } from "@/utils/cn";

interface MangaDetailsProps {
  copy: Copy;
  locale: Locale;
  manga: Manga;
  onBack: () => void;
  onReadChapter: (chapterId: string) => void;
}

export function MangaDetails({
  copy,
  locale,
  manga,
  onBack,
  onReadChapter,
}: MangaDetailsProps) {
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "chapters" | "comments" | "recommended"
  >("chapters");

  const synopsis = manga.synopsis[locale];
  const isLongSynopsis = synopsis.length > 200;
  const displaySynopsis =
    showFullSynopsis || !isLongSynopsis
      ? synopsis
      : synopsis.slice(0, 200) + "...";

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
    <div className="animate-reader-in">
      {/* Floating back button — rounded rectangle pill */}
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

      {/* Hero Background */}
      <div className="relative h-72 w-full overflow-hidden sm:h-96">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `linear-gradient(135deg, ${manga.colorFrom}, ${manga.colorTo})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090e1b] via-[#090e1b]/60 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_50%)]" />
      </div>

      <div className="mx-auto max-w-[1200px] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Sidebar */}
          <div className="-mt-32 space-y-5 lg:-mt-48">
            <div className="mx-auto w-56 sm:w-64 lg:w-full">
              <CoverArt manga={manga} />
            </div>

            {/* Rating & Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-300">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-lg font-black">{manga.rating}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500">
                  {manga.ratingCount}
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
                <span className="block text-lg font-black text-white">
                  {manga.bookmarks}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {copy.bookmarks}
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
                <span className="block text-lg font-black text-white">
                  {manga.views}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {copy.views}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => onReadChapter(manga.chapters[0].id)}
                className="w-full rounded-xl bg-amber-300 py-3.5 text-sm font-black uppercase tracking-wider text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-200 active:translate-y-0"
              >
                {copy.startReading}
              </button>
              <button className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 text-sm font-black uppercase tracking-wider text-white transition hover:bg-white/[0.08]">
                {copy.addToLibrary}
              </button>
            </div>

            {/* Metadata Panel */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                {copy.details}
              </h3>
              <dl className="space-y-3">
                {metadataItems.map((item) => (
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
            </div>

            {/* Demographics */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
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
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8 lg:pt-4">
            {/* Title Section */}
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-md bg-emerald-400/10 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/20">
                  {manga.safety}
                </span>
                {manga.genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-300 ring-1 ring-white/10"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                {manga.title}
              </h1>
              <p className="mt-2 text-lg font-bold text-slate-400">
                {manga.altTitle}
              </p>

              {/* Synopsis */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
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
              </div>
            </div>

            {/* Tabs */}
            <div>
              <div className="mb-6 flex border-b border-white/10">
                <button
                  onClick={() => setActiveTab("chapters")}
                  className={cn(
                    "border-b-2 px-5 py-3 text-sm font-black transition",
                    activeTab === "chapters"
                      ? "border-amber-300 text-white"
                      : "border-transparent text-slate-500 hover:text-slate-300",
                  )}
                >
                  {copy.chapters}
                </button>
                <button
                  onClick={() => setActiveTab("comments")}
                  className={cn(
                    "border-b-2 px-5 py-3 text-sm font-bold transition",
                    activeTab === "comments"
                      ? "border-amber-300 text-white"
                      : "border-transparent text-slate-500 hover:text-slate-300",
                  )}
                >
                  {copy.comments}
                </button>
                <button
                  onClick={() => setActiveTab("recommended")}
                  className={cn(
                    "border-b-2 px-5 py-3 text-sm font-bold transition",
                    activeTab === "recommended"
                      ? "border-amber-300 text-white"
                      : "border-transparent text-slate-500 hover:text-slate-300",
                  )}
                >
                  {copy.recommended}
                </button>
              </div>

              {activeTab === "chapters" && (
                <div className="space-y-1.5">
                  {manga.chapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      onClick={() => onReadChapter(chapter.id)}
                      className="group flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4 transition hover:border-amber-300/20 hover:bg-white/[0.05]"
                    >
                      <div className="text-left">
                        <span className="block text-sm font-black text-white group-hover:text-amber-100">
                          {copy.chapter} {chapter.number}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {chapter.title[locale]}
                        </span>
                      </div>
                      <div className="flex items-center gap-5 text-xs font-bold text-slate-500">
                        <span className="hidden rounded-full bg-white/5 px-2.5 py-1 sm:block">
                          1 {copy.scan}
                        </span>
                        <span className="hidden sm:block">
                          {chapter.updatedAt}
                        </span>
                        <svg
                          className="h-4 w-4 text-slate-600 transition group-hover:text-amber-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </button>
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
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                  <p className="text-sm font-bold text-slate-500">
                    {copy.recommended} coming soon...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
