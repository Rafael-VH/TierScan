create extension if not exists pgcrypto;

create table if not exists public.manga_titles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  alt_title text,
  author text not null,
  artist text,
  origin text not null check (origin in ('Manga', 'Manhwa', 'Manhua')),
  year integer not null check (year >= 1900),
  state text not null check (state in ('ongoing', 'complete')),
  status jsonb not null default '{"es":"En emision","en":"Ongoing","pt":"Em lancamento","fr":"En cours","ja":"Renzoku chu"}'::jsonb,
  safety text not null default 'Safe',
  genres text[] not null default '{}',
  demographics text[] not null default '{}',
  languages text[] not null default '{es}',
  synopsis jsonb not null default '{}'::jsonb,
  color_from text not null default '#0f172a',
  color_to text not null default '#334155',
  accent text not null default '#fbbf24',
  ranking integer not null default 999,
  reads text not null default '0',
  rating numeric(2,1) not null default 0 check (rating >= 0 and rating <= 5),
  rating_count text not null default '0',
  bookmarks text not null default '0',
  views text not null default '0',
  total_chapters integer not null default 0,
  last_updated date not null default current_date,
  source text,
  scan_group text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.manga_chapters (
  id uuid primary key default gen_random_uuid(),
  manga_id uuid not null references public.manga_titles(id) on delete cascade,
  number numeric(8,2) not null,
  title jsonb not null default '{}'::jsonb,
  pages integer not null default 1 check (pages > 0),
  page_images text[] not null default '{}',
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  updated_at date not null default current_date,
  created_at timestamptz not null default now(),
  unique (manga_id, number)
);

create index if not exists manga_titles_ranking_idx on public.manga_titles (ranking asc);
create index if not exists manga_titles_slug_idx on public.manga_titles (slug);
create index if not exists manga_chapters_manga_number_idx on public.manga_chapters (manga_id, number desc);

alter table public.manga_titles enable row level security;
alter table public.manga_chapters enable row level security;

create policy "Public read manga titles"
on public.manga_titles
for select
to anon, authenticated
using (true);

create policy "Public read manga chapters"
on public.manga_chapters
for select
to anon, authenticated
using (true);
