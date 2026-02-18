CREATE TABLE `search_results` (
	`id` text PRIMARY KEY NOT NULL,
	`zip_code` text NOT NULL,
	`query` text NOT NULL,
	`category_slug` text,
	`thumbtack_category` text,
	`result_count` integer NOT NULL,
	`searched_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `search_results_zip_category_idx` ON `search_results` (`zip_code`,`category_slug`);