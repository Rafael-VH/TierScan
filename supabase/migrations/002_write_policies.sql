-- Allow anon users to insert, update, delete manga titles
create policy "Anon insert manga titles"
on public.manga_titles
for insert
to anon
with check (true);

create policy "Anon update manga titles"
on public.manga_titles
for update
to anon
using (true)
with check (true);

create policy "Anon delete manga titles"
on public.manga_titles
for delete
to anon
using (true);

-- Allow anon users to insert, update, delete manga chapters
create policy "Anon insert manga chapters"
on public.manga_chapters
for insert
to anon
with check (true);

create policy "Anon update manga chapters"
on public.manga_chapters
for update
to anon
using (true)
with check (true);

create policy "Anon delete manga chapters"
on public.manga_chapters
for delete
to anon
using (true);
