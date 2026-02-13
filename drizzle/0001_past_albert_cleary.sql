CREATE TABLE `ai_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`section_id` text NOT NULL,
	`provider` text NOT NULL,
	`model` text,
	`prompt` text NOT NULL,
	`last_generated_at` text,
	FOREIGN KEY (`section_id`) REFERENCES `page_sections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`image_url` text,
	`sort_order` integer DEFAULT 0,
	`is_published` integer DEFAULT false,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `lead_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`category_slug` text NOT NULL,
	`sub_service_slug` text,
	`name` text NOT NULL,
	`postal_code` text NOT NULL,
	`job_description` text,
	`detected_city` text,
	`detected_region` text,
	`handoff_status` text DEFAULT 'pending',
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `page_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`page_type` text NOT NULL,
	`page_id` text NOT NULL,
	`section_type` text NOT NULL,
	`content` text,
	`sort_order` integer DEFAULT 0,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `sub_services` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`price_low` integer,
	`price_high` integer,
	`duration_estimate` text,
	`image_url` text,
	`sort_order` integer DEFAULT 0,
	`is_published` integer DEFAULT false,
	`created_at` text NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
