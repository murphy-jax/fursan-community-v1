import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/backend";

/* ============================================================
   Discord identity gate — every visitor must connect Discord
   (real OAuth via Supabase Auth, PKCE flow). The verified
   identity (snowflake ID) is what receives roles + DMs.
   ============================================================ */

export interface DiscordIdentity {
  discordId: string;
  username: string;
  avatar: string;
  email?: string;
}

interface AuthCtx {
  ready: boolean;
  user: User | null;
  identity: DiscordIdentity | null;
  connecting: boolean;
  error: string;
  signInWithDiscord: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

function extractIdentity(user: User | null): DiscordIdentity | null {
  if (!user) return null;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const discordId = String(meta.provider_id ?? meta.sub ?? "");
  const username = String(meta.user_name ?? meta.name ?? meta.full_name ?? "knight");
  const avatar = String(meta.avatar_url ?? meta.picture ?? "");
  if (!discordId) return null;
  return { discordId, username, avatar, email: user.email };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
      setConnecting(false);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithDiscord = useCallback(async () => {
    setError("");
    setConnecting(true);
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: window.location.origin, queryParams: { prompt: "consent" } },
    });
    if (e) {
      setConnecting(false);
      const notEnabled = /not enabled|invalid.*provider|unsupported/i.test(e.message);
      setError(
        notEnabled
          ? "The Discord provider is not enabled for this Supabase project yet. Enable it under Authentication → Providers → Discord (full steps in the README)."
          : e.message
      );
    }
    // on success the browser redirects to discord.com, then back with ?code=
  }, []);

  const signOutUser = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const identity = useMemo(() => extractIdentity(user), [user]);

  const value = useMemo(
    () => ({ ready, user, identity, connecting, error, signInWithDiscord, signOutUser }),
    [ready, user, identity, connecting, error, signInWithDiscord, signOutUser]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
