# MovieShelf

[简体中文](./README.md)

MovieShelf is a TMDB-powered movie discovery and watchlist app. It supports movie search, infinite scrolling, movie details, multiple favorite collections, and a Watch Lottery experience.

Live demo: [https://movie.zhangpengbo.com](https://movie.zhangpengbo.com)

## Features

- Search movies and browse paginated results in a card-based stream.
- Explore now-playing movies and a cinematic homepage banner.
- View movie details, including overview, rating, directors, cast, trailers, reviews, watch providers, and recommendations.
- Add movies to the default collection or selected collections.
- Create, rename, delete, and sort favorite collections.
- Use Watch Lottery to randomly pick a movie from favorites.
- Handle network errors, empty results, missing images, malformed API data, and corrupted local storage.
- Responsive layouts for mobile, tablet, and desktop screens.

## Tech Stack

- React
- TypeScript
- Vite
- Webpack
- React Router
- Redux Toolkit
- TanStack Query
- Radix UI
- Less + CSS Modules
- Zod
- Vitest + React Testing Library + MSW

## Getting Started

This project uses pnpm and Node.js 18+. An `.nvmrc` file is included, so nvm is recommended.

```bash
nvm use
pnpm install
pnpm dev
```

Create `.env.local` for local development:

```bash
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_ACCESS_TOKEN=your_tmdb_read_access_token
```

For Docker or production builds, the same variables can also be provided through `.env`. `.env` and `.env.local` are ignored by git.

## Scripts

```bash
pnpm dev         # Start the Vite dev server
pnpm lint        # Run ESLint
pnpm typecheck   # Run TypeScript type checks
pnpm test -- --run
pnpm build       # Build production assets with Webpack
pnpm build:vite  # Validate the app with a Vite build
pnpm preview     # Preview the Vite build
pnpm serve:dist  # Serve dist locally with SPA fallback
pnpm smoke       # Run local dist smoke tests
pnpm smoke:prod  # Run production smoke tests
```

## Project Structure

```text
src/
  app/        # App providers, router, bootstrap
  pages/      # Route-level pages
  features/   # User-facing feature modules
  entities/   # Domain models, adapters, repository code
  shared/     # API client, shared UI, utilities
  store/      # Redux store and typed hooks
  styles/     # Global styles and Less variables
```

## Architecture

Page components do not call TMDB directly. Movie data goes through the API client, repository, schema validation, and adapter layers before reaching the UI.

```text
UI / Page
  -> TanStack Query hook
  -> movieService
  -> movieRepository
  -> tmdbClient
  -> Zod schema
  -> Movie adapter
```

This keeps page components bound to a stable frontend movie model, lets the app degrade gracefully when TMDB data is incomplete or malformed, and leaves room for future changes such as an API proxy or account-based persistence.

Favorite collection state is managed with Redux Toolkit and persisted to localStorage. Remote movie data is managed by TanStack Query for caching, pagination, retries, and loading states.

## Testing

Current tests cover:

- TMDB schema parsing and malformed-response fallbacks.
- Movie adapter transformations and image fallbacks.
- Search and favorite sorting strategies.
- Favorite reducers, storage recovery, and migration notices.
- Search success, empty-result, and network-error states.
- Movie detail success, partial-module fallback, and network-error states.
- Favorite list rendering, empty states, movie removal, and Lottery source switching.
- Watch Lottery candidate de-duplication, visual queue behavior, and card interactions.
- Mobile two-column waterfall and responsive search layout contracts.
- Production static-asset smoke tests.

Run the full validation set:

```bash
pnpm lint
pnpm typecheck
pnpm test -- --run
pnpm build
pnpm smoke:prod
```

## Deployment

Docker, Nginx, and deployment scripts are included. See [docs/deploy.md](./docs/deploy.md) for details.

```bash
bash scripts/deploy.sh
```

The deployment script pulls the latest code on the server, rebuilds the container, and runs a production smoke test after deployment.

## Performance

Implemented performance work includes:

- Route-level lazy loading.
- Paginated movie streams.
- Homepage banner query prefetching and image warming.
- Debounced search input.
- Movie details fetched with `append_to_response` to reduce request count.
- TMDB `/configuration`-based image sizes.
- Stable poster, avatar, and card aspect ratios to reduce CLS.
- Lazy loading and async decoding for non-critical images.

## Data Source

This product uses the TMDB API but is not endorsed or certified by TMDB.
