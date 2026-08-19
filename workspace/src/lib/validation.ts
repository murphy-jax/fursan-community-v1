/**
 * Shared field specs + validation used by BOTH the public forms and the
 * API layer (which re-validates every write, server-style).
 */
import type { AppType } from "./db";

export interface FieldSpec {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "number";
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: string[];
  rows?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export const COMMON_FIELDS: FieldSpec[] = [
  { key: "fullName", label: "Full Name", type: "text", required: true, placeholder: "e.g. Yassine El Amrani", maxLength: 80 },
  { key: "discordUsername", label: "Discord Username", type: "text", required: true, placeholder: "e.g. fursan_rider", maxLength: 60, hint: "Your current Discord username (not the old #tag)." },
  { key: "discordId", label: "Discord User ID", type: "text", required: true, placeholder: "e.g. 245183659430576128", maxLength: 22, hint: "Numeric ID, 16–22 digits. Enable Developer Mode in Discord → right-click your profile → Copy User ID." },
  { key: "age", label: "Age", type: "number", required: true, placeholder: "e.g. 19", min: 13, max: 99 },
  { key: "country", label: "Country / Timezone", type: "text", required: true, placeholder: "e.g. Morocco — GMT+1", maxLength: 60 },
];

export const ESPORTS_FIELDS: FieldSpec[] = [
  { key: "program", label: "Program", type: "select", required: true, options: [] },
  { key: "platform", label: "Platform", type: "select", required: true, options: ["PC", "PlayStation", "Xbox", "Mobile", "Cross-platform"] },
  { key: "gameId", label: "Player / Game ID", type: "text", required: true, placeholder: "In-game name, EA ID, Riot ID or Steam profile", maxLength: 120 },
  { key: "currentRank", label: "Current Rank", type: "text", required: true, placeholder: "e.g. Division Rivals Elite / Immortal 2 / Premier 18k", maxLength: 80 },
  { key: "peakRank", label: "Peak Rank (when relevant)", type: "text", placeholder: "e.g. Radiant peak — Act 3", maxLength: 80 },
  { key: "mainRole", label: "Main Role / Agents", type: "text", required: true, placeholder: "e.g. IGL / Duelist — Jett, Raze", maxLength: 120 },
  { key: "prevTeams", label: "Previous Teams", type: "textarea", rows: 3, placeholder: "Team names, rosters and time periods. Write “None” if this is your first org.", maxLength: 600 },
  { key: "compExperience", label: "Competitive Experience", type: "textarea", required: true, rows: 4, placeholder: "Leagues, ladders, scrims, ranked seasons — anything that shows your level.", maxLength: 1200 },
  { key: "tournamentExperience", label: "Tournament Experience", type: "textarea", rows: 3, placeholder: "Notable placements, cups and LANs.", maxLength: 800 },
  { key: "availability", label: "Availability", type: "text", required: true, placeholder: "e.g. 5 days/week, evenings GMT+1, weekends full", maxLength: 200 },
  { key: "whyFursan", label: "Why do you want to join FURSAN?", type: "textarea", required: true, rows: 5, placeholder: "Be honest — we read every word.", maxLength: 1500 },
  { key: "additional", label: "Additional Information", type: "textarea", rows: 3, placeholder: "VOD links, clips, references…", maxLength: 800 },
];

export const EMS_FIELDS: FieldSpec[] = [
  { key: "fivemName", label: "FiveM Name", type: "text", required: true, placeholder: "e.g. Amine Bouzid", maxLength: 80, hint: "Your full roleplay character name." },
  { key: "rpHours", label: "RP Hours", type: "text", required: true, placeholder: "e.g. 450+ hours on whitelist servers", maxLength: 120 },
  { key: "prevEms", label: "Previous EMS Experience", type: "textarea", rows: 3, placeholder: "Any medical department experience in FiveM or other RP frameworks. Write “None” if new.", maxLength: 800 },
  { key: "prevDepartments", label: "Previous Departments & Servers", type: "textarea", rows: 3, placeholder: "Servers, departments and ranks held.", maxLength: 800 },
  { key: "availability", label: "Availability", type: "text", required: true, placeholder: "e.g. 4 shifts/week, evenings GMT+1", maxLength: 200 },
  { key: "motivation", label: "Motivation", type: "textarea", required: true, rows: 5, placeholder: "Why San Andreas EMS? Why now?", maxLength: 1500 },
  { key: "medicalScenario", label: "Medical Roleplay Scenario", type: "textarea", required: true, rows: 5, placeholder: "A player is down after a 2-story fall with heavy bleeding. Walk us through your response step by step.", maxLength: 1800 },
  { key: "additional", label: "Additional Information", type: "textarea", rows: 3, maxLength: 800 },
];

export const LSPD_FIELDS: FieldSpec[] = [
  { key: "fivemName", label: "FiveM Name", type: "text", required: true, placeholder: "e.g. Karim Haddad", maxLength: 80, hint: "Your full roleplay character name." },
  { key: "rpHours", label: "RP Hours", type: "text", required: true, placeholder: "e.g. 600+ hours on serious RP servers", maxLength: 120 },
  { key: "prevPolice", label: "Previous Police Experience", type: "textarea", rows: 3, placeholder: "Any police department experience in FiveM or other RP frameworks. Write “None” if new.", maxLength: 800 },
  { key: "prevDepartments", label: "Previous Departments & Servers", type: "textarea", rows: 3, placeholder: "Servers, departments and ranks held.", maxLength: 800 },
  { key: "availability", label: "Availability", type: "text", required: true, placeholder: "e.g. 4 patrols/week, nights GMT+1", maxLength: 200 },
  { key: "trafficStop", label: "Scenario — Traffic Stop", type: "textarea", required: true, rows: 4, placeholder: "You pull over a vehicle that ran a red light. The driver becomes hostile. How do you handle it?", maxLength: 1800 },
  { key: "pursuit", label: "Scenario — High-Speed Pursuit", type: "textarea", required: true, rows: 4, placeholder: "A stolen Sultan RS refuses to stop in a busy downtown. Describe your pursuit discipline.", maxLength: 1800 },
  { key: "armedSuspect", label: "Scenario — Armed Suspect", type: "textarea", required: true, rows: 4, placeholder: "An armed suspect is cornered in an alley with civilians nearby. Walk us through your decisions.", maxLength: 1800 },
  { key: "professionalRp", label: "What Professional Roleplay Means To You", type: "textarea", required: true, rows: 4, maxLength: 1500 },
  { key: "additional", label: "Additional Information", type: "textarea", rows: 3, maxLength: 800 },
];

export function fieldsFor(type: AppType): FieldSpec[] {
  if (type === "esports") return [...COMMON_FIELDS, ...ESPORTS_FIELDS];
  if (type === "ems") return [...COMMON_FIELDS, ...EMS_FIELDS];
  return [...COMMON_FIELDS, ...LSPD_FIELDS];
}

export function sanitize(value: string, maxLength = 2000): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeMultiline(value: string, maxLength = 2000): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, maxLength);
}

