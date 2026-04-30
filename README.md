# PyonManga Reader

Lector web de manga y manhwa construido con React, Vite y Tailwind CSS v4. El proyecto incluye catalogo responsive, busqueda, cambio de idioma, ranking, historial visual y un lector online con modo webtoon o pagina individual.

## Caracteristicas

- Interfaz responsive para movil, tablet y escritorio.
- Soporte de UI en Espanol, English, Portugues, Francais y Nihongo romanizado.
- Catalogo de muestra con manga, manhwa, generos, estados, autores y capitulos.
- Busqueda por titulo, subtitulo, autor, origen, genero, estado y sinopsis localizada.
- Lector online con selector de capitulo, modo webtoon, modo por pagina y previsualizacion por tamano de pantalla.
- Animaciones CSS pensadas para jerarquia visual y con soporte para `prefers-reduced-motion`.
- Arquitectura limpia por capas: `app`, `entities`, `features`, `shared` y `utils`.

## Stack

- React 19
- Vite 7
- TypeScript
- Tailwind CSS v4

## Estructura

```text
src/
  app/
    AppShell.tsx
  entities/
    manga/
      model.ts
  features/
    catalog/
      components/
        HeroSpotlight.tsx
        LibraryShelf.tsx
        RankingPanel.tsx
      data/
        catalog.ts
    reader/
      components/
        ReaderPanel.tsx
  shared/
    components/
      CoverArt.tsx
    i18n/
      translations.ts
    layout/
      TopNavigation.tsx
  utils/
    cn.ts
  App.tsx
  index.css
  main.tsx
```

## Como ejecutar

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev`: inicia el servidor de desarrollo.
- `npm run build`: genera la version de produccion.
- `npm run preview`: sirve localmente la version compilada.

## Guia de datos

Los titulos de muestra viven en `src/features/catalog/data/catalog.ts`. Para conectar una API real, reemplaza `mangaCatalog` por un adaptador de datos y conserva el contrato definido en `src/entities/manga/model.ts`.

## Roadmap sugerido

- Persistir progreso de lectura en localStorage o backend.
- Agregar autenticacion de usuario y listas privadas.
- Integrar CDN de imagenes reales con carga lazy.
- Agregar rutas con React Router para detalle de titulo y lector dedicado.
- Conectar proveedores de traduccion o capitulos por idioma.

## Licencia

Proyecto preparado como base para repositorio GitHub. Define la licencia segun el uso final del producto.
