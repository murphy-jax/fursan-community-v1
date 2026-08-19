/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_DEFAULT_USERNAME?: string;
  readonly VITE_ADMIN_DEFAULT_PASSWORD?: string;
  readonly VITE_DISCORD_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
