import * as fs from "fs";
import * as path from "path";

// Read REPLICATE_API_TOKEN from .dev.vars or env
function getToken(): string {
  if (process.env.REPLICATE_API_TOKEN) return process.env.REPLICATE_API_TOKEN;
  try {
    const devVars = fs.readFileSync(
      path.join(process.cwd(), ".dev.vars"),
      "utf-8",
    );
    const match = devVars.match(/REPLICATE_API_TOKEN\s*=\s*(.+)/);
    if (match) return match[1].trim();
  } catch {}
  throw new Error("REPLICATE_API_TOKEN not found in .dev.vars or environment");
}

const TOKEN = getToken();

const tests = [
  {
    model: "black-forest-labs/flux-schnell",
    label: "Flux Schnell (~$0.003)",
    category: "Plumber",
    subservice: "toilet repair",
  },
  {
    model: "black-forest-labs/flux-dev",
    label: "Flux Dev (~$0.025)",
    category: "Electrician",
    subservice: "lighting installation",
  },
  {
    model: "black-forest-labs/flux-pro",
    label: "Flux Pro (~$0.05)",
    category: "Roofer",
    subservice: "roof repair or maintenance",
  },
];

async function generateImage(model: string, prompt: string): Promise<string> {
  // Use model-specific endpoint: /v1/models/{owner}/{name}/predictions
  const createRes = await fetch(
    `https://api.replicate.com/v1/models/${model}/predictions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: { prompt },
      }),
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
  console.log("=== AI Image Generation Test: 3 Flux Models ===\n");

  for (const test of tests) {
    const prompt = `Professional ${test.category} at work doing ${test.subservice}, clean modern photography style, realistic, high quality`;
    console.log(`\n--- ${test.label} ---`);
    console.log(`Category: ${test.category}`);
    console.log(`Prompt: "${prompt}"`);
    process.stdout.write("Generating");

    try {
      const url = await generateImage(test.model, prompt);
      console.log(`\n✓ Image URL: ${url}\n`);
    } catch (err) {
      console.log(`\n✗ Error: ${(err as Error).message}\n`);
    }
  }

  console.log("=== Done! Compare the URLs above in your browser ===");
}

main();
