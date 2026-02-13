import { nanoid } from "nanoid"
import { getDb } from "@/lib/db"
import { categories, subServices, pageSections } from "@/lib/db/schema"

const SEED_DATA = [
  {
    name: "Plumber",
    slug: "plumber",
    description: "From leaky faucets to full bathroom remodels, find a licensed plumber for any job.",
    subServices: [
      { name: "Leak Repair", slug: "leak-repair", description: "Fix dripping taps, pipes, and water leaks.", priceLow: 7500, priceHigh: 30000, duration: "1-3 hours" },
      { name: "Drain Cleaning", slug: "drain-cleaning", description: "Clear blocked drains and prevent future clogs.", priceLow: 10000, priceHigh: 35000, duration: "1-2 hours" },
      { name: "Water Heater Installation", slug: "water-heater-installation", description: "Install or replace tank and tankless water heaters.", priceLow: 80000, priceHigh: 250000, duration: "4-8 hours" },
      { name: "Bathroom Remodel", slug: "bathroom-remodel", description: "Complete bathroom renovation including plumbing.", priceLow: 500000, priceHigh: 2500000, duration: "1-3 weeks" },
      { name: "Toilet Repair", slug: "toilet-repair", description: "Fix running toilets, clogs, and replacement.", priceLow: 10000, priceHigh: 40000, duration: "1-2 hours" },
    ],
  },
  {
    name: "Electrician",
    slug: "electrician",
    description: "Licensed electricians for safe, reliable electrical work in your home.",
    subServices: [
      { name: "Outlet Installation", slug: "outlet-installation", description: "Add new outlets or replace old ones.", priceLow: 10000, priceHigh: 25000, duration: "1-2 hours" },
      { name: "Lighting Installation", slug: "lighting-installation", description: "Install ceiling lights, recessed lighting, and fixtures.", priceLow: 15000, priceHigh: 50000, duration: "2-4 hours" },
      { name: "Panel Upgrade", slug: "panel-upgrade", description: "Upgrade your electrical panel for more capacity and safety.", priceLow: 100000, priceHigh: 300000, duration: "4-8 hours" },
      { name: "Wiring Repair", slug: "wiring-repair", description: "Diagnose and fix electrical wiring issues.", priceLow: 15000, priceHigh: 40000, duration: "2-4 hours" },
    ],
  },
  {
    name: "Roofer",
    slug: "roofer",
    description: "Protect your home with expert roofing repair, replacement, and maintenance.",
    subServices: [
      { name: "Tile Repair", slug: "tile-repair", description: "Replace broken or missing roof tiles.", priceLow: 20000, priceHigh: 60000, duration: "2-4 hours" },
      { name: "Gutter Cleaning", slug: "gutter-cleaning", description: "Clean and maintain gutters to prevent water damage.", priceLow: 10000, priceHigh: 25000, duration: "1-3 hours" },
      { name: "Flat Roof Repair", slug: "flat-roof-repair", description: "Patch leaks and repair flat roof membranes.", priceLow: 30000, priceHigh: 100000, duration: "4-8 hours" },
      { name: "Full Roof Replacement", slug: "full-roof-replacement", description: "Complete tear-off and replacement of your roof.", priceLow: 500000, priceHigh: 1500000, duration: "2-5 days" },
    ],
  },
  {
    name: "Handyman",
    slug: "handyman",
    description: "Versatile professionals for everyday home repairs and improvements.",
    subServices: [
      { name: "Shelf Installation", slug: "shelf-installation", description: "Mount shelves, bookcases, and wall storage.", priceLow: 7500, priceHigh: 20000, duration: "1-2 hours" },
      { name: "Furniture Assembly", slug: "furniture-assembly", description: "Assemble flat-pack furniture and fixtures.", priceLow: 5000, priceHigh: 15000, duration: "1-3 hours" },
      { name: "Door Repair", slug: "door-repair", description: "Fix squeaky, sticking, or damaged doors.", priceLow: 7500, priceHigh: 25000, duration: "1-2 hours" },
      { name: "Drywall Repair", slug: "drywall-repair", description: "Patch holes and repair damaged drywall.", priceLow: 10000, priceHigh: 35000, duration: "2-4 hours" },
      { name: "Gutter Repair", slug: "gutter-repair", description: "Fix leaks, reattach, and maintain gutters.", priceLow: 10000, priceHigh: 30000, duration: "1-3 hours" },
    ],
  },
  {
    name: "Painter",
    slug: "painter",
    description: "Professional interior and exterior painting to transform your space.",
    subServices: [
      { name: "Interior Painting", slug: "interior-painting", description: "Paint walls, ceilings, and trim inside your home.", priceLow: 30000, priceHigh: 150000, duration: "1-3 days" },
      { name: "Exterior Painting", slug: "exterior-painting", description: "Refresh your home\\'s exterior with quality paint.", priceLow: 150000, priceHigh: 500000, duration: "2-5 days" },
      { name: "Cabinet Painting", slug: "cabinet-painting", description: "Repaint kitchen and bathroom cabinets.", priceLow: 100000, priceHigh: 300000, duration: "3-5 days" },
      { name: "Deck Staining", slug: "deck-staining", description: "Stain and seal your deck for protection and beauty.", priceLow: 30000, priceHigh: 100000, duration: "1-2 days" },
    ],
  },
  {
    name: "HVAC Technician",
    slug: "hvac-technician",
    description: "Keep your home comfortable with expert heating and cooling services.",
    subServices: [
      { name: "AC Repair", slug: "ac-repair", description: "Diagnose and repair air conditioning issues.", priceLow: 15000, priceHigh: 60000, duration: "1-3 hours" },
      { name: "Furnace Repair", slug: "furnace-repair", description: "Fix heating system problems and restore warmth.", priceLow: 15000, priceHigh: 50000, duration: "1-3 hours" },
      { name: "HVAC Installation", slug: "hvac-installation", description: "Install new heating and cooling systems.", priceLow: 300000, priceHigh: 1000000, duration: "1-3 days" },
      { name: "Duct Cleaning", slug: "duct-cleaning", description: "Clean air ducts for better air quality and efficiency.", priceLow: 30000, priceHigh: 60000, duration: "3-5 hours" },
    ],
  },
]

