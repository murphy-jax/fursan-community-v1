/**
 * Source export — packages the real project files (imported raw at build
 * time by Vite) into a downloadable ZIP archive in the browser.
 * The archive is always in sync with the deployed code.
 */
import JSZip from "jszip";

const SOURCES = import.meta.glob(
  [
    "/index.html",
    "/package.json",
    "/tsconfig.json",
    "/vite.config.js",
    "/README.md",
    "/.env.example",
    "/db/*.sql",
    "/src/**/*",
    "/public/**/*",
  ],
  { eager: true, query: "?raw", import: "default" }
) as Record<string, string>;

export interface ExportEntry {
  path: string; // relative, without leading slash
  size: number; // bytes (approximate for UTF-8)
}

export function getExportEntries(): ExportEntry[] {
  return Object.entries(SOURCES)
    .map(([path, content]) => ({
      path: path.replace(/^\//, ""),
      size: new TextEncoder().encode(content).length,
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export async function downloadProjectZip(): Promise<{ files: number; name: string }> {
  const zip = new JSZip();
  const root = zip.folder("fursan-community")!;

  root.file(
    "EXPORT-NOTES.txt",
    [
      "FURSAN COMMUNITY — full project source",
      "=======================================",
      "",
      "Everything in this archive is the live project source.",
      "",
      "Quick start:",
      "  1. npm install",
      "  2. copy .env.example to .env and adjust credentials",
      "  3. npm run dev   (development)",
      "     npm run build (production)",
      "",
      "Admin defaults: admin / fursan2020 — change after first login",
      "(Admin → Settings → Change Admin Password).",
      "",
      "Database schema + first migration: db/schema.sql (PostgreSQL).",
      "See README.md for full deployment & Discord bot instructions.",
      "",
      "Notes:",
      "- package-lock.json and node_modules are excluded — regenerate",
      "  them with `npm install`.",
      "- Brand images are referenced by URL in src/lib/db.ts; replace",
      "  them any time via Admin → Image Manager (transparent PNGs",
      "  render natively).",
      "",
    ].join("\n")
  );

  for (const [path, content] of Object.entries(SOURCES)) {
    root.file(path.replace(/^\//, ""), content);
  }

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  const name = "fursan-community-source.zip";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);

  return { files: Object.keys(SOURCES).length + 1, name };
}
