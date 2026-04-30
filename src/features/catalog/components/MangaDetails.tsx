import type { Locale, Manga } from "@/entities/manga/model";
import type { Copy } from "@/shared/i18n/translations";
import { CoverArt } from "@/shared/components/CoverArt";

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
  return (
    <div className="animate-reader-in">
      <div className="relative h-64 w-full overflow-hidden md:h-80">
        <div
          className="absolute inset-0 opacity-30 blur-3xl"
          style={{
            background: `linear-gradient(135deg, ${manga.colorFrom}, ${manga.colorTo})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090e1b] to-transparent" />
      </div>

      <div className="mx-auto -mt-32 max-w-[1200px] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="space-y-6">
            <div className="mx-auto w-64 lg:w-full">
              <CoverArt manga={manga} />
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => onReadChapter(manga.chapters[0].id)}
                className="w-full rounded-xl bg-amber-300 py-4 text-sm font-black uppercase tracking-wider text-slate-950 transition hover:bg-amber-200"
              >
                {copy.startReading}
              </button>
              <button className="w-full rounded-xl border border-white/10 bg-white/5 py-4 text-sm font-black uppercase tracking-wider text-white transition hover:bg-white/10">
                Add to Library
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-400">
                Details
              </h3>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="font-bold text-slate-500">Status</dt>
                  <dd className="text-white">{manga.status[locale]}</dd>
                </div>
                <div>
                  <dt className="font-bold text-slate-500">Publication</dt>
                  <dd className="text-white">{manga.year}</dd>
                </div>
                <div>
                  <dt className="font-bold text-slate-500">Type</dt>
                  <dd className="text-white">{manga.origin}</dd>
                </div>
                <div>
                  <dt className="font-bold text-slate-500">Author(s)</dt>
                  <dd className="text-white">{manga.author}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="space-y-10">
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                {manga.genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300 ring-1 ring-cyan-400/20"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl font-black text-white sm:text-5xl">
                {manga.title}
              </h1>
              <p className="mt-2 text-xl font-bold text-slate-400">
                {manga.altTitle}
              </p>

              <div className="mt-8">
                <p className="max-w-3xl text-lg leading-relaxed text-slate-300">
                  {manga.synopsis[locale]}
                </p>
                <button className="mt-4 text-sm font-black text-amber-300">
                  Show More
                </button>
              </div>
            </div>

            <div>
              <div className="mb-6 flex border-b border-white/10">
                <button className="border-b-2 border-amber-300 px-6 py-3 text-sm font-black text-white">
                  Chapters
                </button>
                <button className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-300">
                  Comments
                </button>
                <button className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-300">
                  Recommended
                </button>
              </div>

              <div className="space-y-2">
                {manga.chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => onReadChapter(chapter.id)}
                    className="group flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-amber-300/30 hover:bg-white/[0.06]"
                  >
                    <div className="text-left">
                      <span className="block font-black text-white group-hover:text-amber-100">
                        Chapter {chapter.number}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {chapter.title[locale]}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-xs font-bold text-slate-500">
                      <span>1 scan</span>
                      <span className="hidden sm:block">
                        {chapter.updatedAt}
                      </span>
                      <svg
                        className="h-4 w-4"
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
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onBack}
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-amber-300 text-slate-950 shadow-2xl transition hover:scale-110 active:scale-95"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      </button>
    </div>
  );
}
