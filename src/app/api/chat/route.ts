import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, turnstileToken, context } = body;

    if (!message || typeof message !== "string" || message.length > 500) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    let env: any;
    try {
      const ctx = await getCloudflareContext({ async: true });
      env = ctx.env;
    } catch {
      env = process.env;
    }

    // Require Turnstile token presence — bots don't get AI chat.
    // Don't re-verify server-side: tokens are single-use and already
    // verified by /api/pros/search. Just check the client sent one.
    if (env.TURNSTILE_SECRET_KEY && !turnstileToken) {
      return NextResponse.json(
        { error: "Verification required" },
        { status: 403 },
      );
    }

    // Generate response with Gemini
    const apiKey = env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service unavailable" },
        { status: 503 },
      );
    }

    // --- Shared daily Gemini counter (safety cap: ~$10/day max) ---
    const DAILY_CAP = 14000;
    const today = new Date().toISOString().slice(0, 10);
    const counterKey = `gemini:counter:${today}`;
    const cache = env.CACHE;

    if (cache) {
      try {
        const count = parseInt((await cache.get(counterKey)) || "0", 10);
        if (count >= DAILY_CAP) {
          console.log("[Chat] Daily Gemini cap reached:", count);
          return NextResponse.json(
            { error: "AI service is temporarily unavailable. Please try again later." },
            { status: 503 },
          );
        }
      } catch {
        // KV read failed — proceed anyway
      }
    }

    const { serviceName, city, pageContent } = context || {};

    const systemPrompt = `You are Pro Buddy, a friendly AI assistant on ProBuddy.ai — a home services platform connecting homeowners with local pros.

The user is viewing: ${serviceName || "home services"}${city ? ` in ${city}` : ""}.

Page context:
${pageContent || "General home services information."}

Rules:
- Be conversational and helpful, like a knowledgeable friend. Keep answers to 2-4 short sentences.
- Use the local currency for the user's location. If the city is in the UK use £, in the US use $, in Europe use €, etc.
- If asked about a different service, help them! You know about all home services. Use the location context.
- Never dump long lists. If listing things, keep to 3-4 max and write naturally.
- Don't use markdown formatting — no ** or * or # symbols. Write in plain conversational English.
- Don't make up company names. Give general price ranges only when asked.
- Gently mention they can get a free quote on the page, but don't be pushy about it.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }],
      systemInstruction: { role: "model", parts: [{ text: systemPrompt }] },
      generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
    });

    const reply = result.response.text().trim();

    // Increment shared daily Gemini counter (fire-and-forget)
    if (cache) {
      cache
        .get(counterKey)
        .then((val: string | null) => {
          const count = parseInt(val || "0", 10) + 1;
          return cache.put(counterKey, String(count), {
            expirationTtl: 86400,
          });
        })
        .catch(() => {});
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
