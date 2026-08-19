import { useMemo, useRef, useState } from "react";
import { useApp } from "../../context/AppContext";
import * as api from "../../lib/api";
import { DEFAULT_CONTENT, DEFAULT_IMAGES, IMAGE_META, type Content } from "../../lib/db";
import { Btn, IconTrash, IconUpload, IconX, IconPlus, Spinner, TextInput, TextArea, useToast } from "../../components/ui";

/* ---------------- schema ---------------- */

type ItemField = { key: string; label: string; kind: "text" | "textarea" };
type EditorField =
  | { key: string; label: string; kind: "text" | "textarea" | "lines" }
  | { key: string; label: string; kind: "list"; fields: ItemField[] };

const SCHEMA: { id: keyof Content; label: string; fields: EditorField[] }[] = [
  {
    id: "home",
    label: "Home Page",
    fields: [
      { key: "eyebrow", label: "Hero Eyebrow (EST. line)", kind: "text" },
      { key: "title", label: "Hero Main Title", kind: "text" },
      { key: "tagline", label: "Hero Tagline", kind: "text" },
      { key: "description", label: "Hero Description", kind: "textarea" },
      { key: "ctaExplore", label: "Explore Button Text", kind: "text" },
      { key: "ctaDiscord", label: "Discord Button Text", kind: "text" },
      { key: "serverLabel", label: "Server Online Indicator Text", kind: "text" },
      { key: "ticker", label: "Ticker Items (one per line)", kind: "lines" },
      { key: "stats", label: "Statistics", kind: "list", fields: [{ key: "value", label: "Value", kind: "text" }, { key: "label", label: "Label", kind: "text" }] },
      { key: "featuresTitle", label: "Features Section Title", kind: "text" },
      { key: "featuresSub", label: "Features Section Subtitle", kind: "textarea" },
      { key: "features", label: "Feature Cards (6)", kind: "list", fields: [{ key: "title", label: "Title", kind: "text" }, { key: "description", label: "Description", kind: "textarea" }] },
      { key: "previewsTitle", label: "Previews Title", kind: "text" },
      { key: "previewsSub", label: "Previews Subtitle", kind: "textarea" },
      { key: "previews", label: "Program Previews (6)", kind: "list", fields: [{ key: "title", label: "Title", kind: "text" }, { key: "tag", label: "Tag", kind: "text" }, { key: "description", label: "Description", kind: "textarea" }] },
      { key: "foundersTitle", label: "Founders Title", kind: "text" },
      { key: "foundersSub", label: "Founders Subtitle", kind: "textarea" },
      { key: "founders", label: "Founders (5)", kind: "list", fields: [{ key: "name", label: "Name", kind: "text" }, { key: "description", label: "Description", kind: "textarea" }] },
      { key: "ctaTitle", label: "CTA Title", kind: "text" },
      { key: "ctaSub", label: "CTA Subtitle", kind: "textarea" },
      { key: "ctaButton", label: "CTA Button", kind: "text" },
    ],
  },
  {
    id: "community",
    label: "Community Page",
    fields: [
      { key: "heroEyebrow", label: "Hero Eyebrow", kind: "text" },
      { key: "heroTitle", label: "Hero Title", kind: "text" },
      { key: "heroDescription", label: "Hero Description", kind: "textarea" },
      { key: "storyTitle", label: "Story Title", kind: "text" },
      { key: "storyBody", label: "Community Story (blank line = new paragraph)", kind: "textarea" },
      { key: "missionTitle", label: "Mission Title", kind: "text" },
      { key: "missionBody", label: "Mission Text", kind: "textarea" },
      { key: "valuesTitle", label: "Values Title", kind: "text" },
      { key: "valuesSub", label: "Values Subtitle", kind: "text" },
      { key: "values", label: "Values (4)", kind: "list", fields: [{ key: "title", label: "Title", kind: "text" }, { key: "description", label: "Description", kind: "textarea" }] },
      { key: "quote", label: "Featured Quote", kind: "textarea" },
      { key: "quoteAuthor", label: "Quote Author", kind: "text" },
      { key: "featuresTitle", label: "Member Life Title", kind: "text" },
      { key: "features", label: "Member Life Cards (4)", kind: "list", fields: [{ key: "title", label: "Title", kind: "text" }, { key: "description", label: "Description", kind: "textarea" }] },
      { key: "ctaTitle", label: "CTA Title", kind: "text" },
      { key: "ctaDescription", label: "CTA Description", kind: "textarea" },
      { key: "ctaButton", label: "CTA Button", kind: "text" },
    ],
  },
  {
    id: "esports",
    label: "Esports Page",
    fields: [
      { key: "heroEyebrow", label: "Hero Eyebrow", kind: "text" },
      { key: "heroTitle", label: "Hero Title", kind: "text" },
      { key: "heroDescription", label: "Hero Description", kind: "textarea" },
      { key: "introTitle", label: "Programs Section Title", kind: "text" },
      { key: "introBody", label: "Programs Section Body", kind: "textarea" },
      { key: "journeyTitle", label: "Journey Title", kind: "text" },
      { key: "journeySub", label: "Journey Subtitle", kind: "text" },
      { key: "journey", label: "Application Journey (4 steps)", kind: "list", fields: [{ key: "title", label: "Step", kind: "text" }, { key: "description", label: "Description", kind: "textarea" }] },
      { key: "applyNote", label: "Application Note", kind: "textarea" },
    ],
  },
  {
    id: "ems",
    label: "EMS Page",
    fields: [
      { key: "heroEyebrow", label: "Hero Eyebrow", kind: "text" },
      { key: "heroTitle", label: "Hero Title", kind: "text" },
      { key: "heroDescription", label: "Hero Description", kind: "textarea" },
      { key: "introTitle", label: "Intro Title", kind: "text" },
      { key: "introBody", label: "Department Introduction (blank line = new paragraph)", kind: "textarea" },
      { key: "principlesTitle", label: "Principles Title", kind: "text" },
      { key: "principles", label: "Principles (3)", kind: "list", fields: [{ key: "title", label: "Title", kind: "text" }, { key: "description", label: "Description", kind: "textarea" }] },
      { key: "requirementsTitle", label: "Requirements Title", kind: "text" },
      { key: "ranksTitle", label: "Ranks Title", kind: "text" },
      { key: "applyCta", label: "Apply Button Text", kind: "text" },
    ],
  },
  {
    id: "lspd",
    label: "LSPD Page",
    fields: [
      { key: "heroEyebrow", label: "Hero Eyebrow", kind: "text" },
      { key: "heroTitle", label: "Hero Title", kind: "text" },
      { key: "heroDescription", label: "Hero Description", kind: "textarea" },
      { key: "introTitle", label: "Intro Title", kind: "text" },
      { key: "introBody", label: "Department Introduction (blank line = new paragraph)", kind: "textarea" },
      { key: "principlesTitle", label: "Principles Title", kind: "text" },
      { key: "principles", label: "Principles (3)", kind: "list", fields: [{ key: "title", label: "Title", kind: "text" }, { key: "description", label: "Description", kind: "textarea" }] },
      { key: "requirementsTitle", label: "Requirements Title", kind: "text" },
      { key: "ranksTitle", label: "Ranks Title", kind: "text" },
      { key: "applyCta", label: "Apply Button Text", kind: "text" },
    ],
  },
  {
    id: "footer",
    label: "Footer",
    fields: [
      { key: "description", label: "Footer Description", kind: "textarea" },
      { key: "builtLine", label: "“Built For” Line", kind: "text" },
      { key: "copyright", label: "Copyright Text", kind: "text" },
    ],
  },
];

