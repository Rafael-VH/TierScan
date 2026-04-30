import type { CSSProperties } from "react";
import type { Manga } from "@/entities/manga/model";
import { cn } from "@/utils/cn";

interface CoverArtProps {
  manga: Manga;
  className?: string;
  compact?: boolean;
}

export function CoverArt({ manga, className, compact = false }: CoverArtProps) {
  const coverStyle: CSSProperties = {
    background: `linear-gradient(145deg, ${manga.colorFrom}, ${manga.colorTo})`,
    boxShadow: `0 22px 60px color-mix(in srgb, ${manga.accent} 26%, transparent)`,
  };

  return (
    <div
      className={cn(
        "group relative isolate overflow-hidden rounded-xl border border-white/15 bg-slate-900 text-left shadow-2xl shadow-black/30",
        compact ? "aspect-[3/4]" : "aspect-[5/7]",
        className,
      )}
      style={coverStyle}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.48),transparent_18%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.22),transparent_14%),linear-gradient(180deg,transparent,rgba(2,6,23,0.7))]" />
      <div className="absolute -right-8 top-8 h-40 w-40 rounded-full border border-white/20 bg-white/10 blur-[1px] transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <p className="max-w-[12rem] text-balance text-sm font-black uppercase leading-tight tracking-tight text-white drop-shadow-lg sm:text-base">
          {manga.title}
        </p>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
          {manga.origin}
        </p>
      </div>
      <div className="absolute left-3 top-3 rounded-full bg-black/35 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white/85 backdrop-blur">
        {manga.safety}
      </div>
    </div>
  );
}
