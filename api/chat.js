// ============================================================
//  /api/chat.js  —  Vercel serverless backend for the demo chat
// ============================================================
//  Keeps your API key OFF the website. The browser talks to THIS
//  file (same domain); this file talks to Claude using a key stored
//  in Vercel's settings — never visible to the visitor.
//
//  SETUP (one time):
//   1. This file must live at:  /api/chat.js
//   2. Vercel → project → Settings → Environment Variables:
//        ANTHROPIC_API_KEY = your key (starts with sk-ant-)
//      IMPORTANT: tick the "Production" box when adding it.
//   3. Deployments → redeploy the latest build so the key applies.
// ============================================================

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "Missing ANTHROPIC_API_KEY env var" });
  }

  try {
    const { system, messages } = req.body;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        // Haiku is cheap + fast and plenty smart for a quote bot.
        // Swap to "claude-sonnet-4-6" if you want it sharper.
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system,
        messages,
      }),
    });

    const data = await response.json();
    // Pass Claude's real status through so the front end can show the actual error.
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