/* ---------------- content editor ---------------- */

function SectionEditor<K extends keyof Content>({ sectionKey, fields }: { sectionKey: K; fields: EditorField[] }) {
  const { db } = useApp();
  const { push } = useToast();
  const [draft, setDraft] = useState<Content[K]>(() => structuredClone(db.content[sectionKey]));
  const [busy, setBusy] = useState(false);
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(db.content[sectionKey]), [draft, db.content, sectionKey]);

  const setField = (key: string, value: unknown) => setDraft((d) => ({ ...d, [key]: value }) as Content[K]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="text-sm text-ash">Every field below drives the live public page. Nothing changes until you publish.</p>
        <div className="flex gap-2">
          <Btn
            variant="dark"
            className="!py-2.5"
            onClick={() => { setDraft(structuredClone(DEFAULT_CONTENT[sectionKey])); push("info", "Draft reset to defaults — press Publish to apply."); }}
          >
            Reset Draft
          </Btn>
          <Btn
            busy={busy}
            disabled={!dirty}
            className="!py-2.5"
            onClick={async () => {
              setBusy(true);
              try {
                await api.updateContentSection(sectionKey, draft);
                push("success", "Content published — the website is already updated.");
              } catch (err) {
                push("error", err instanceof Error ? err.message : "Publish failed.");
              } finally {
                setBusy(false);
              }
            }}
          >
            Publish Section
          </Btn>
        </div>
      </div>

      <div className="space-y-6">
        {fields.map((f) => {
          const value = (draft as Record<string, unknown>)[f.key];
          if (f.kind === "text") {
            return (
              <label key={f.key} className="block">
                <span className="block font-cond uppercase tracking-[0.18em] text-[12px] text-bone/70 mb-1.5">{f.label}</span>
                <TextInput value={String(value ?? "")} onChange={(e) => setField(f.key, e.target.value)} />
              </label>
            );
          }
          if (f.kind === "textarea") {
            return (
              <label key={f.key} className="block">
                <span className="block font-cond uppercase tracking-[0.18em] text-[12px] text-bone/70 mb-1.5">{f.label}</span>
                <TextArea rows={4} value={String(value ?? "")} onChange={(e) => setField(f.key, e.target.value)} />
              </label>
            );
          }
          if (f.kind === "lines") {
            const arr = Array.isArray(value) ? (value as string[]) : [];
            return (
              <label key={f.key} className="block">
                <span className="block font-cond uppercase tracking-[0.18em] text-[12px] text-bone/70 mb-1.5">{f.label}</span>
                <TextArea rows={4} value={arr.join("\n")} onChange={(e) => setField(f.key, e.target.value.split("\n"))} />
              </label>
            );
          }
          // list
          const listField = f as Extract<EditorField, { kind: "list" }>;
          const arr = Array.isArray(value) ? (value as Record<string, string>[]) : [];
          return (
            <div key={f.key}>
              <p className="font-cond uppercase tracking-[0.18em] text-[12px] text-bone/70 mb-2">{f.label}</p>
              <div className="space-y-3">
                {arr.map((item, i) => (
                  <div key={i} className="panel cut-sm p-4 relative">
                    <span className="absolute -top-2.5 left-3 bg-navy px-2 font-display text-sm text-gold/80">{i + 1}</span>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {listField.fields.map((sub: ItemField) => (
                        <label key={sub.key} className={`block ${sub.kind === "textarea" ? "sm:col-span-2" : ""}`}>
                          <span className="block text-[11px] text-ash mb-1 font-cond uppercase tracking-[0.14em]">{sub.label}</span>
                          {sub.kind === "textarea" ? (
                            <TextArea rows={2} value={item[sub.key] ?? ""} onChange={(e) => setField(f.key, arr.map((x, j) => (j === i ? { ...x, [sub.key]: e.target.value } : x)))} />
                          ) : (
                            <TextInput value={item[sub.key] ?? ""} onChange={(e) => setField(f.key, arr.map((x, j) => (j === i ? { ...x, [sub.key]: e.target.value } : x)))} />
                          )}
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={() => setField(f.key, arr.filter((_, j) => j !== i))}
                      className="mt-3 inline-flex items-center gap-1.5 text-red-300/90 hover:text-red-300 text-xs font-cond uppercase tracking-[0.14em] transition-colors"
                    >
                      <IconX className="w-3.5 h-3.5" /> Remove item
                    </button>
                  </div>
                ))}
              </div>
              <Btn
                variant="dark"
                className="mt-3 !py-2"
                onClick={() => setField(f.key, [...arr, Object.fromEntries(listField.fields.map((x: ItemField) => [x.key, ""]))])}
              >
                <IconPlus className="w-4 h-4" /> Add Item
              </Btn>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ContentSection() {
  const [active, setActive] = useState<keyof Content>("home");
  const schema = SCHEMA.find((s) => s.id === active)!;

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-4xl tracking-wide">Website Content Manager</h2>
        <p className="text-ash mt-1.5">Edit every visible string on the public website. Publish to push changes live instantly.</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {SCHEMA.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`cut-sm px-4 py-2.5 font-cond uppercase tracking-[0.16em] text-[12px] border transition-all ${
              active === s.id ? "border-gold bg-gold/15 text-goldsoft" : "border-bone/15 text-ash hover:border-gold/40 hover:text-bone"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <SectionEditor key={active} sectionKey={active} fields={schema.fields} />
    </div>
  );
}

/* ---------------- image manager ---------------- */

export function ImagesSection() {
  const { db } = useApp();
  const { push } = useToast();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-4xl tracking-wide">Image Manager</h2>
        <p className="text-ash mt-1.5">
          PNG, JPG, WebP or GIF · max 1.5 MB each. Transparent PNGs render natively — the logo is never placed in a box.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {IMAGE_META.map((meta) => {
          const src = db.images[meta.key];
          const isDefault = src === DEFAULT_IMAGES[meta.key];
          return (
            <div key={meta.key} className="panel cut p-4">
              <div className="relative h-36 bg-ink border border-bone/10 flex items-center justify-center overflow-hidden mb-4">
                {busyKey === meta.key ? (
                  <Spinner className="w-6 h-6 text-gold" />
                ) : (
                  <img src={src} alt={meta.label} className="max-h-full max-w-full object-contain mix-blend-screen" />
                )}
              </div>
              <p className="font-cond uppercase tracking-[0.14em] text-[11px] text-bone/80 mb-3">{meta.label}</p>
              <div className="flex gap-2">
                <input
                  ref={(el) => { fileRefs.current[meta.key] = el; }}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    setBusyKey(meta.key);
                    try {
                      await api.setImage(meta.key, file);
                      push("success", `${meta.label} updated.`);
                    } catch (err) {
                      push("error", err instanceof Error ? err.message : "Upload failed.");
                    } finally {
                      setBusyKey(null);
                    }
                  }}
                />
                <Btn variant="outline" className="!px-3.5 !py-2 flex-1" onClick={() => fileRefs.current[meta.key]?.click()}>
                  <IconUpload className="w-4 h-4" /> Upload
                </Btn>
                {!isDefault && (
                  <Btn
                    variant="dark"
                    className="!px-3.5 !py-2"
                    onClick={async () => {
                      try {
                        await api.resetImage(meta.key);
                        push("success", `${meta.label} restored to default.`);
                      } catch (err) {
                        push("error", err instanceof Error ? err.message : "Reset failed.");
                      }
                    }}
                  >
                    <IconTrash className="w-4 h-4" /> Reset
                  </Btn>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
