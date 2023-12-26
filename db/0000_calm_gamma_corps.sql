CREATE TABLE `folders` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`position` real,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `snippet_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`snippet_id` text,
	`tag_text` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`snippet_id`) REFERENCES `snippets`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `snippets` (
	`id` text PRIMARY KEY NOT NULL,
	`folder_id` text,
	`name` text,
	`language` text,
	`encrypted` integer,
	`position` real,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`folder_id`) REFERENCES `folders`(`id`) ON UPDATE cascade ON DELETE cascade
);
