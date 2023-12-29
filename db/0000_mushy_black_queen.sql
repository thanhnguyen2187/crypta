CREATE TABLE `folders` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`position` real DEFAULT 1 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `snippet_tags` (
	`snippet_id` text NOT NULL,
	`tag_text` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`snippet_id`, `tag_text`),
	FOREIGN KEY (`snippet_id`) REFERENCES `snippets`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `snippets` (
	`id` text PRIMARY KEY NOT NULL,
	`folder_id` text,
	`name` text NOT NULL,
	`language` text NOT NULL,
	`text` text NOT NULL,
	`encrypted` integer DEFAULT false NOT NULL,
	`position` real DEFAULT 1 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`folder_id`) REFERENCES `folders`(`id`) ON UPDATE cascade ON DELETE cascade
);
