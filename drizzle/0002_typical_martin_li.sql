CREATE TABLE `location_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`page_type` text NOT NULL,
	`page_id` text NOT NULL,
	`country` text NOT NULL,
	`region` text NOT NULL,
	`city` text NOT NULL,
	`city_display` text NOT NULL,
	`region_display` text NOT NULL,
	`country_display` text NOT NULL,
	`blurb` text,
	`map_url` text,
	`created_at` text NOT NULL
);
