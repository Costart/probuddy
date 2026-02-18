/**
 * Generate category images using Google Nano Banana Pro (gemini-3-pro-image-preview)
 * and upload to Cloudflare R2.
 *
 * Usage: npx tsx src/lib/db/generate-nanobananapro-images.ts
 *
 * Requires:
 *   GOOGLE_AI_API_KEY in .dev.vars
 *   wrangler CLI for R2 uploads
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// Load env
const envPath = path.join(process.cwd(), ".dev.vars");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars: Record<string, string> = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.+)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
}

const API_KEY = envVars.GOOGLE_AI_API_KEY;
if (!API_KEY) throw new Error("GOOGLE_AI_API_KEY not found in .dev.vars");

const R2_BUCKET = "probuddy-images";
const R2_PUBLIC_URL = "https://pub-dfccc05a7dfa4dd9971a17a179a709f5.r2.dev";
const MODEL = "gemini-3-pro-image-preview";

// Category prompts - professional, realistic photos of people doing the service
const categories = [
  {
    slug: "accountant",
    prompt:
      "Professional accountant at desk reviewing financial documents with a calculator and laptop, modern office, warm natural lighting",
  },
  {
    slug: "animal-trainer",
    prompt:
      "Animal trainer working with a golden retriever in a park, positive reinforcement training, natural daylight outdoor setting",
  },
  {
    slug: "architect",
    prompt:
      "Architect reviewing building plans and blueprints spread on a table, hard hat nearby, modern construction office",
  },
  {
    slug: "arts-crafts-instructor",
    prompt:
      "Arts and crafts instructor helping a student with a pottery project in a bright creative workshop",
  },
  {
    slug: "attorney",
    prompt:
      "Attorney in business attire reviewing legal documents at a conference table, law books in background, professional office",
  },
  {
    slug: "bartender",
    prompt:
      "Bartender crafting a cocktail at a well-lit bar, shaking a cocktail shaker, professional bar setting",
  },
  {
    slug: "beautician",
    prompt:
      "Beautician applying makeup to a client in a clean bright beauty salon, professional tools visible",
  },
  {
    slug: "business-consultant",
    prompt:
      "Business consultant presenting strategy on a whiteboard to a small team, modern meeting room",
  },
  {
    slug: "carpenter",
    prompt:
      "Carpenter measuring and cutting wood with hand tools in a workshop, sawdust visible, warm workshop lighting",
  },
  {
    slug: "caterer",
    prompt:
      "Caterer arranging an elegant food display at an outdoor event, professional plating and garnishing",
  },
  {
    slug: "cleaner",
    prompt:
      "Professional house cleaner wiping down a modern kitchen counter, wearing gloves, bright clean home",
  },
  {
    slug: "dj",
    prompt:
      "DJ mixing music at professional turntables and controller, colorful ambient lighting, event setting",
  },
  {
    slug: "electrician",
    prompt:
      "Licensed electrician working on a residential electrical panel with tools, wearing safety gear, well-lit home",
  },
  {
    slug: "entertainer",
    prompt:
      "Entertainer performing magic tricks at a family gathering, children watching in amazement, festive setting",
  },
  {
    slug: "equipment-rental-provider",
    prompt:
      "Equipment rental staff showing a customer how to operate a power tool, warehouse of equipment in background",
  },
  {
    slug: "event-decorator",
    prompt:
      "Event decorator arranging floral centerpieces on round tables, elegant venue with draped fabric backdrop",
  },
  {
    slug: "event-planner",
    prompt:
      "Event planner organizing details with a clipboard at a beautifully set venue, coordinating decorations",
  },
  {
    slug: "event-staff-provider",
    prompt:
      "Professional event staff serving drinks at an upscale outdoor reception, uniform attire",
  },
  {
    slug: "fitness-instructor",
    prompt:
      "Fitness instructor leading a small group exercise class in a bright modern gym, encouraging participants",
  },
  {
    slug: "flooring-specialist",
    prompt:
      "Flooring specialist installing hardwood floor planks in a residential room, kneeling with tools",
  },
  {
    slug: "garage-door-technician",
    prompt:
      "Garage door technician repairing a residential garage door mechanism, tools in hand, suburban home",
  },
  {
    slug: "general-contractor",
    prompt:
      "General contractor reviewing renovation plans at a residential construction site, wearing hard hat, discussing with homeowner",
  },
  {
    slug: "graphic-designer",
    prompt:
      "Graphic designer working on creative designs at a dual-monitor setup, colorful artwork on screens, modern studio",
  },
  {
    slug: "handyman",
    prompt:
      "Handyman fixing a kitchen cabinet hinge with a screwdriver, friendly expression, residential home setting",
  },
  {
    slug: "home-inspector",
    prompt:
      "Home inspector examining a house exterior with clipboard and flashlight, checking foundation, residential property",
  },
  {
    slug: "home-maintenance-specialist",
    prompt:
      "Home maintenance worker performing seasonal gutter cleaning on a house, on a ladder, suburban setting",
  },
  {
    slug: "home-systems-specialist",
    prompt:
      "Home systems technician installing a smart thermostat on a wall, modern home automation setup",
  },
  {
    slug: "home-theater-installer",
    prompt:
      "Home theater installer mounting a large screen TV on a living room wall, professional tools and cables",
  },
  {
    slug: "hvac-technician",
    prompt:
      "HVAC technician servicing an outdoor air conditioning unit with gauges and tools, residential home",
  },
  {
    slug: "instructor",
    prompt:
      "Professional instructor teaching a small classroom of adult students, whiteboard with notes, engaged learning environment",
  },
  {
    slug: "interior-designer",
    prompt:
      "Interior designer showing fabric and paint swatches to a client in a beautifully decorated living room",
  },
  {
    slug: "it-specialist",
    prompt:
      "IT specialist setting up network equipment and servers in a small office, cables and switches visible",
  },
  {
    slug: "landscaper",
    prompt:
      "Landscaper trimming hedges in a sunny suburban front garden with professional hedge trimmer, green lush garden",
  },
  {
    slug: "language-teacher",
    prompt:
      "Language teacher at a whiteboard with foreign language vocabulary, engaging with a small group of students",
  },
  {
    slug: "life-coach",
    prompt:
      "Life coach in a comfortable one-on-one session with a client, bright airy office with plants",
  },
  {
    slug: "marketing-consultant",
    prompt:
      "Marketing consultant analyzing social media analytics on a laptop screen, coffee shop meeting, data charts visible",
  },
  {
    slug: "mason",
    prompt:
      "Mason laying bricks for a garden retaining wall, trowel and mortar, outdoor residential construction",
  },
  {
    slug: "mover",
    prompt:
      "Professional movers carefully carrying a sofa through a front door, moving truck visible in background",
  },
  {
    slug: "music-teacher",
    prompt:
      "Music teacher giving a piano lesson to a young student, sheet music visible, warm home studio setting",
  },
  {
    slug: "outdoor-cleaner",
    prompt:
      "Outdoor cleaner power washing a patio and deck, water spray visible, suburban backyard",
  },
  {
    slug: "painter",
    prompt:
      "House painter rolling paint on an interior wall with a roller, drop cloths on floor, residential room being refreshed",
  },
  {
    slug: "pest-control-specialist",
    prompt:
      "Pest control specialist inspecting baseboards with a flashlight and treatment equipment, clean residential interior",
  },
  {
    slug: "pet-caregiver",
    prompt:
      "Pet caregiver walking multiple dogs on leashes in a sunny park, happy dogs, professional pet sitter",
  },
  {
    slug: "pet-groomer",
    prompt:
      "Pet groomer bathing a fluffy dog in a professional grooming station, bubbles and clean towels",
  },
  {
    slug: "pet-specialist",
    prompt:
      "Pet specialist examining a cat with a stethoscope at a clean veterinary-style clinic, gentle care",
  },
  {
    slug: "photographer",
    prompt:
      "Professional photographer shooting a portrait session in a studio with lighting equipment and backdrop",
  },
  {
    slug: "plumber",
    prompt:
      "Plumber fixing pipes under a kitchen sink with a wrench, toolbox nearby, clean residential kitchen",
  },
  {
    slug: "pool-spa-specialist",
    prompt:
      "Pool technician testing water chemistry at the edge of a backyard swimming pool, testing kit in hand",
  },
  {
    slug: "real-estate-professional",
    prompt:
      "Real estate agent showing a couple around a bright open-plan house, gesturing at features, house tour",
  },
  {
    slug: "remediation-specialist",
    prompt:
      "Remediation specialist in protective gear inspecting a basement for water damage, equipment visible",
  },
  {
    slug: "roofer",
    prompt:
      "Roofer replacing shingles on a residential roof, safety harness, tools, sunny day, suburban house",
  },
  {
    slug: "security-consultant",
    prompt:
      "Security consultant reviewing a building's CCTV system on multiple monitors, professional security office",
  },
  {
    slug: "security-specialist",
    prompt:
      "Security specialist installing a modern home alarm system panel on a wall, residential entryway",
  },
  {
    slug: "spiritual-healer",
    prompt:
      "Holistic wellness practitioner in a calm meditation session with a client, candles and peaceful studio",
  },
  {
    slug: "sports-instructor",
    prompt:
      "Sports instructor coaching tennis on an outdoor court, demonstrating technique, sunny athletic setting",
  },
  {
    slug: "test-prep-tutor",
    prompt:
      "Test prep tutor working through practice problems with a high school student, books and papers on desk",
  },
  {
    slug: "translator",
    prompt:
      "Professional translator working at a desk with multiple documents in different languages, laptop open",
  },
  {
    slug: "transportation-provider",
    prompt:
      "Professional driver opening a car door for a passenger, clean luxury sedan, airport or hotel pickup",
  },
  {
    slug: "tutor",
    prompt:
      "Tutor helping a student with homework at a library table, books open, encouraging teaching moment",
  },
  {
    slug: "web-developer",
    prompt:
      "Web developer coding at a desk with multiple screens showing code and website designs, modern office",
  },
  {
    slug: "welder",
    prompt:
      "Welder in protective mask welding metal in a workshop, sparks flying, industrial fabrication setting",
  },
  {
    slug: "wellness-specialist",
    prompt:
      "Massage therapist giving a relaxing treatment in a serene spa room, candles and soft lighting",
  },
  {
    slug: "window-door-installer",
    prompt:
      "Window installer fitting a new double-glazed window into a residential home frame, measuring tape visible",
  },
];

async function generateImage(prompt: string): Promise<Buffer | null> {
  const fullPrompt = `Generate a professional, realistic photograph: ${prompt}. The image should look like a real photo, not AI-generated. Natural lighting, 3:2 landscape aspect ratio, high quality.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"],
        },
      }),
    },
  );
  clearTimeout(timeout);

  const data = await res.json();

  if (data.error) {
    console.error("  API error:", data.error.message);
    return null;
  }

  const parts = data.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData) {
      return Buffer.from(part.inlineData.data, "base64");
    }
  }
  console.error("  No image in response");
  return null;
}

function uploadToR2(localPath: string, key: string): string {
  execSync(
    `npx wrangler r2 object put "${R2_BUCKET}/${key}" --file="${localPath}" --content-type="image/jpeg" --remote`,
    { stdio: "pipe" },
  );
  return `${R2_PUBLIC_URL}/${key}`;
}

async function main() {
  const tmpDir = "/tmp/nanobananapro-images";
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const results: { slug: string; url: string }[] = [];
  const resumeFile = `${tmpDir}/progress.json`;
  const done: Set<string> = new Set();

  // Resume support
  if (fs.existsSync(resumeFile)) {
    const prev = JSON.parse(fs.readFileSync(resumeFile, "utf-8"));
    for (const r of prev) {
      done.add(r.slug);
      results.push(r);
    }
    console.log(`Resuming: ${done.size} already done`);
  }

  const remaining = categories.filter((c) => !done.has(c.slug));
  console.log(
    `Generating ${remaining.length} images (${done.size} already done)...`,
  );

  for (let i = 0; i < remaining.length; i++) {
    const cat = remaining[i];
    console.log(`[${done.size + i + 1}/${categories.length}] ${cat.slug}...`);

    let imgBuf: Buffer | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        imgBuf = await generateImage(cat.prompt);
        if (imgBuf) break;
      } catch (err: any) {
        console.error(`  Attempt ${attempt} error: ${err.message}`);
      }
      if (attempt < 3) {
        console.log(`  Retrying in 5s... (attempt ${attempt + 1}/3)`);
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
    if (!imgBuf) {
      console.error(`  FAILED after 3 attempts: ${cat.slug}, skipping`);
      continue;
    }

    const localPath = `${tmpDir}/${cat.slug}.jpg`;
    fs.writeFileSync(localPath, imgBuf);
    console.log(`  Generated: ${(imgBuf.length / 1024).toFixed(0)}KB`);

    const r2Key = `categories/${cat.slug}-v3.jpg`;
    const publicUrl = uploadToR2(localPath, r2Key);
    console.log(`  Uploaded: ${publicUrl}`);

    results.push({ slug: cat.slug, url: publicUrl });
    fs.writeFileSync(resumeFile, JSON.stringify(results, null, 2));

    // Small delay to avoid rate limits
    if (i < remaining.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  // Generate SQL insert statements
  console.log(`\nDone! ${results.length} images generated.`);
  console.log("SQL file saved to /tmp/nanobananapro-v3.sql");

  const sqlLines = results.map((r) => {
    const id = `v3-${r.slug}`.slice(0, 21);
    return `INSERT OR IGNORE INTO category_images (id, category_id, image_url, label, is_active, created_at) VALUES ('${id}', (SELECT id FROM categories WHERE slug = '${r.slug}'), '${r.url}', 'v3', 0, '${new Date().toISOString()}');`;
  });
  fs.writeFileSync(
    "/tmp/nanobananapro-v3.sql",
    "PRAGMA foreign_keys=OFF;\n" + sqlLines.join("\n"),
  );
}

main().catch(console.error);
