CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET=utf8mb4;

START TRANSACTION;

ALTER DATABASE CHARACTER SET utf8mb4;

CREATE TABLE `Contacts` (
    `contact_id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `email` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `subject` varchar(200) CHARACTER SET utf8mb4 NOT NULL,
    `message` varchar(2000) CHARACTER SET utf8mb4 NOT NULL,
    `created_at` datetime(6) NOT NULL,
    `is_read` tinyint(1) NOT NULL,
    CONSTRAINT `PK_Contacts` PRIMARY KEY (`contact_id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Roles` (
    `role_id` int NOT NULL AUTO_INCREMENT,
    `role_name` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_Roles` PRIMARY KEY (`role_id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Users` (
    `user_id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `email` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `password` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `role_id` int NOT NULL,
    `phone` varchar(15) CHARACTER SET utf8mb4 NOT NULL,
    `address` varchar(500) CHARACTER SET utf8mb4 NOT NULL,
    `city` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `status` varchar(10) CHARACTER SET utf8mb4 NOT NULL,
    `created_at` datetime NOT NULL,
    CONSTRAINT `PK_Users` PRIMARY KEY (`user_id`),
    CONSTRAINT `FK_Users_Roles_role_id` FOREIGN KEY (`role_id`) REFERENCES `Roles` (`role_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `Admins` (
    `admin_id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    CONSTRAINT `PK_Admins` PRIMARY KEY (`admin_id`),
    CONSTRAINT `FK_Admins_Users_user_id` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `BusinessDetails` (
    `business_id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `business_type` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `pickup_frequency` varchar(10) CHARACTER SET utf8mb4 NOT NULL,
    `sustainability_score` int NOT NULL,
    `payment_enabled` tinyint(1) NOT NULL,
    CONSTRAINT `PK_BusinessDetails` PRIMARY KEY (`business_id`),
    CONSTRAINT `FK_BusinessDetails_Users_user_id` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `Collectors` (
    `collector_id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `status` varchar(10) CHARACTER SET utf8mb4 NOT NULL,
    `current_lat` decimal(9,6) NULL,
    `current_lng` decimal(9,6) NULL,
    CONSTRAINT `PK_Collectors` PRIMARY KEY (`collector_id`),
    CONSTRAINT `FK_Collectors_Users_user_id` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `EcoRewards` (
    `reward_id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `points_earned` int NOT NULL,
    `reward_type` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `earned_on` datetime(6) NOT NULL,
    CONSTRAINT `PK_EcoRewards` PRIMARY KEY (`reward_id`),
    CONSTRAINT `FK_EcoRewards_Users_user_id` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `HouseholdDetails` (
    `household_id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `total_waste_kg` decimal(65,30) NOT NULL,
    `eco_points` int NOT NULL,
    `leaderboard_rank` int NOT NULL,
    CONSTRAINT `PK_HouseholdDetails` PRIMARY KEY (`household_id`),
    CONSTRAINT `FK_HouseholdDetails_Users_user_id` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `Leaderboard` (
    `leaderboard_id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `month` int NOT NULL,
    `total_waste` decimal(65,30) NOT NULL,
    `rank` int NOT NULL,
    CONSTRAINT `PK_Leaderboard` PRIMARY KEY (`leaderboard_id`),
    CONSTRAINT `FK_Leaderboard_Users_user_id` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `NGOs` (
    `ngo_id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `city` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_NGOs` PRIMARY KEY (`ngo_id`),
    CONSTRAINT `FK_NGOs_Users_user_id` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `Payments` (
    `payment_id` int NOT NULL AUTO_INCREMENT,
    `business_id` int NOT NULL,
    `amount` decimal(65,30) NOT NULL,
    `payment_mode` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `payment_status` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `payment_date` datetime(6) NOT NULL,
    CONSTRAINT `PK_Payments` PRIMARY KEY (`payment_id`),
    CONSTRAINT `FK_Payments_BusinessDetails_business_id` FOREIGN KEY (`business_id`) REFERENCES `BusinessDetails` (`business_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `PickupRequests` (
    `pickup_id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `collector_id` int NULL,
    `waste_type` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `scheduled_date` date NOT NULL,
    `scheduled_time` time(6) NOT NULL,
    `pickup_status` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `created_at` datetime(6) NOT NULL,
    CONSTRAINT `PK_PickupRequests` PRIMARY KEY (`pickup_id`),
    CONSTRAINT `FK_PickupRequests_Collectors_collector_id` FOREIGN KEY (`collector_id`) REFERENCES `Collectors` (`collector_id`),
    CONSTRAINT `FK_PickupRequests_Users_user_id` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `NGOReports` (
    `report_id` int NOT NULL AUTO_INCREMENT,
    `ngo_id` int NOT NULL,
    `total_waste` decimal(65,30) NOT NULL,
    `carbon_saved` decimal(65,30) NOT NULL,
    `generated_on` datetime(6) NOT NULL,
    CONSTRAINT `PK_NGOReports` PRIMARY KEY (`report_id`),
    CONSTRAINT `FK_NGOReports_NGOs_ngo_id` FOREIGN KEY (`ngo_id`) REFERENCES `NGOs` (`ngo_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `TrackingLogs` (
    `track_id` int NOT NULL AUTO_INCREMENT,
    `pickup_id` int NOT NULL,
    `latitude` decimal(65,30) NOT NULL,
    `longitude` decimal(65,30) NOT NULL,
    `timestamp` datetime(6) NOT NULL,
    CONSTRAINT `PK_TrackingLogs` PRIMARY KEY (`track_id`),
    CONSTRAINT `FK_TrackingLogs_PickupRequests_pickup_id` FOREIGN KEY (`pickup_id`) REFERENCES `PickupRequests` (`pickup_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `WasteLogs` (
    `log_id` int NOT NULL AUTO_INCREMENT,
    `pickup_id` int NOT NULL,
    `waste_type` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `weight_kg` decimal(65,30) NOT NULL,
    `collected_at` datetime(6) NOT NULL,
    `photo_url` varchar(500) CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_WasteLogs` PRIMARY KEY (`log_id`),
    CONSTRAINT `FK_WasteLogs_PickupRequests_pickup_id` FOREIGN KEY (`pickup_id`) REFERENCES `PickupRequests` (`pickup_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE UNIQUE INDEX `IX_Admins_user_id` ON `Admins` (`user_id`);

CREATE UNIQUE INDEX `IX_BusinessDetails_user_id` ON `BusinessDetails` (`user_id`);

CREATE UNIQUE INDEX `IX_Collectors_user_id` ON `Collectors` (`user_id`);

CREATE INDEX `IX_EcoRewards_user_id` ON `EcoRewards` (`user_id`);

CREATE UNIQUE INDEX `IX_HouseholdDetails_user_id` ON `HouseholdDetails` (`user_id`);

CREATE INDEX `IX_Leaderboard_user_id` ON `Leaderboard` (`user_id`);

CREATE INDEX `IX_NGOReports_ngo_id` ON `NGOReports` (`ngo_id`);

CREATE UNIQUE INDEX `IX_NGOs_user_id` ON `NGOs` (`user_id`);

CREATE INDEX `IX_Payments_business_id` ON `Payments` (`business_id`);

CREATE INDEX `IX_PickupRequests_collector_id` ON `PickupRequests` (`collector_id`);

CREATE INDEX `IX_PickupRequests_user_id` ON `PickupRequests` (`user_id`);

CREATE INDEX `IX_TrackingLogs_pickup_id` ON `TrackingLogs` (`pickup_id`);

CREATE UNIQUE INDEX `IX_Users_email` ON `Users` (`email`);

CREATE INDEX `IX_Users_role_id` ON `Users` (`role_id`);

CREATE INDEX `IX_WasteLogs_pickup_id` ON `WasteLogs` (`pickup_id`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20251231065751_Mysql', '8.0.22');

COMMIT;

START TRANSACTION;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260101082757_InitialCreate', '8.0.22');

COMMIT;

START TRANSACTION;

ALTER TABLE `Payments` MODIFY COLUMN `payment_mode` longtext CHARACTER SET utf8mb4 NOT NULL;

ALTER TABLE `Payments` ADD `pickup_request_id` int NULL;

ALTER TABLE `Payments` ADD `razorpay_order_id` longtext CHARACTER SET utf8mb4 NULL;

ALTER TABLE `Payments` ADD `razorpay_payment_id` longtext CHARACTER SET utf8mb4 NULL;

ALTER TABLE `Payments` ADD `razorpay_signature` longtext CHARACTER SET utf8mb4 NULL;

ALTER TABLE `Payments` ADD `user_id` int NULL;

CREATE INDEX `IX_Payments_pickup_request_id` ON `Payments` (`pickup_request_id`);

CREATE INDEX `IX_Payments_user_id` ON `Payments` (`user_id`);

ALTER TABLE `Payments` ADD CONSTRAINT `FK_Payments_PickupRequests_pickup_request_id` FOREIGN KEY (`pickup_request_id`) REFERENCES `PickupRequests` (`pickup_id`);

ALTER TABLE `Payments` ADD CONSTRAINT `FK_Payments_Users_user_id` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260201162835_UpdatePaymentSchema', '8.0.22');

COMMIT;

START TRANSACTION;

ALTER TABLE `PickupRequests` ADD `latitude` decimal(10,8) NULL;

ALTER TABLE `PickupRequests` ADD `longitude` decimal(11,8) NULL;

ALTER TABLE `PickupRequests` ADD `notes` varchar(500) CHARACTER SET utf8mb4 NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260201170513_UpdatePickupRequestSchema', '8.0.22');

COMMIT;

START TRANSACTION;

ALTER TABLE `WasteLogs` ADD `notes` varchar(500) CHARACTER SET utf8mb4 NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260202191136_AddNotesToWasteLog', '8.0.22');

COMMIT;

START TRANSACTION;

ALTER TABLE `PickupRequests` ADD `pickup_frequency` varchar(10) CHARACTER SET utf8mb4 NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260203035630_AddPickupFrequencyField', '8.0.22');

COMMIT;

START TRANSACTION;

ALTER TABLE `Payments` DROP FOREIGN KEY `FK_Payments_BusinessDetails_business_id`;

ALTER TABLE `Payments` MODIFY COLUMN `business_id` int NULL;

ALTER TABLE `Payments` ADD CONSTRAINT `FK_Payments_BusinessDetails_business_id` FOREIGN KEY (`business_id`) REFERENCES `BusinessDetails` (`business_id`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260203043759_MakePaymentBusinessIdNullable', '8.0.22');

COMMIT;

