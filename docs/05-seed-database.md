# Poblado de Datos (Seed Database)

## Cuándo Hacer Seed

- Después de crear el esquema inicial
- Para tener datos de desarrollo
- Para poblar catálogos de ejemplo
- Para pruebas de integración

---

## Enfoque 1: Script con Node.js y supabase-js

### Script Base

```javascript
// seed.mjs
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  // 1. Insertar padres
  const { data: titles, error: titlesError } = await supabase
    .from("manga_titles")
    .insert([...]) // Array de objetos
    .select();

  if (titlesError) {
    console.error("Error inserting titles:", titlesError);
    return;
  }

  // 2. Insertar hijos (usando IDs de padres)
  const chapters = titles.flatMap(title => 
    title.chapters.map(ch => ({
      manga_id: title.id,
      ...ch
    }))
  );

  const { error: chaptersError } = await supabase
    .from("manga_chapters")
    .insert(chapters);

  if (chaptersError) {
    console.error("Error inserting chapters:", chaptersError);
    return;
  }

  console.log(`✅ Inserted ${titles.length} titles`);
  console.log(`✅ Inserted ${chapters.length} chapters`);
}

seed().catch(console.error);
```

### Ejecutar

```bash
node seed.mjs
```

---

## Estructura de Datos para Seed

### Datos de Títulos

```javascript
const mangaCatalog = [
  {
    slug: "mi-manga",
    title: "Mi Manga Increíble",
    alt_title: "My Amazing Manga",
    author: "Autor Nombre",
    artist: "Artista Nombre",
    origin: "Manga",           // Manga, Manhwa, Manhua
    year: 2024,
    state: "ongoing",          // ongoing, complete
    status: { 
      es: "En emisión",
      en: "Ongoing",
    },
    safety: "Safe",
    genres: ["Action", "Adventure"],
    demographics: ["Shonen"],
    languages: ["es", "en"],
    synopsis: {
      es: "Sinopsis en español...",
      en: "Synopsis in English...",
    },
    color_from: "#0ea5e9",
    color_to: "#a855f7",
    accent: "#38bdf8",
    ranking: 1,
    reads: "1.5M",
    rating: 4.5,
    rating_count: "10.2K",
    bookmarks: "25.3K",
    views: "2.1M",
    total_chapters: 50,
    last_updated: "2024-01-15",
    source: "Shonen Jump",
    scan_group: "Grupo Scan",
  },
  // ... más títulos
];
```

### Datos de Capítulos

```javascript
const chapterTemplates = {
  "mi-manga": [
    { 
      number: 3, 
      title: { es: "Despertar", en: "Awakening" }, 
      pages: 18 
    },
    { 
      number: 2, 
      title: { es: "Viaje", en: "Journey" }, 
      pages: 16 
    },
    { 
      number: 1, 
      title: { es: "Inicio", en: "Beginning" }, 
      pages: 20 
    },
  ],
  // ... más templates por manga
};
```

---

## Script Completo de Ejemplo

```javascript
// seed.mjs
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tu-proyecto.supabase.co";
const supabaseKey = "tu-anon-key";

const supabase = createClient(supabaseUrl, supabaseKey);

// Datos de ejemplo
const mangaCatalog = [
  // ... datos de mangas
];

const chapterTemplates = {
  // ... datos de capítulos por slug
};

async function seedDatabase() {
  console.log("=== SEEDING DATABASE ===\n");

  // 1. Insertar títulos
  console.log("Inserting manga titles...");
  const { data: insertedTitles, error: titlesError } = await supabase
    .from("manga_titles")
    .insert(mangaCatalog)
    .select();

  if (titlesError) {
    console.error("Error inserting titles:", titlesError);
    return;
  }

  console.log(`✅ Inserted ${insertedTitles.length} titles\n`);

  // 2. Construir capítulos
  const chaptersToInsert = [];
  
  for (const manga of insertedTitles) {
    const template = chapterTemplates[manga.slug];
    if (!template) {
      console.warn(`⚠️ No chapter template for ${manga.slug}`);
      continue;
    }

    for (const ch of template) {
      chaptersToInsert.push({
        manga_id: manga.id,
        number: ch.number,
        title: ch.title,
        pages: ch.pages,
        page_images: Array.from({ length: ch.pages }, (_, i) => 
          `https://tu-proyecto.supabase.co/storage/v1/object/public/chapter-pages/${manga.slug}/ch${String(ch.number).padStart(3, "0")}/${String(i + 1).padStart(3, "0")}.webp`
        ),
        progress: 0,
        updated_at: new Date().toISOString().split("T")[0],
      });
    }
  }

  // 3. Insertar capítulos
  console.log("Inserting chapters...");
  const { data: insertedChapters, error: chaptersError } = await supabase
    .from("manga_chapters")
    .insert(chaptersToInsert)
    .select();

  if (chaptersError) {
    console.error("Error inserting chapters:", chaptersError);
    return;
  }

  console.log(`✅ Inserted ${insertedChapters.length} chapters\n`);

  // 4. Resumen
  console.log("=== SEEDING COMPLETE ===");
  console.log(`Manga titles: ${insertedTitles.length}`);
  console.log(`Chapters: ${insertedChapters.length}`);
  console.log("\nInserted titles:");
  insertedTitles.forEach((t, i) => {
    const chapterCount = insertedChapters.filter(c => c.manga_id === t.id).length;
    console.log(`  ${i + 1}. ${t.title} (${chapterCount} chapters)`);
  });
}

