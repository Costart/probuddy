import type { GenerateRequest, GenerateResult } from "./index"

export async function generateWithReplicate(req: GenerateRequest): Promise<GenerateResult> {
  const apiToken = process.env.REPLICATE_API_TOKEN
  if (!apiToken) throw new Error("REPLICATE_API_TOKEN not set")

  const model = req.model || "black-forest-labs/flux-schnell"

  // Create prediction
  const createRes = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: { prompt: req.prompt },
    }),
  })
  const prediction = await createRes.json() as { id: string; urls: { get: string } }

  // Poll for result (max 60 seconds)
  const getUrl = prediction.urls?.get
  if (!getUrl) throw new Error("No prediction URL returned")

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000))
    const pollRes = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${apiToken}` },
    })
    const result = await pollRes.json() as { status: string; output: string[] | string }
    if (result.status === "succeeded") {
      const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output
      return {
        content: JSON.stringify({
          src: imageUrl,
          alt: req.prompt,
          caption: "",
        }),
      }
    }
    if (result.status === "failed") {
      throw new Error("Image generation failed")
    }
  }

  throw new Error("Image generation timed out")
}
