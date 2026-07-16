/// <reference types="vite/client" />

declare const __TMDB_ACCESS_TOKEN__: string;
declare const __TMDB_BASE_URL__: string;

declare module '*.module.less' {
  const classes: Record<string, string>;
  export default classes;
}
