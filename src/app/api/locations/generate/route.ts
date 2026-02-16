import { NextResponse } from "next/server";
import { generateContent } from "@/lib/ai";
import {
  getLocationPage,
  createLocationPage,
} from "@/lib/db/queries/locations";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    pageType,
    pageId,
    pageName,
    country,
    region,
    city,
    cityDisplay,
    regionDisplay,
    countryDisplay,
  } = body;

  if (!pageType || !pageId || !pageName || !country || !region || !city) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  // Check if already exists
  const existing = await getLocationPage(
    pageType,
    pageId,
    country,
    region,
    city,
  );
  if (existing) {
    return NextResponse.json({ location: existing });
  }

  try {
    // Pick the best available provider
    const provider = process.env.GOOGLE_AI_API_KEY
      ? "gemini"
      : process.env.ANTHROPIC_API_KEY
        ? "anthropic"
        : process.env.OPENAI_API_KEY
          ? "openai"
          : null;

    let blurb = `Find trusted ${pageName.toLowerCase()} professionals in ${cityDisplay}, ${regionDisplay}. Connect with local pros who know your area.`;

    if (provider) {
      try {
        const result = await generateContent({
          provider,
          prompt: `Write 2-3 concise sentences about ${pageName.toLowerCase()} services in ${cityDisplay}, ${regionDisplay}, ${countryDisplay}. Mention what local homeowners should know — like local demand, climate or regional factors that affect this service, and why hiring a local pro matters. Return ONLY a plain JSON object: { "blurb": "your text here" }. No markdown, no wrapping.`,
          sectionType: "content",
        });
        const parsed = JSON.parse(
          result.content
            .replace(/^```(?:json)?\n?/m, "")
            .replace(/\n?```$/m, "")
            .trim(),
        );
        if (parsed.blurb) blurb = parsed.blurb;
      } catch {
        // Use fallback blurb if AI fails
      }
    }

    // Geocode city to get lat/lng for map
    let mapUrl = "";
    let lat: string | undefined;
    let lon: string | undefined;
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${cityDisplay}, ${regionDisplay}, ${countryDisplay}`)}&format=json&limit=1`,
        { headers: { "User-Agent": "ProBuddy/1.0" } },
      );
      const geoData = await geoRes.json();
      if (geoData.length > 0) {
        lat = geoData[0].lat;
        lon = geoData[0].lon;
        const latN = parseFloat(lat!);
        const lonN = parseFloat(lon!);
        const offset = 0.05;
        const bbox = `${lonN - offset},${latN - offset},${lonN + offset},${latN + offset}`;
        mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
      }
    } catch {
      // Map is optional — continue without it
    }

    const id = await createLocationPage({
      pageType,
      pageId,
      country,
      region,
      city,
      cityDisplay,
      regionDisplay,
      countryDisplay,
      blurb,
      mapUrl,
      lat,
      lon,
    });

    const location = await getLocationPage(
      pageType,
      pageId,
      country,
      region,
      city,
    );
    return NextResponse.json({ location });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
