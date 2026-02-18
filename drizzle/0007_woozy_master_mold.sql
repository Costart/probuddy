CREATE TABLE `category_images` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`image_url` text NOT NULL,
	`label` text,
	`is_active` integer DEFAULT false,
	`created_at` text NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
