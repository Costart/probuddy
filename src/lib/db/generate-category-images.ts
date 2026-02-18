import * as fs from "fs";
import * as path from "path";

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

const TOKEN = getVar("REPLICATE_API_TOKEN");

interface DescriptionEntry {
  slug: string;
  category: string;
  subservice: string;
  description: string;
  fullPrompt: string;
}

interface ImageResult {
  slug: string;
  category: string;
  imageUrl: string;
  prompt: string;
}

async function generateImage(prompt: string): Promise<string> {
  const createRes = await fetch(
    "https://api.replicate.com/v1/models/black-forest-labs/flux-pro/predictions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: { prompt, aspect_ratio: "3:2" } }),
    },
  );
  const prediction = (await createRes.json()) as {
    id: string;
    urls: { get: string };
    detail?: string;
    error?: string;
  };

  if (prediction.detail) throw new Error(`API error: ${prediction.detail}`);
  if (prediction.error) throw new Error(`API error: ${prediction.error}`);
  const getUrl = prediction.urls?.get;
  if (!getUrl) throw new Error("No prediction URL returned");

  // Poll for result (max 120 seconds)
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const pollRes = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const result = (await pollRes.json()) as {
      status: string;
      output: string[] | string;
      error?: string;
    };
    if (result.status === "succeeded") {
      return Array.isArray(result.output) ? result.output[0] : result.output;
    }
    if (result.status === "failed") {
      throw new Error(`Generation failed: ${result.error || "unknown error"}`);
    }
    process.stdout.write(".");
  }
  throw new Error("Timed out waiting for image");
}

async function main() {
  // Load descriptions
  const descriptionsPath = "/tmp/category-descriptions.json";
  if (!fs.existsSync(descriptionsPath)) {
    console.error("Run generate-image-descriptions.ts first!");
    process.exit(1);
  }
  const descriptions: DescriptionEntry[] = JSON.parse(
    fs.readFileSync(descriptionsPath, "utf-8"),
  );

  // Load existing results for resume support
  const resultsPath = "/tmp/category-images.json";
  let results: ImageResult[] = [];
  if (fs.existsSync(resultsPath)) {
    results = JSON.parse(fs.readFileSync(resultsPath, "utf-8"));
  }
  const doneSet = new Set(results.map((r) => r.slug));

  const remaining = descriptions.filter((d) => !doneSet.has(d.slug));
  console.log(
    `=== Generating ${remaining.length} images with Flux Pro (${doneSet.size} already done) ===\n`,
  );

  for (let i = 0; i < remaining.length; i++) {
    const entry = remaining[i];
    console.log(`[${i + 1}/${remaining.length}] ${entry.category}`);
    process.stdout.write("  Generating");

    // Rate limit: 6 req/min with <$5 credit, so wait 12s between requests
    if (i > 0) {
      process.stdout.write(" (waiting 12s)");
      await new Promise((r) => setTimeout(r, 12000));
    }

    try {
      const imageUrl = await generateImage(entry.fullPrompt);
      results.push({
        slug: entry.slug,
        category: entry.category,
        imageUrl,
        prompt: entry.fullPrompt,
      });
      console.log(` ✓ ${imageUrl}`);

      // Save after each success for resume support
      fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    } catch (err) {
      console.log(` ✗ ${(err as Error).message}`);
    }
  }

  // Print SQL statements
  console.log(`\n=== SQL UPDATE statements (${results.length} images) ===\n`);
  for (const r of results) {
    const escaped = r.imageUrl.replace(/'/g, "''");
    console.log(
      `UPDATE categories SET image_url = '${escaped}' WHERE slug = '${r.slug}';`,
    );
  }

  console.log(
    `\n=== Done! ${results.length}/${descriptions.length} images generated ===`,
  );
  console.log(`Results saved to ${resultsPath}`);
}

main();
