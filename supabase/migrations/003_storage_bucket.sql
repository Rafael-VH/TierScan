-- Create storage bucket for chapter pages using Supabase's internal function
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chapter-pages', 'chapter-pages', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;
