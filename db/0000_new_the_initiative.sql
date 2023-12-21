CREATE TABLE `snippets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`language` text,
	`encrypted` integer,
	`position` real,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
