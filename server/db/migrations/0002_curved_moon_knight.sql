ALTER TABLE `rooms` DROP COLUMN `room_type`;--> statement-breakpoint
ALTER TABLE `rooms` ADD `play_rate_id` int;--> statement-breakpoint
ALTER TABLE `play_rates` DROP COLUMN `room_type`;--> statement-breakpoint
ALTER TABLE `rentals` MODIFY COLUMN `controller_id` varchar(255);