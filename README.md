# MovieShelf

MovieShelf is a React + TypeScript movie discovery scaffold for searching TMDB content, collecting favorite movies, and preparing a watch lottery experience.

## Stack

- React + TypeScript
- Vite for local development
- Webpack for production bundle output
- Redux Toolkit for favorites, preferences, and Lottery Banner client state
- TanStack Query for TMDB server state
- Radix UI primitives wrapped by project UI components
- Less + CSS Modules for styles
- Dark visual direction by default, using the white MovieShelf logo assets on dark surfaces
- Zod for tolerant TMDB response parsing and safe UI fallbacks

## Structure

```text
src/
  app/        # providers, router, app shell
  pages/      # route-level screens
  features/   # user-facing feature modules
  entities/   # domain models, repositories, adapters
  shared/     # shared clients, UI primitives, utilities
  store/      # Redux store and typed hooks
  styles/     # global styles and Less variables
```

Brand assets are stored under `public/assets/brand/`.

## Architecture Notes

- Pages consume TMDB data through `movieService`, repository functions, and adapter/schema layers.
- TMDB image URLs are built from `/configuration`; a safe fallback keeps posters visible if configuration fails.
- Search and favorites sorting are isolated in strategy files so new modes can be added without changing page rendering.
- Movie cards, waterfall grids, dropdown selects, checkbox controls, and state panels are shared UI building blocks.
- Radix primitives back dialogs, dropdown selects, checkboxes, tooltips, and Slot-based buttons.

## Performance Notes

- Route screens are lazy-loaded with React `Suspense`.
- Posters and secondary imagery use fixed aspect ratios, `loading="lazy"`, and async decoding.
- Search input is debounced before querying TMDB.
- Search and now-playing streams use TanStack Query infinite queries with a local item cap.
- Detail requests use `append_to_response` to reduce request fan-out.

## Scripts

```bash
nvm use
pnpm install
pnpm dev
pnpm lint
pnpm test -- --run
pnpm typecheck
pnpm build
pnpm build:vite
```

TMDB environment variables can be provided through `.env.local`:

```bash
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_ACCESS_TOKEN=your_access_token
```
