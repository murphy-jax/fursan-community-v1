import { createContext, useContext } from "react";

export interface ToastMsg { id: number; kind: "success" | "error" | "info"; text: string; }

export interface AdminCtx {
  toast: (text: string, kind?: ToastMsg["kind"]) => void;
  logout: () => void;
}

export const AdminContext = createContext<AdminCtx | null>(null);

export function useAdmin(): AdminCtx {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("AdminContext missing");
  return ctx;
}
