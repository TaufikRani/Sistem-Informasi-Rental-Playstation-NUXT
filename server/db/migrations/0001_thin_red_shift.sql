ALTER TABLE `rental_packages` MODIFY COLUMN `duration_days` decimal(6,1) NOT NULL DEFAULT '1';--> statement-breakpoint
ALTER TABLE `penalty_rates` DROP COLUMN `hourly_penalty`;--> statement-breakpoint
ALTER TABLE `penalty_rates` ADD `name` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `penalty_rates` ADD `type` varchar(20) NOT NULL DEFAULT 'hourly';--> statement-breakpoint
ALTER TABLE `penalty_rates` ADD `amount` decimal(12,0) NOT NULL DEFAULT '0';--> statement-breakpoint
ALTER TABLE `penalty_rates` ADD `is_active` boolean NOT NULL DEFAULT true;--> statement-breakpoint
ALTER TABLE `penalty_rates` ADD `created_at` timestamp(0) NOT NULL DEFAULT (now());