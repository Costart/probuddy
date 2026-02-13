import { nanoid } from "nanoid"
import { getDb } from "@/lib/db"
import { categories, subServices } from "@/lib/db/schema"

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

export async function seedDatabase() {
  const db = getDb()

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

    for (const sub of cat.subServices) {
      await db.insert(subServices).values({
        id: nanoid(),
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
    }
  }

  return { categories: SEED_DATA.length, subServices: SEED_DATA.reduce((acc, cat) => acc + cat.subServices.length, 0) }
}
