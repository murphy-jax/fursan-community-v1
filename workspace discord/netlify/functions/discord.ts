/* Netlify serverless function — proxies requests to the Discord API v10.
   Runs on Netlify's servers (server-side), so there is no browser CORS block.
   The client sends the (decrypted) bot token over HTTPS; we never store it. */

const json = (o: unknown) =>
  new Response(JSON.stringify(o), { headers: { "Content-Type": "application/json" } });

export default async (req: Request) => {
  if (req.method !== "POST") {
    return json({ ok: false, status: 405, message: "Method not allowed" });
  }

  let payload: { method?: string; path?: string; token?: string; body?: unknown };
  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    return json({ ok: false, status: 400, message: "Invalid request body" });
  }

  const { method, path, token, body } = payload;
  if (!token || !path) {
    return json({ ok: false, status: 400, message: "Missing token or path" });
  }

  try {
    const res = await fetch(`https://discord.com/api/v10${path}`, {
      method: method ?? "GET",
      headers: {
        Authorization: `Bot ${token}`,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    let parsed: any = null;
    try {
      parsed = await res.json();
    } catch {
      /* Discord sometimes returns empty bodies */
    }

    return json({
      ok: res.ok,
      status: res.status,
      message:
        parsed?.message ??
        (res.ok ? "Discord confirmed." : `Discord responded ${res.status}.`),
      body: parsed,
    });
  } catch {
    return json({ ok: false, status: 0, message: "Discord API request failed on the server." });
  }
};
