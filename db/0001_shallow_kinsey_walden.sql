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
ALTER TABLE snippets ADD `folder_id` text REFERENCES folders(id);--> statement-breakpoint
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/