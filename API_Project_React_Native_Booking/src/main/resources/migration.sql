-- Migration: Add imageUrl and avatarUrl columns
-- Date: 2025-01-XX
-- Description: Add image_url column to hotels table and avatar_url column to users table
-- Database: MySQL
-- Add image_url column to hotels table (MySQL syntax)
ALTER TABLE hotels
ADD COLUMN image_url VARCHAR(500) NULL;
-- Add avatar_url column to users table (MySQL syntax)
ALTER TABLE users
ADD COLUMN avatar_url VARCHAR(500) NULL;
-- Update existing hotels with sample image URLs (you can change these to your actual image URLs)
UPDATE hotels
SET image_url = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
WHERE image_url IS NULL
    AND id = 1;
UPDATE hotels
SET image_url = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
WHERE image_url IS NULL
    AND id = 2;
UPDATE hotels
SET image_url = 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800'
WHERE image_url IS NULL
    AND id = 3;
UPDATE hotels
SET image_url = 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'
WHERE image_url IS NULL
    AND id = 4;
UPDATE hotels
SET image_url = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'
WHERE image_url IS NULL
    AND id = 5;
-- Update all remaining hotels with default hotel image if they don't have one
UPDATE hotels
SET image_url = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
WHERE image_url IS NULL;
-- Update existing users with sample avatar URLs (you can change these to your actual avatar URLs)
-- Using CONCAT() for MySQL string concatenation
UPDATE users
SET avatar_url = CONCAT(
        'https://ui-avatars.com/api/?name=',
        REPLACE(full_name, ' ', '+'),
        '&background=4F46E5&color=fff&size=200&bold=true'
    )
WHERE avatar_url IS NULL;
-- Note: MySQL doesn't support COMMENT ON COLUMN syntax
-- You can add comments in the application code or documentation
-- ===============================
-- Payments: cards and transactions
-- ===============================
-- Create table: payment_cards
CREATE TABLE IF NOT EXISTS payment_cards (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    card_holder_name VARCHAR(150) NOT NULL,
    card_brand VARCHAR(50) NOT NULL,
    -- VISA/MASTERCARD/etc
    card_number VARCHAR(32) NOT NULL,
    -- masked/pseudo number
    exp_month TINYINT NOT NULL,
    exp_year SMALLINT NOT NULL,
    balance DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_cards_user FOREIGN KEY (user_id) REFERENCES users(id)
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_cards_user ON payment_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_cards_default ON payment_cards(user_id, is_default);
-- Create table: payments (transactions)
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    booking_id BIGINT NOT NULL,
    card_id BIGINT NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    status VARCHAR(20) NOT NULL,
    -- PENDING/SUCCESS/FAILED
    provider_ref VARCHAR(100),
    -- if integrate later
    message VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_payments_card FOREIGN KEY (card_id) REFERENCES payment_cards(id),
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_card ON payments(card_id);