import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { getDB, getVersion, subscribe, type DB } from "../lib/db";
import * as api from "../lib/api";

interface SessionInfo {
  username: string;
}

interface AppContextValue {
  db: DB;
  session: SessionInfo | null;
  sessionChecked: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const version = useSyncExternalStore(subscribe, getVersion);
  void version;
  const db = getDB();

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  const refreshSession = useCallback(async () => {
    const s = await api.getSession();
    setSession(s);
    setSessionChecked(true);
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const logout = useCallback(async () => {
    await api.logout();
    setSession(null);
  }, []);

  return (
    <AppContext.Provider value={{ db, session, sessionChecked, refreshSession, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