seedDatabase().catch(console.error);
```

---

## Enfoque 2: CSV Import (Supabase Dashboard)

### Para manga_titles

```csv
slug,title,alt_title,author,artist,origin,year,state,status,safety,genres,demographics,languages,synopsis,color_from,color_to,accent,ranking,reads,rating,rating_count,bookmarks,views,total_chapters,last_updated,source,scan_group
mizu-zokusei,Mizu Zokusei no Mahoutsukai,Water Attribute Magician,Kubo Tadashi,Bokutengou,Manga,2024,ongoing,"{""es"":""En emision"",""en"":""Ongoing""}",Safe,"{Adventure,Magic,Fantasy,Isekai}","{Shonen}","{es,en,fr}","{""es"":""Un mago de agua explora ruinas."",""en"":""A water mage explores sunken ruins.""}",#0ea5e9,#a855f7,#38bdf8,7,980K,4.5,8.3K,22.1K,1.2M,13,2026-01-16,AlphaPolis,PyonScans
```

### Para manga_chapters

```csv
manga_id,number,title,pages,page_images,progress,updated_at
7ef7a19b-f99a-49dc-b920-74d1a9cf8a90,13,"{""es"":""Resonancia"",""en"":""Resonance""}",3,"{https://cdn.example.com/013/001.webp,https://cdn.example.com/013/002.webp}",0,2026-01-16
```

### Pasos para importar CSV:

1. Ve a **Supabase Dashboard → Table Editor**
2. Selecciona la tabla
3. Click en **Import CSV**
4. Sube tu archivo
5. Verifica el mapeo de columnas
6. Confirma la importación

---

## Enfoque 3: SQL Directo

```sql
-- Insertar directamente en el SQL Editor
insert into public.manga_titles (slug, title, author, origin, year, state)
values 
  ('mi-manga', 'Mi Manga', 'Autor', 'Manga', 2024, 'ongoing'),
  ('otro-manga', 'Otro Manga', 'Otro Autor', 'Manhwa', 2023, 'complete');

-- Obtener IDs para insertar capítulos
select id, slug from public.manga_titles;

-- Insertar capítulos
insert into public.manga_chapters (manga_id, number, title, pages)
values 
  ('uuid-del-manga', 1, '{"es": "Inicio"}', 20),
  ('uuid-del-manga', 2, '{"es": "Continúa"}', 18);
```

---

## Validar Seed

Después de ejecutar el seed, verifica:

```javascript
// verify.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(url, key);

async function verify() {
  const { count: titlesCount } = await supabase
    .from("manga_titles")
    .select("*", { count: "exact", head: true });

  const { count: chaptersCount } = await supabase
    .from("manga_chapters")
    .select("*", { count: "exact", head: true });

  console.log(`manga_titles: ${titlesCount} rows`);
  console.log(`manga_chapters: ${chaptersCount} rows`);
}

verify();
```

---

## Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `42501: violates row-level security` | Sin políticas de escritura | Crear políticas de insert/update |
| `23505: duplicate key` | Datos ya existen | Usar `upsert` o limpiar tabla primero |
| `23503: foreign key constraint` | manga_id no existe | Insertar títulos primero |
| `null value violates not-null` | Campos obligatorios faltantes | Verificar datos del seed |

---

## Script para Limpiar y Re-Sempear

```javascript
// clear-and-seed.mjs
async function clearAndSeed() {
  // 1. Eliminar datos existentes
  await supabase.from("manga_chapters").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("manga_titles").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  
  // 2. Re-seed
  await seedDatabase();
}
```

**Nota:** La condición `neq("id", "000...")` es un truco para eliminar todo (DELETE sin condición no funciona con `.neq()`). Mejor usa:

```sql
-- En SQL Editor para limpiar
truncate public.manga_chapters, public.manga_titles cascade;
```
