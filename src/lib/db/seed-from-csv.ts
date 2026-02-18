/**
 * Seed script: reads Thumbtack CSV, generates SQL to insert categories + sub-services + page sections.
 * Includes ALL industries.
 *
 * Usage:
 *   npx tsx src/lib/db/seed-from-csv.ts
 *   npx wrangler d1 execute find-a-pro-db --file seed.sql --local
 *   npx wrangler d1 execute find-a-pro-db --file seed.sql --remote
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { nanoid } from "nanoid";

const CSV_PATH = resolve(
  process.env.HOME!,
  "Downloads/[Thumbtack] Category PKs - Extract 2 (3).csv",
);

// ---------------------------------------------------------------------------
// sub_industry → category mapping (names = trade person, not the service)
// ---------------------------------------------------------------------------
interface CategoryDef {
  name: string;
  slug: string;
}

const SUB_INDUSTRY_MAP: Record<string, CategoryDef> = {
  // Home Systems
  Electrical: { name: "Electrician", slug: "electrician" },
  "Garage Door Services": {
    name: "Garage Door Technician",
    slug: "garage-door-technician",
  },
  "Home Theater Systems": {
    name: "Home Theater Installer",
    slug: "home-theater-installer",
  },
  "Other: Home Systems": {
    name: "Home Systems Specialist",
    slug: "home-systems-specialist",
  },
  Welding: { name: "Welder", slug: "welder" },
  // Home Construction
  "Handyman Services": { name: "Handyman", slug: "handyman" },
  Roofing: { name: "Roofer", slug: "roofer" },
  Carpentry: { name: "Carpenter", slug: "carpenter" },
  "Concrete and Masonry": { name: "Mason", slug: "mason" },
  Flooring: { name: "Flooring Specialist", slug: "flooring-specialist" },
  "General Contracting": {
    name: "General Contractor",
    slug: "general-contractor",
  },
  "Windows and Doors": {
    name: "Window & Door Installer",
    slug: "window-door-installer",
  },
  "Architecture and Engineering Services": {
    name: "Architect",
    slug: "architect",
  },
  // Home Maintenance
  Cleaning: { name: "Cleaner", slug: "cleaner" },
  "Decorative Painting": { name: "Painter", slug: "painter" },
  "Home Inspection": { name: "Home Inspector", slug: "home-inspector" },
  "Home Security": { name: "Security Specialist", slug: "security-specialist" },
  "Interior Design": { name: "Interior Designer", slug: "interior-designer" },
  "Lawncare, Landscaping, and Fencing": {
    name: "Landscaper",
    slug: "landscaper",
  },
  "Other: Home Maintenance": {
    name: "Home Maintenance Specialist",
    slug: "home-maintenance-specialist",
  },
  "Outdoor Cleaning": { name: "Outdoor Cleaner", slug: "outdoor-cleaner" },
  Painting: { name: "Painter", slug: "painter" },
  "Pest Control": {
    name: "Pest Control Specialist",
    slug: "pest-control-specialist",
  },
  "Pool and Spa Services": {
    name: "Pool & Spa Specialist",
    slug: "pool-spa-specialist",
  },
  "Real Estate Services": {
    name: "Real Estate Professional",
    slug: "real-estate-professional",
  },
  "Remediation Services": {
    name: "Remediation Specialist",
    slug: "remediation-specialist",
  },
  // Events
  Beauty: { name: "Beautician", slug: "beautician" },
  Decorations: { name: "Event Decorator", slug: "event-decorator" },
  "Equipment Rentals": {
    name: "Equipment Rental Provider",
    slug: "equipment-rental-provider",
  },
  "Event Entertainment": { name: "Entertainer", slug: "entertainer" },
  "Event Staff": { name: "Event Staff Provider", slug: "event-staff-provider" },
  "Event Wait Staff": { name: "Bartender", slug: "bartender" },
  "Food Services": { name: "Caterer", slug: "caterer" },
  "Music Entertainment": { name: "DJ", slug: "dj" },
  "Photography & Videography": { name: "Photographer", slug: "photographer" },
  "Planning Services": { name: "Event Planner", slug: "event-planner" },
  Transportation: {
    name: "Transportation Provider",
    slug: "transportation-provider",
  },
  // Business Services
  "Accounting and Financial Services": {
    name: "Accountant",
    slug: "accountant",
  },
  "Computer and Device Maintenance": {
    name: "IT Specialist",
    slug: "it-specialist",
  },
  "Graphic Design": { name: "Graphic Designer", slug: "graphic-designer" },
  "Language Translation": { name: "Translator", slug: "translator" },
  "Legal Services": { name: "Attorney", slug: "attorney" },
  "Other: Business Services": {
    name: "Business Consultant",
    slug: "business-consultant",
  },
  "Sales & Marketing": {
    name: "Marketing Consultant",
    slug: "marketing-consultant",
  },
  "Security Services": {
    name: "Security Consultant",
    slug: "security-consultant",
  },
  "Software Development and Web Services": {
    name: "Web Developer",
    slug: "web-developer",
  },
  // Education
  "Academic Tutoring": { name: "Tutor", slug: "tutor" },
  Athletics: { name: "Sports Instructor", slug: "sports-instructor" },
  "Language Tutoring": { name: "Language Teacher", slug: "language-teacher" },
  "Music Lessons": { name: "Music Teacher", slug: "music-teacher" },
  "Other: Lessons": { name: "Instructor", slug: "instructor" },
  "Test Preparation": { name: "Test Prep Tutor", slug: "test-prep-tutor" },
  // Health and Wellness
  "Arts, Design, & Crafts": {
    name: "Arts & Crafts Instructor",
    slug: "arts-crafts-instructor",
  },
  Fitness: { name: "Fitness Instructor", slug: "fitness-instructor" },
  "Professional and Life Coaching": { name: "Life Coach", slug: "life-coach" },
  "Spiritual Healing": { name: "Spiritual Healer", slug: "spiritual-healer" },
  Wellness: { name: "Wellness Specialist", slug: "wellness-specialist" },
  // Moving
  Moving: { name: "Mover", slug: "mover" },
  // Pets
  "Animal Training": { name: "Animal Trainer", slug: "animal-trainer" },
  "Other: Pets": { name: "Pet Specialist", slug: "pet-specialist" },
  "Pet Care": { name: "Pet Caregiver", slug: "pet-caregiver" },
  "Pet Grooming": { name: "Pet Groomer", slug: "pet-groomer" },
};

// "Plumbing and HVAC" is split by occupation
const PLUMBING_HVAC_BY_OCCUPATION: Record<string, CategoryDef> = {
  Plumber: { name: "Plumber", slug: "plumber" },
  "HVAC Specialist": { name: "HVAC Technician", slug: "hvac-technician" },
  "Inspector and Restorer": {
    name: "Home Systems Specialist",
    slug: "home-systems-specialist",
  },
  "Insulation Installer": {
    name: "General Contractor",
    slug: "general-contractor",
  },
  Handyman: { name: "Handyman", slug: "handyman" },
  Landscaper: {
    name: "Home Systems Specialist",
    slug: "home-systems-specialist",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function esc(s: string): string {
  return s.replace(/'/g, "''");
}

function parseCSV(text: string): Record<string, string>[] {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const char of text) {
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === "\n" && !inQuotes) {
      lines.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) lines.push(current);
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] || ""));
    return row;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function resolveCategory(row: Record<string, string>): CategoryDef | null {
  const subIndustry = row.sub_industry;
  if (subIndustry === "Plumbing and HVAC") {
    return (
      PLUMBING_HVAC_BY_OCCUPATION[row.occupation] || {
        name: "Plumber",
        slug: "plumber",
      }
    );
  }
  return SUB_INDUSTRY_MAP[subIndustry] || null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const csv = readFileSync(CSV_PATH, "utf-8");
  const rows = parseCSV(csv);
  console.log(`Total CSV rows: ${rows.length}`);

  const categoryMap = new Map<string, { def: CategoryDef; id: string }>();
  const subServiceEntries: {
    row: Record<string, string>;
    categorySlug: string;
  }[] = [];
  const sectionTypes = ["content", "faq", "pricing", "tips", "questions"];
  let skipped = 0;

  for (const row of rows) {
    const cat = resolveCategory(row);
    if (!cat) {
      console.warn(
        `  SKIP: no mapping for sub_industry="${row.sub_industry}" name="${row.name}"`,
      );
      skipped++;
      continue;
    }
    if (!categoryMap.has(cat.slug)) {
      categoryMap.set(cat.slug, { def: cat, id: nanoid() });
    }
    subServiceEntries.push({ row, categorySlug: cat.slug });
  }

  console.log(`Categories: ${categoryMap.size}`);
  console.log(`Sub-services: ${subServiceEntries.length}`);
  if (skipped) console.log(`Skipped: ${skipped}`);

  const sql: string[] = [];
  const now = new Date().toISOString();

  let catSortOrder = 100;
  for (const [slug, { def, id }] of categoryMap) {
    sql.push(
      `INSERT OR IGNORE INTO categories (id, slug, name, sort_order, is_published, created_at) VALUES ('${id}', '${esc(slug)}', '${esc(def.name)}', ${catSortOrder++}, 1, '${now}');`,
    );
    for (let i = 0; i < sectionTypes.length; i++) {
      const sectionId = nanoid();
      sql.push(
        `INSERT OR IGNORE INTO page_sections (id, page_type, page_id, section_type, sort_order, updated_at) SELECT '${sectionId}', 'category', id, '${sectionTypes[i]}', ${i}, '${now}' FROM categories WHERE slug = '${esc(slug)}' AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_type = 'category' AND page_id = (SELECT id FROM categories WHERE slug = '${esc(slug)}') AND section_type = '${sectionTypes[i]}');`,
      );
    }
  }

  let subSortOrder = 200;
  for (const { row, categorySlug } of subServiceEntries) {
    const subId = nanoid();
    const subSlug = slugify(row.name);
    const categoryPk = row.category_pk;
    sql.push(
      `INSERT OR IGNORE INTO sub_services (id, category_id, slug, name, thumbtack_category_pk, sort_order, is_published, created_at) SELECT '${subId}', id, '${esc(subSlug)}', '${esc(row.name)}', '${esc(categoryPk)}', ${subSortOrder++}, 1, '${now}' FROM categories WHERE slug = '${esc(categorySlug)}';`,
    );
    for (let i = 0; i < sectionTypes.length; i++) {
      const sectionId = nanoid();
      sql.push(
        `INSERT OR IGNORE INTO page_sections (id, page_type, page_id, section_type, sort_order, updated_at) SELECT '${sectionId}', 'sub_service', ss.id, '${sectionTypes[i]}', ${i}, '${now}' FROM sub_services ss JOIN categories c ON ss.category_id = c.id WHERE ss.slug = '${esc(subSlug)}' AND c.slug = '${esc(categorySlug)}' AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_type = 'sub_service' AND page_id = ss.id AND section_type = '${sectionTypes[i]}');`,
      );
    }
  }

  const outPath = resolve(__dirname, "../../../seed.sql");
  writeFileSync(outPath, sql.join("\n") + "\n");
  console.log(`\nWrote ${sql.length} SQL statements to ${outPath}`);
}

main();
