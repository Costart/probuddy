import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
})

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").default(0),
  isPublished: integer("is_published", { mode: "boolean" }).default(false),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
})

export const subServices = sqliteTable("sub_services", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").notNull().references(() => categories.id),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  priceLow: integer("price_low"),
  priceHigh: integer("price_high"),
  durationEstimate: text("duration_estimate"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").default(0),
  isPublished: integer("is_published", { mode: "boolean" }).default(false),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
})

export const pageSections = sqliteTable("page_sections", {
  id: text("id").primaryKey(),
  pageType: text("page_type").notNull(),
  pageId: text("page_id").notNull(),
  sectionType: text("section_type").notNull(),
  content: text("content"),
  sortOrder: integer("sort_order").default(0),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
})

export const aiConfigs = sqliteTable("ai_configs", {
  id: text("id").primaryKey(),
  sectionId: text("section_id").notNull().references(() => pageSections.id),
  provider: text("provider").notNull(),
  model: text("model"),
  prompt: text("prompt").notNull(),
  lastGeneratedAt: text("last_generated_at"),
})

export const leadSubmissions = sqliteTable("lead_submissions", {
  id: text("id").primaryKey(),
  categorySlug: text("category_slug").notNull(),
  subServiceSlug: text("sub_service_slug"),
  name: text("name").notNull(),
  postalCode: text("postal_code").notNull(),
  jobDescription: text("job_description"),
  detectedCity: text("detected_city"),
  detectedRegion: text("detected_region"),
  handoffStatus: text("handoff_status").default("pending"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
})
