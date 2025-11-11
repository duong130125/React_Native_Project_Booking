-- Script to update sample data with images and avatars
-- Run this after migration.sql to populate sample data

-- Update hotels with diverse hotel images from Unsplash
-- You can replace these URLs with your own image URLs

-- Hotel 1
UPDATE hotels 
SET image_url = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
WHERE id = 1;

-- Hotel 2
UPDATE hotels 
SET image_url = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
WHERE id = 2;

-- Hotel 3
UPDATE hotels 
SET image_url = 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800'
WHERE id = 3;

-- Hotel 4
UPDATE hotels 
SET image_url = 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'
WHERE id = 4;

-- Hotel 5
UPDATE hotels 
SET image_url = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'
WHERE id = 5;

-- Hotel 6
UPDATE hotels 
SET image_url = 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800'
WHERE id = 6;

-- Hotel 7
UPDATE hotels 
SET image_url = 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800'
WHERE id = 7;

-- Hotel 8
UPDATE hotels 
SET image_url = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
WHERE id = 8;

-- Hotel 9
UPDATE hotels 
SET image_url = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
WHERE id = 9;

-- Hotel 10
UPDATE hotels 
SET image_url = 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800'
WHERE id = 10;

-- For hotels without specific IDs, use a default image
UPDATE hotels 
SET image_url = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
WHERE image_url IS NULL OR image_url = '';

-- Update users with avatar URLs based on their names
-- Using UI Avatars service to generate avatars with initials
-- Using CONCAT() for MySQL string concatenation
UPDATE users 
SET avatar_url = CONCAT('https://ui-avatars.com/api/?name=', REPLACE(full_name, ' ', '+'), '&background=4F46E5&color=fff&size=200&bold=true')
WHERE avatar_url IS NULL OR avatar_url = '';

-- Alternative: Use random avatar service (using CONCAT for MySQL)
-- UPDATE users 
-- SET avatar_url = CONCAT(
--   'https://randomuser.me/api/portraits/',
--   CASE WHEN id % 2 = 0 THEN 'women' ELSE 'men' END,
--   '/',
--   (id % 100),
--   '.jpg'
-- )
-- WHERE avatar_url IS NULL;

-- Verify updates
SELECT COUNT(*) as hotels_with_images FROM hotels WHERE image_url IS NOT NULL AND image_url != '';
SELECT COUNT(*) as users_with_avatars FROM users WHERE avatar_url IS NOT NULL AND avatar_url != '';

