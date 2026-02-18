import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

// Read a key from .dev.vars
function getVar(name: string): string {
  try {
    const devVars = fs.readFileSync(
      path.join(process.cwd(), ".dev.vars"),
      "utf-8",
    );
    const match = devVars.match(new RegExp(`${name}\\s*=\\s*(.+)`));
    if (match) return match[1].trim();
  } catch {}
  throw new Error(`${name} not found in .dev.vars`);
}

const GEMINI_KEY = getVar("GOOGLE_AI_API_KEY");

interface CategoryWithSubs {
  slug: string;
  name: string;
  subs: string;
}

interface DescriptionEntry {
  slug: string;
  category: string;
  subservice: string;
  description: string;
  fullPrompt: string;
}

// Query local D1 for all categories with sub-services
function getCategories(): CategoryWithSubs[] {
  const raw = execSync(
    `npx wrangler d1 execute find-a-pro-db --local --json --command "SELECT c.slug, c.name, GROUP_CONCAT(s.name, '|') as subs FROM categories c LEFT JOIN sub_services s ON s.category_id = c.id GROUP BY c.id ORDER BY c.name;"`,
    { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] },
  );
  const data = JSON.parse(raw);
  return data[0].results as CategoryWithSubs[];
}

// Call Gemini API
async function askGemini(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    },
  );
  const data = (await res.json()) as {
    candidates: { content: { parts: { text: string }[] } }[];
  };
  return data.candidates[0].content.parts[0].text.trim();
}

async function main() {
  console.log("=== Step 1: Querying categories from local DB ===\n");
  const categories = getCategories();
  console.log(`Found ${categories.length} categories\n`);

  console.log("=== Step 2: Gemini picks best sub-service per category ===\n");
  const subserviceMap: Record<string, string> = {};

  for (const cat of categories) {
    const subList = cat.subs ? cat.subs.split("|") : [];
    if (subList.length === 0) {
      console.log(`  ${cat.name}: (no sub-services, using category name)`);
      subserviceMap[cat.slug] = cat.name;
      continue;
    }
    if (subList.length === 1) {
      console.log(`  ${cat.name}: ${subList[0]} (only one)`);
      subserviceMap[cat.slug] = subList[0];
      continue;
    }

    const prompt = `You are helping create a photo for a home services website. Given the trade "${cat.name}" with these sub-services: ${subList.join(", ")} — which single sub-service is most commonly hired for by homeowners? Pick the everyday job people usually need done. Reply with just the sub-service name, nothing else.`;
    const chosen = await askGemini(prompt);
    subserviceMap[cat.slug] = chosen;
    console.log(`  ${cat.name}: ${chosen}`);
  }

  fs.writeFileSync(
    "/tmp/category-subservices.json",
    JSON.stringify(subserviceMap, null, 2),
  );
  console.log("\nSaved to /tmp/category-subservices.json\n");

  console.log("=== Step 3: Gemini describes each professional ===\n");
  const descriptions: DescriptionEntry[] = [];

  for (const cat of categories) {
    const subservice = subserviceMap[cat.slug];
    const prompt = `Describe in one sentence what a typical ${cat.name} doing ${subservice} in the USA looks like for a website photo. Rules: ONE person only, average/normal build (not muscular, not a model), realistic everyday appearance, appropriate work clothing, key tools visible, bright well-lit setting. Just the description, no preamble.`;
    const description = await askGemini(prompt);
    const fullPrompt = `${description}, single person, shot on Canon EOS R5, 35mm, clean commercial photography, bright natural lighting, shallow depth of field, focused on their work, 8k, ultra detailed`;

    descriptions.push({
      slug: cat.slug,
      category: cat.name,
      subservice,
      description,
      fullPrompt,
    });

    console.log(`--- ${cat.name} (${subservice}) ---`);
    console.log(`Description: ${description}`);
    console.log(`Full prompt: ${fullPrompt}\n`);
  }

  fs.writeFileSync(
    "/tmp/category-descriptions.json",
    JSON.stringify(descriptions, null, 2),
  );
  console.log(
    `\n=== Done! ${descriptions.length} descriptions saved to /tmp/category-descriptions.json ===`,
  );
  console.log(
    "Review the descriptions above. When ready, run generate-category-images.ts to create the images.",
  );
}

main();
