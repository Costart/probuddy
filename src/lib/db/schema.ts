import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").default(0),
  isPublished: integer("is_published", { mode: "boolean" }).default(false),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const subServices = sqliteTable("sub_services", {
  id: text("id").primaryKey(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  priceLow: integer("price_low"),
  priceHigh: integer("price_high"),
  durationEstimate: text("duration_estimate"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").default(0),
  thumbtackCategoryPk: text("thumbtack_category_pk"),
  isPublished: integer("is_published", { mode: "boolean" }).default(false),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const pageSections = sqliteTable("page_sections", {
  id: text("id").primaryKey(),
  pageType: text("page_type").notNull(),
  pageId: text("page_id").notNull(),
  sectionType: text("section_type").notNull(),
  content: text("content"),
  sortOrder: integer("sort_order").default(0),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export const aiConfigs = sqliteTable("ai_configs", {
  id: text("id").primaryKey(),
  sectionId: text("section_id")
    .notNull()
    .references(() => pageSections.id),
  provider: text("provider").notNull(),
  model: text("model"),
  prompt: text("prompt").notNull(),
  lastGeneratedAt: text("last_generated_at"),
});

export const locationPages = sqliteTable("location_pages", {
  id: text("id").primaryKey(),
  pageType: text("page_type").notNull(),
  pageId: text("page_id").notNull(),
  country: text("country").notNull(),
  region: text("region").notNull(),
  city: text("city").notNull(),
  cityDisplay: text("city_display").notNull(),
  regionDisplay: text("region_display").notNull(),
  countryDisplay: text("country_display").notNull(),
  blurb: text("blurb"),
  mapUrl: text("map_url"),
  lat: text("lat"),
  lon: text("lon"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

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
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const categoryImages = sqliteTable("category_images", {
  id: text("id").primaryKey(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  imageUrl: text("image_url").notNull(),
  label: text("label"),
  isActive: integer("is_active", { mode: "boolean" }).default(false),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const searchResults = sqliteTable(
  "search_results",
  {
    id: text("id").primaryKey(),
    zipCode: text("zip_code").notNull(),
    query: text("query").notNull(),
    categorySlug: text("category_slug"),
    thumbtackCategory: text("thumbtack_category"),
    thumbtackCategoryId: text("thumbtack_category_id"),
    requestLocation: text("request_location"),
    resultCount: integer("result_count").notNull(),
    searchedAt: text("searched_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    uniqueIndex("search_results_zip_category_idx").on(
      table.zipCode,
      table.categorySlug,
    ),
  ],
);
