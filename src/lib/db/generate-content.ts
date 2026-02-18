/**
 * Generate AI content and push directly to remote D1, one service at a time.
 *
 * Usage:
 *   npx tsx src/lib/db/generate-content.ts [--limit 50] [--skip 0] [--batch 5]
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

const GEMINI_API_KEY = (() => {
  if (process.env.GOOGLE_AI_API_KEY) return process.env.GOOGLE_AI_API_KEY;
  try {
    const vars = readFileSync(
      resolve(__dirname, "../../../.dev.vars"),
      "utf-8",
    );
    const match = vars.match(/GOOGLE_AI_API_KEY=(.+)/);
    if (match) return match[1].trim();
  } catch {}
  throw new Error("Set GOOGLE_AI_API_KEY env var");
})();

const MODEL = "gemini-2.5-flash";
const API = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const PROMPTS: Record<string, string> = {
  content:
    "Write engaging, informative content about {{topic}} for homeowners looking to hire a professional. Include practical advice and what to expect.",
  faq: "Generate 5-7 frequently asked questions and detailed answers about {{topic}} that homeowners commonly ask before hiring a professional.",
  pricing:
    "Create a pricing guide for {{topic}} with 4-6 common service items, typical price ranges (low and high), and helpful notes about what affects pricing.",
  tips: "Write 5-8 practical tips for homeowners about {{topic}}. Focus on what they should know before, during, and after hiring a professional.",
  questions:
    "Generate 6-8 important questions that homeowners should ask a professional about {{topic}} before hiring them.",
};

const SYS = (
  t: string,
) => `You are a content generator for ProBuddy, a home services website. Generate JSON for a "${t}" section.
RULES: Return ONLY JSON. No markdown fences. Realistic prices in cents. Currency: $.
Formats:
- content: { "title": "...", "text": "..." }
- faq: { "title": "...", "items": [{ "question": "...", "answer": "..." }] }
- pricing: { "title": "...", "items": [{ "name": "...", "priceLow": 10000, "priceHigh": 30000, "note": "..." }] }
- tips: { "title": "...", "tips": ["..."] }
- questions: { "title": "...", "questions": ["..."] }`;

interface Row {
  section_id: string;
  section_type: string;
  sub_name: string;
}

async function generate(s: Row): Promise<string | null> {
  const prompt = (PROMPTS[s.section_type] ?? "").replace(
    /\{\{topic\}\}/g,
    s.sub_name,
  );
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120000);
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        systemInstruction: {
          role: "model",
          parts: [{ text: SYS(s.section_type) }],
        },
        generationConfig: { temperature: 0.7 },
      }),
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const clean = text
      .replace(/^```(?:json)?\n?/m, "")
      .replace(/\n?```$/m, "")
      .trim();
    JSON.parse(clean);
    return clean;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

function pushToD1(sectionId: string, content: string) {
  // Escape for shell: replace ' with '\''
  const escaped = content.replace(/'/g, "''");
  const sql = `UPDATE page_sections SET content = '${escaped}', updated_at = '${new Date().toISOString()}' WHERE id = '${sectionId}';`;
  // Write to temp file to avoid shell escaping issues
  const tmpFile = "/tmp/d1-update.sql";
  require("fs").writeFileSync(tmpFile, sql);
  execSync(
    `npx wrangler d1 execute find-a-pro-db --file ${tmpFile} --remote -y 2>/dev/null`,
    {
      cwd: resolve(__dirname, "../../.."),
      timeout: 15000,
    },
  );
}

async function main() {
  const args = process.argv.slice(2);
  const getArg = (n: string, d: number) => {
    const i = args.indexOf(n);
    return i >= 0 ? parseInt(args[i + 1], 10) : d;
  };

  const limit = getArg("--limit", 50);
  const skip = getArg("--skip", 0);
  const aiBatch = getArg("--batch", 5);

  const sections: Row[] = JSON.parse(
    readFileSync("/tmp/sections_to_generate.json", "utf-8"),
  );
  const toProcess = sections.slice(skip, skip + limit * 5); // limit is in sub-services, each has 5 sections

  // Group by sub_name
  const grouped: { name: string; sections: Row[] }[] = [];
  let current: { name: string; sections: Row[] } | null = null;
  for (const s of toProcess) {
    if (!current || current.name !== s.sub_name) {
      current = { name: s.sub_name, sections: [] };
      grouped.push(current);
    }
    current.sections.push(s);
  }
  const services = grouped.slice(0, limit);
  const totalSections = services.reduce((a, g) => a + g.sections.length, 0);

  const start = Date.now();
  let okAi = 0,
    failAi = 0,
    okDb = 0,
    failDb = 0,
    done = 0;

  console.log(
    `\n  Model: ${MODEL} | Services: ${services.length} | Sections: ${totalSections}\n`,
  );

  for (let si = 0; si < services.length; si++) {
    const svc = services[si];
    process.stdout.write(`  [${si + 1}/${services.length}] ${svc.name}  `);

    // Generate all sections for this service in parallel
    const results = await Promise.all(svc.sections.map(generate));

    // Push each to D1
    const sectionResults: string[] = [];
    for (let j = 0; j < svc.sections.length; j++) {
      const content = results[j];
      done++;
      if (!content) {
        failAi++;
        sectionResults.push("✗");
        continue;
      }
      okAi++;
      try {
        pushToD1(svc.sections[j].section_id, content);
        okDb++;
        sectionResults.push("✓");
      } catch {
        failDb++;
        sectionResults.push("⚠");
      }
    }

    const elapsed = ((Date.now() - start) / 1000).toFixed(0);
    const rate = ((done / (Number(elapsed) || 1)) * 60).toFixed(0);
    process.stdout.write(
      `${sectionResults.join("")}  (${done}/${totalSections} | ${rate}/min | ${elapsed}s)\n`,
    );
  }

  console.log(
    `\n  AI: ${okAi} ok, ${failAi} fail  |  DB: ${okDb} ok, ${failDb} fail`,
  );
  console.log(`  Total time: ${((Date.now() - start) / 1000).toFixed(0)}s\n`);
}

main().catch(console.error);