export const DISCORD_ID_RE = /^\d{16,22}$/;

export function validateDiscordId(id: string): boolean {
  return DISCORD_ID_RE.test(id.trim());
}

export interface ValidationResult {
  ok: boolean;
  errors: Record<string, string>;
  data: Record<string, string>;
}

export function validateApplication(
  type: AppType,
  raw: Record<string, string>,
  allowedPrograms: string[]
): ValidationResult {
  const errors: Record<string, string> = {};
  const data: Record<string, string> = {};
  const specs = fieldsFor(type);

  for (const spec of specs) {
    const value = (raw[spec.key] ?? "").toString();
    const clean =
      spec.type === "textarea"
        ? sanitizeMultiline(value, spec.maxLength ?? 2000)
        : sanitize(value, spec.maxLength ?? 400);
    data[spec.key] = clean;

    if (spec.required && clean.length === 0) {
      errors[spec.key] = `${spec.label} is required.`;
      continue;
    }
    if (clean.length === 0) continue;

    if (spec.type === "number") {
      const n = Number(clean);
      if (!Number.isInteger(n)) errors[spec.key] = `${spec.label} must be a whole number.`;
      else if (spec.min != null && n < spec.min) errors[spec.key] = `${spec.label} must be at least ${spec.min}.`;
      else if (spec.max != null && n > spec.max) errors[spec.key] = `${spec.label} must be at most ${spec.max}.`;
    }
    if (spec.key === "discordId" && !DISCORD_ID_RE.test(clean)) {
      errors[spec.key] = "Discord User ID must be 16–22 digits.";
    }
    if (spec.key === "age") {
      const n = Number(clean);
      if (Number.isInteger(n) && (n < 13 || n > 99)) errors[spec.key] = "Age must be between 13 and 99.";
    }
    if (spec.type === "select" && spec.key === "platform" && !spec.options!.includes(clean)) {
      errors[spec.key] = "Select a valid platform.";
    }
  }

  if (type === "esports") {
    if (!data.program || !allowedPrograms.includes(data.program)) {
      errors.program = "Select a valid program.";
    }
    for (const k of ["compExperience", "whyFursan"]) {
      if (!errors[k] && data[k] && data[k].length < 30) errors[k] = "Give us a little more detail (30+ characters).";
    }
  }
  if (type === "ems") {
    for (const k of ["motivation", "medicalScenario"]) {
      if (!errors[k] && data[k] && data[k].length < 30) errors[k] = "Give us a little more detail (30+ characters).";
    }
  }
  if (type === "lspd") {
    for (const k of ["trafficStop", "pursuit", "armedSuspect", "professionalRp"]) {
      if (!errors[k] && data[k] && data[k].length < 30) errors[k] = "Give us a little more detail (30+ characters).";
    }
  }

  return { ok: Object.keys(errors).length === 0, errors, data };
}