function makeCategorySections(categoryId: string, cat: typeof SEED_DATA[0]) {
  return [
    {
      id: nanoid(),
      pageType: "category",
      pageId: categoryId,
      sectionType: "content",
      content: JSON.stringify({
        title: `About ${cat.name} Services`,
        text: `Finding a reliable ${cat.name.toLowerCase()} can be stressful. At ProBuddy, we connect you with vetted, licensed professionals who deliver quality work at fair prices.

Whether it\'s a small repair or a major project, our network of ${cat.name.toLowerCase()}s are ready to help. Every pro in our network is background-checked, insured, and rated by real customers.`,
      }),
      sortOrder: 0,
    },
    {
      id: nanoid(),
      pageType: "category",
      pageId: categoryId,
      sectionType: "faq",
      content: JSON.stringify({
        title: `Common ${cat.name} Questions`,
        items: [
          { question: `How much does a ${cat.name.toLowerCase()} cost?`, answer: `Costs vary depending on the job. Minor repairs typically range from 5-00, while larger projects can cost ,000 or more. Get a free quote to get an accurate estimate for your specific needs.` },
          { question: "How do I know if a pro is qualified?", answer: "All professionals in our network are licensed, insured, and background-checked. We also verify customer reviews and ratings to ensure quality work." },
          { question: "How quickly can I get someone out?", answer: "Many of our pros offer same-day or next-day service for urgent issues. For scheduled work, you can typically book within a few days." },
          { question: "What if I\'m not satisfied with the work?", answer: "We stand behind the quality of our pros. If you\'re not satisfied, contact us and we\'ll work to make it right, including sending another pro if needed." },
        ],
      }),
      sortOrder: 1,
    },
    {
      id: nanoid(),
      pageType: "category",
      pageId: categoryId,
      sectionType: "pricing",
      content: JSON.stringify({
        title: `${cat.name} Pricing Guide`,
        items: cat.subServices.map((s) => ({
          name: s.name,
          priceLow: s.priceLow,
          priceHigh: s.priceHigh,
          note: s.duration,
        })),
        disclaimer: "Prices are estimates and may vary based on location, complexity, and materials. Get a free quote for an accurate price.",
      }),
      sortOrder: 2,
    },
    {
      id: nanoid(),
      pageType: "category",
      pageId: categoryId,
      sectionType: "tips",
      content: JSON.stringify({
        title: `Tips for Hiring a ${cat.name}`,
        tips: [
          "Always get at least 2-3 quotes before committing to a pro.",
          "Ask for references and check online reviews from past customers.",
          "Verify that the pro is licensed and insured for your area.",
          "Get a written estimate that includes materials, labor, and timeline.",
          "Don\'t always go with the cheapest option — quality and reliability matter.",
        ],
      }),
      sortOrder: 3,
    },
    {
      id: nanoid(),
      pageType: "category",
      pageId: categoryId,
      sectionType: "questions",
      content: JSON.stringify({
        title: `Questions to Ask Your ${cat.name}`,
        questions: [
          "Are you licensed and insured?",
          "How long have you been doing this type of work?",
          "Can you provide references from recent jobs?",
          "What is included in your estimate?",
          "What is your warranty or guarantee policy?",
          "How long will the project take?",
          "Will you handle permits if needed?",
        ],
      }),
      sortOrder: 4,
    },
  ]
}

