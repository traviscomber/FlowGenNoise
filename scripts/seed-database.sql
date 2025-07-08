-- Insert sample artists
INSERT INTO artists (id, wallet_address, username, display_name, bio, verified, total_sales, total_artworks) VALUES
('550e8400-e29b-41d4-a716-446655440001', '0x1234567890123456789012345678901234567890', 'flowmaster', 'FlowMaster', 'Creating mesmerizing flow patterns through mathematical precision. Pioneer in generative spiral art.', true, 15.7, 12),
('550e8400-e29b-41d4-a716-446655440002', '0x2345678901234567890123456789012345678901', 'pixelartist', 'PixelArtist', 'Digital architect crafting structured beauty from chaos. Specializing in geometric compositions.', true, 8.3, 8),
('550e8400-e29b-41d4-a716-446655440003', '0x3456789012345678901234567890123456789012', 'celestialcreator', 'CelestialCreator', 'Capturing the dance of celestial bodies through algorithmic art. Inspired by cosmic phenomena.', false, 12.1, 6),
('550e8400-e29b-41d4-a716-446655440004', '0x4567890123456789012345678901234567890123', 'mathartist', 'MathArtist', 'Where mathematics meets beauty. Exploring probability and randomness in visual form.', false, 4.2, 5),
('550e8400-e29b-41d4-a716-446655440005', '0x5678901234567890123456789012345678901234', 'gridmaster', 'GridMaster', 'Minimalist perfectionist. Finding beauty in order, structure, and mathematical precision.', false, 2.8, 4);

-- Insert sample collections
INSERT INTO collections (id, artist_id, name, description, slug, is_featured) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Cosmic Spirals', 'A journey through infinite mathematical spirals inspired by cosmic phenomena', 'cosmic-spirals', true),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Digital Grids', 'Structured chaos meets digital perfection in geometric compositions', 'digital-grids', true),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Lunar Series', 'Celestial bodies in eternal dance, captured through generative algorithms', 'lunar-series', false);

-- Insert sample artworks
INSERT INTO artworks (
    id, artist_id, collection_id, title, description, image_url, 
    dataset, color_scheme, seed, num_samples, noise, generation_mode,
    price, currency, rarity, edition, views, likes
) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 
 'Cosmic Spiral #1234', 'A mesmerizing spiral pattern generated using advanced mathematical algorithms with magma color palette.', 
 '/placeholder.svg?height=400&width=400', 'spirals', 'magma', 1234, 1000, 0.05, 'ai', 
 2.5, 'ETH', 'Legendary', '1/1', 1247, 89),

('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002',
 'Digital Grid Symphony #5678', 'Structured chaos meets digital perfection in this unique checkerboard composition.',
 '/placeholder.svg?height=400&width=400', 'checkerboard', 'viridis', 5678, 1200, 0.03, 'ai',
 1.8, 'ETH', 'Epic', '1/1', 892, 67),

('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003',
 'Lunar Dance #9012', 'Celestial bodies in eternal dance, captured through generative algorithms.',
 '/placeholder.svg?height=400&width=400', 'moons', 'plasma', 9012, 800, 0.07, 'ai',
 3.2, 'ETH', 'Legendary', '1/1', 2156, 134),

('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', NULL,
 'Probability Cloud #3456', 'Mathematical beauty emerges from random distributions in this gaussian masterpiece.',
 '/placeholder.svg?height=400&width=400', 'gaussian', 'cividis', 3456, 1500, 0.04, 'svg',
 1.2, 'ETH', 'Rare', '1/1', 654, 45),

('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', NULL,
 'Perfect Order #7890', 'Minimalist perfection through structured grid patterns and monochromatic elegance.',
 '/placeholder.svg?height=400&width=400', 'grid', 'grayscale', 7890, 900, 0.02, 'svg',
 0.9, 'ETH', 'Common', '1/1', 423, 28),

('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001',
 'Infinite Vortex #2468', 'A hypnotic vortex that draws the viewer into infinite mathematical beauty.',
 '/placeholder.svg?height=400&width=400', 'spirals', 'magma', 2468, 1100, 0.06, 'ai',
 4.1, 'ETH', 'Legendary', '1/1', 3421, 198);

-- Insert sample users
INSERT INTO users (id, wallet_address, username, display_name) VALUES
('880e8400-e29b-41d4-a716-446655440001', '0xabcdef1234567890abcdef1234567890abcdef12', 'collector1', 'Art Collector'),
('880e8400-e29b-41d4-a716-446655440002', '0xbcdef1234567890abcdef1234567890abcdef123', 'cryptoart', 'Crypto Art Enthusiast'),
('880e8400-e29b-41d4-a716-446655440003', '0xcdef1234567890abcdef1234567890abcdef1234', 'mathfan', 'Mathematics Fan');

-- Insert sample likes
INSERT INTO artwork_likes (artwork_id, user_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440003');

-- Insert sample transactions
INSERT INTO transactions (artwork_id, seller_id, buyer_id, price, currency, status, tx_hash, completed_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 
 2.5, 'ETH', 'completed', '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12', NOW() - INTERVAL '2 days');

-- Update artist totals based on transactions
UPDATE artists SET 
    total_sales = (
        SELECT COALESCE(SUM(price), 0) 
        FROM transactions 
        WHERE seller_id = artists.id AND status = 'completed'
    ),
    total_artworks = (
        SELECT COUNT(*) 
        FROM artworks 
        WHERE artist_id = artists.id
    );
