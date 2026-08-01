CREATE TABLE `asset_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`asset_type` varchar(20) NOT NULL,
	`asset_id` int NOT NULL,
	`activity` varchar(50) NOT NULL,
	`notes` text,
	`created_at` timestamp(0) NOT NULL DEFAULT (now()),
	CONSTRAINT `asset_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `controllers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`room_id` int,
	`asset_code` varchar(50) NOT NULL,
	`controller_number` varchar(50) NOT NULL,
	`condition` varchar(20) NOT NULL DEFAULT 'good',
	`status` varchar(20) NOT NULL DEFAULT 'ready',
	`notes` text,
	`created_at` timestamp(0) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(0) NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `controllers_id` PRIMARY KEY(`id`),
	CONSTRAINT `controllers_asset_code_unique` UNIQUE(`asset_code`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`phone` varchar(20),
	`address` text,
	`identity_number` varchar(30),
	`created_at` timestamp(0) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(0) NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `penalty_rates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hourly_penalty` decimal(12,0) NOT NULL DEFAULT '0',
	`updated_at` timestamp(0) NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `penalty_rates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `play_rates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`room_type` varchar(50) NOT NULL,
	`hourly_rate` decimal(12,0) NOT NULL DEFAULT '0',
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(0) NOT NULL DEFAULT (now()),
	CONSTRAINT `play_rates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playstations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`room_id` int,
	`asset_code` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`series` varchar(50),
	`brand` varchar(50),
	`serial_number` varchar(100),
	`purchase_date` date,
	`condition` varchar(20) NOT NULL DEFAULT 'good',
	`status` varchar(20) NOT NULL DEFAULT 'ready',
	`notes` text,
	`created_at` timestamp(0) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(0) NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playstations_id` PRIMARY KEY(`id`),
	CONSTRAINT `playstations_asset_code_unique` UNIQUE(`asset_code`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_code` varchar(50) NOT NULL,
	`category` varchar(20) NOT NULL,
	`name` varchar(100) NOT NULL,
	`price` decimal(12,0) NOT NULL DEFAULT '0',
	`stock` int NOT NULL DEFAULT 0,
	`minimum_stock` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(0) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(0) NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_product_code_unique` UNIQUE(`product_code`)
);
--> statement-breakpoint
CREATE TABLE `rental_packages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`duration_days` int NOT NULL,
	`price` decimal(12,0) NOT NULL DEFAULT '0',
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(0) NOT NULL DEFAULT (now()),
	CONSTRAINT `rental_packages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rentals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transaction_id` int NOT NULL,
	`playstation_id` int NOT NULL,
	`controller_id` int,
	`package_id` int,
	`rental_date` timestamp(0) NOT NULL,
	`due_date` timestamp(0) NOT NULL,
	`return_date` timestamp(0),
	`late_hours` decimal(10,2),
	`penalty_amount` decimal(14,0) NOT NULL DEFAULT '0',
	CONSTRAINT `rentals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`room_type` varchar(50) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'ready',
	`created_at` timestamp(0) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(0) NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `rooms_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`movement_type` varchar(20) NOT NULL,
	`qty` int NOT NULL,
	`stock_after` int NOT NULL,
	`reference` varchar(100),
	`notes` text,
	`created_by` int,
	`created_at` timestamp(0) NOT NULL DEFAULT (now()),
	CONSTRAINT `stock_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `televisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`room_id` int,
	`asset_code` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`size` varchar(20),
	`serial_number` varchar(100),
	`status` varchar(20) NOT NULL DEFAULT 'ready',
	`notes` text,
	`created_at` timestamp(0) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(0) NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `televisions_id` PRIMARY KEY(`id`),
	CONSTRAINT `televisions_asset_code_unique` UNIQUE(`asset_code`)
);
--> statement-breakpoint
CREATE TABLE `transaction_details` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transaction_id` int NOT NULL,
	`item_type` varchar(10) NOT NULL,
	`reference_id` int,
	`item_name` varchar(150) NOT NULL,
	`qty` decimal(10,2) NOT NULL DEFAULT '0',
	`unit` varchar(20),
	`unit_price` decimal(14,0) NOT NULL DEFAULT '0',
	`subtotal` decimal(14,0) NOT NULL DEFAULT '0',
	`notes` text,
	CONSTRAINT `transaction_details_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoice_number` varchar(30) NOT NULL,
	`transaction_type` varchar(10) NOT NULL,
	`customer_id` int,
	`room_id` int,
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`started_at` timestamp(0),
	`ended_at` timestamp(0),
	`duration_minutes` int,
	`subtotal` decimal(14,0) NOT NULL DEFAULT '0',
	`discount_type` varchar(10) NOT NULL DEFAULT 'none',
	`discount_value` decimal(12,0) NOT NULL DEFAULT '0',
	`discount_amount` decimal(12,0) NOT NULL DEFAULT '0',
	`grand_total` decimal(14,0) NOT NULL DEFAULT '0',
	`payment_method` varchar(10),
	`amount_paid` decimal(14,0) NOT NULL DEFAULT '0',
	`change_amount` decimal(14,0) NOT NULL DEFAULT '0',
	`notes` text,
	`created_by` int,
	`created_at` timestamp(0) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(0) NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_invoice_number_unique` UNIQUE(`invoice_number`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`username` varchar(50) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` varchar(20) NOT NULL DEFAULT 'cashier',
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(0) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(0) NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE INDEX `asset_logs_asset_idx` ON `asset_logs` (`asset_type`,`asset_id`);--> statement-breakpoint
CREATE INDEX `rentals_txn_idx` ON `rentals` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `stock_movements_product_idx` ON `stock_movements` (`product_id`);--> statement-breakpoint
CREATE INDEX `transaction_details_txn_idx` ON `transaction_details` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `transactions_type_status_idx` ON `transactions` (`transaction_type`,`status`);--> statement-breakpoint
CREATE INDEX `transactions_created_idx` ON `transactions` (`created_at`);