function makeSubServiceSections(subId: string, sub: typeof SEED_DATA[0]["subServices"][0], catName: string) {
  return [
    {
      id: nanoid(),
      pageType: "sub_service",
      pageId: subId,
      sectionType: "content",
      content: JSON.stringify({
        title: `What to Expect with ${sub.name}`,
        text: `${sub.description}

Our vetted ${catName.toLowerCase()}s will assess your needs, provide a clear estimate, and complete the work to the highest standards. Most ${sub.name.toLowerCase()} jobs take ${sub.duration} to complete.`,
      }),
      sortOrder: 0,
    },
    {
      id: nanoid(),
      pageType: "sub_service",
      pageId: subId,
      sectionType: "tips",
      content: JSON.stringify({
        title: `${sub.name} Tips`,
        tips: [
          `Get a detailed written quote before work begins on your ${sub.name.toLowerCase()} project.`,
          "Ask about warranties on both parts and labor.",
          "Clear the work area before the pro arrives to save time and money.",
          "Take photos of the area before work begins for your records.",
        ],
      }),
      sortOrder: 1,
    },
  ]
}

export async function seedDatabase() {
  const db = getDb()
  let sectionCount = 0

  for (const cat of SEED_DATA) {
    const categoryId = nanoid()
    await db.insert(categories).values({
      id: categoryId,
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      sortOrder: SEED_DATA.indexOf(cat),
      isPublished: true,
    })

    // Add sections for the category page
    const catSections = makeCategorySections(categoryId, cat)
    for (const section of catSections) {
      await db.insert(pageSections).values(section)
      sectionCount++
    }

    for (const sub of cat.subServices) {
      const subId = nanoid()
      await db.insert(subServices).values({
        id: subId,
        categoryId,
        slug: sub.slug,
        name: sub.name,
        description: sub.description,
        priceLow: sub.priceLow,
        priceHigh: sub.priceHigh,
        durationEstimate: sub.duration,
        sortOrder: cat.subServices.indexOf(sub),
        isPublished: true,
      })

      // Add sections for each sub-service page
      const subSections = makeSubServiceSections(subId, sub, cat.name)
      for (const section of subSections) {
        await db.insert(pageSections).values(section)
        sectionCount++
      }
    }
  }

  return {
    categories: SEED_DATA.length,
    subServices: SEED_DATA.reduce((acc, cat) => acc + cat.subServices.length, 0),
    sections: sectionCount,
  }
}
