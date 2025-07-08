-- Clear existing data (in correct order to avoid foreign key constraints)
DELETE FROM artwork_views;
DELETE FROM artwork_likes;
DELETE FROM artist_follows;
DELETE FROM bids;
DELETE FROM transactions;
DELETE FROM artworks;
DELETE FROM collections;
DELETE FROM users;
DELETE FROM artists;

-- Reset sequences if they exist
DO $$ 
BEGIN
    -- This will reset any sequences, but won't error if they don't exist
    PERFORM setval(pg_get_serial_sequence('artists', 'id'), 1, false) WHERE pg_get_serial_sequence('artists', 'id') IS NOT NULL;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignore errors
END $$;

-- Insert sample artists with rich profiles
INSERT INTO artists (id, wallet_address, username, display_name, bio, avatar_url, verified, total_sales, total_artworks) VALUES
('550e8400-e29b-41d4-a716-446655440001', '0x1234567890123456789012345678901234567890', 'flowmaster', 'FlowMaster', 'Creating mesmerizing flow patterns through mathematical precision. Pioneer in generative spiral art with over 5 years of experience in algorithmic beauty.', '/placeholder.svg?height=100&width=100&text=FM', true, 25.7, 18),
('550e8400-e29b-41d4-a716-446655440002', '0x2345678901234567890123456789012345678901', 'pixelartist', 'PixelArtist', 'Digital architect crafting structured beauty from chaos. Specializing in geometric compositions and grid-based generative art.', '/placeholder.svg?height=100&width=100&text=PA', true, 18.3, 14),
('550e8400-e29b-41d4-a716-446655440003', '0x3456789012345678901234567890123456789012', 'celestialcreator', 'CelestialCreator', 'Capturing the dance of celestial bodies through algorithmic art. Inspired by cosmic phenomena and astronomical patterns.', '/placeholder.svg?height=100&width=100&text=CC', false, 22.1, 12),
('550e8400-e29b-41d4-a716-446655440004', '0x4567890123456789012345678901234567890123', 'mathartist', 'MathArtist', 'Where mathematics meets beauty. Exploring probability distributions and randomness in visual form through Gaussian fields.', '/placeholder.svg?height=100&width=100&text=MA', false, 14.2, 10),
('550e8400-e29b-41d4-a716-446655440005', '0x5678901234567890123456789012345678901234', 'gridmaster', 'GridMaster', 'Minimalist perfectionist. Finding beauty in order, structure, and mathematical precision through grid-based compositions.', '/placeholder.svg?height=100&width=100&text=GM', false, 8.8, 8),
('550e8400-e29b-41d4-a716-446655440006', '0x6789012345678901234567890123456789012345', 'abstractflow', 'AbstractFlow', 'Experimental digital artist pushing the boundaries of generative art. Combining multiple datasets for unique hybrid creations.', '/placeholder.svg?height=100&width=100&text=AF', true, 31.5, 22);

-- Insert sample collections with detailed descriptions
INSERT INTO collections (id, artist_id, name, description, slug, is_featured) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Cosmic Spirals', 'A journey through infinite mathematical spirals inspired by cosmic phenomena. Each piece represents a unique configuration of spiral parameters, creating mesmerizing patterns that echo the structure of galaxies and nautilus shells.', 'cosmic-spirals', true),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Digital Grids', 'Structured chaos meets digital perfection in geometric compositions. This collection explores the beauty of checkerboard patterns with varying complexity and color schemes.', 'digital-grids', true),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Lunar Series', 'Celestial bodies in eternal dance, captured through generative algorithms. Inspired by the phases of the moon and orbital mechanics.', 'lunar-series', false),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Probability Clouds', 'Mathematical beauty emerges from random distributions. Each artwork in this series visualizes different aspects of statistical beauty.', 'probability-clouds', true),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006', 'Hybrid Dimensions', 'Experimental combinations of multiple generative techniques. Where different mathematical worlds collide to create unprecedented visual experiences.', 'hybrid-dimensions', true);

-- Insert comprehensive artwork collection
INSERT INTO artworks (
    id, artist_id, collection_id, title, description, image_url, 
    dataset, color_scheme, seed, num_samples, noise, generation_mode,
    price, currency, rarity, edition, views, likes
) VALUES
-- FlowMaster's Cosmic Spirals Collection
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 
 'Cosmic Spiral #1234', 'A mesmerizing spiral pattern generated using advanced mathematical algorithms with magma color palette. This piece captures the essence of galactic rotation with 1000 precisely calculated points.', 
 '/placeholder.svg?height=600&width=600&text=Cosmic+Spiral+1234', 'spirals', 'magma', 1234, 1000, 0.05, 'ai', 
 3.5, 'ETH', 'Legendary', '1/1', 2847, 189),

('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001',
 'Infinite Vortex #2468', 'A hypnotic vortex that draws the viewer into infinite mathematical beauty. The plasma color scheme creates an otherworldly atmosphere.',
 '/placeholder.svg?height=600&width=600&text=Infinite+Vortex+2468', 'spirals', 'plasma', 2468, 1100, 0.06, 'ai',
 4.1, 'ETH', 'Legendary', '1/1', 3421, 298),

('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001',
 'Spiral Dreams #3691', 'Ethereal spiral formations that seem to dance in space. The viridis palette adds a mystical quality to the mathematical precision.',
 '/placeholder.svg?height=600&width=600&text=Spiral+Dreams+3691', 'spirals', 'viridis', 3691, 950, 0.04, 'ai',
 2.8, 'ETH', 'Epic', '1/1', 1654, 134),

-- PixelArtist's Digital Grids Collection  
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002',
 'Digital Grid Symphony #5678', 'Structured chaos meets digital perfection in this unique checkerboard composition. Each square tells a story of mathematical harmony.',
 '/placeholder.svg?height=600&width=600&text=Digital+Grid+5678', 'checkerboard', 'viridis', 5678, 1200, 0.03, 'ai',
 2.2, 'ETH', 'Epic', '1/1', 1892, 167),

('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002',
 'Pixel Matrix #7890', 'A complex matrix of pixels arranged in perfect mathematical order. The cividis color scheme emphasizes the digital nature.',
 '/placeholder.svg?height=600&width=600&text=Pixel+Matrix+7890', 'checkerboard', 'cividis', 7890, 1500, 0.02, 'ai',
 1.9, 'ETH', 'Rare', '1/1', 1234, 89),

-- CelestialCreator's Lunar Series
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003',
 'Lunar Dance #9012', 'Celestial bodies in eternal dance, captured through generative algorithms. The plasma colors evoke the aurora of distant worlds.',
 '/placeholder.svg?height=600&width=600&text=Lunar+Dance+9012', 'moons', 'plasma', 9012, 800, 0.07, 'ai',
 3.8, 'ETH', 'Legendary', '1/1', 2756, 234),

('770e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003',
 'Celestial Arcs #4567', 'Graceful arcs that mirror the paths of celestial bodies. Each curve represents a different orbital trajectory.',
 '/placeholder.svg?height=600&width=600&text=Celestial+Arcs+4567', 'moons', 'magma', 4567, 900, 0.05, 'ai',
 2.9, 'ETH', 'Epic', '1/1', 1567, 123),

-- MathArtist's Probability Clouds
('770e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004',
 'Probability Cloud #3456', 'Mathematical beauty emerges from random distributions in this gaussian masterpiece. Each point represents a probability in space.',
 '/placeholder.svg?height=600&width=600&text=Probability+Cloud+3456', 'gaussian', 'cividis', 3456, 1500, 0.04, 'svg',
 1.7, 'ETH', 'Rare', '1/1', 1054, 78),

('770e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004',
 'Statistical Beauty #6789', 'The hidden patterns within randomness revealed through careful mathematical visualization.',
 '/placeholder.svg?height=600&width=600&text=Statistical+Beauty+6789', 'gaussian', 'viridis', 6789, 1300, 0.06, 'svg',
 1.4, 'ETH', 'Rare', '1/1', 876, 56),

-- GridMaster's Perfect Order
('770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440005', NULL,
 'Perfect Order #7890', 'Minimalist perfection through structured grid patterns and monochromatic elegance. Every line serves a purpose.',
 '/placeholder.svg?height=600&width=600&text=Perfect+Order+7890', 'grid', 'grayscale', 7890, 900, 0.02, 'svg',
 1.1, 'ETH', 'Common', '1/1', 623, 42),

('770e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440005', NULL,
 'Structured Harmony #1357', 'Mathematical precision meets aesthetic beauty in this grid-based composition.',
 '/placeholder.svg?height=600&width=600&text=Structured+Harmony+1357', 'grid', 'cividis', 1357, 800, 0.01, 'svg',
 0.9, 'ETH', 'Common', '1/1', 445, 28),

-- AbstractFlow's Hybrid Dimensions
('770e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440005',
 'Dimensional Fusion #2580', 'An experimental piece combining spiral and grid elements. Where order meets chaos in perfect harmony.',
 '/placeholder.svg?height=600&width=600&text=Dimensional+Fusion+2580', 'spirals', 'plasma', 2580, 1400, 0.08, 'ai',
 5.2, 'ETH', 'Legendary', '1/1', 4123, 367),

('770e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440005',
 'Quantum Interference #3691', 'Multiple mathematical systems interfering with each other, creating unexpected patterns and beauty.',
 '/placeholder.svg?height=600&width=600&text=Quantum+Interference+3691', 'moons', 'magma', 3691, 1600, 0.09, 'ai',
 4.7, 'ETH', 'Legendary', '1/1', 3567, 289),

-- Additional standalone pieces
('770e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', NULL,
 'Golden Spiral #1618', 'A tribute to the golden ratio, this spiral embodies mathematical perfection found in nature.',
 '/placeholder.svg?height=600&width=600&text=Golden+Spiral+1618', 'spirals', 'magma', 1618, 1618, 0.0618, 'ai',
 6.18, 'ETH', 'Legendary', '1/1', 5234, 423),

('770e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440002', NULL,
 'Binary Dreams #1010', 'The poetry of binary code visualized through checkerboard patterns.',
 '/placeholder.svg?height=600&width=600&text=Binary+Dreams+1010', 'checkerboard', 'grayscale', 1010, 1024, 0.01, 'svg',
 2.56, 'ETH', 'Epic', '1/1', 1987, 156),

('770e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440003', NULL,
 'Eclipse Phenomenon #2024', 'Capturing the rare beauty of celestial alignment through algorithmic interpretation.',
 '/placeholder.svg?height=600&width=600&text=Eclipse+Phenomenon+2024', 'moons', 'plasma', 2024, 777, 0.03, 'ai',
 7.77, 'ETH', 'Legendary', '1/1', 6789, 567);

-- Insert sample users/collectors
INSERT INTO users (id, wallet_address, username, display_name, bio, avatar_url) VALUES
('880e8400-e29b-41d4-a716-446655440001', '0xabcdef1234567890abcdef1234567890abcdef12', 'collector1', 'Art Collector Prime', 'Passionate collector of generative art with focus on mathematical beauty.', '/placeholder.svg?height=80&width=80&text=AC'),
('880e8400-e29b-41d4-a716-446655440002', '0xbcdef1234567890abcdef1234567890abcdef123', 'cryptoart', 'Crypto Art Enthusiast', 'Early adopter of blockchain-based art. Specializing in algorithmic compositions.', '/placeholder.svg?height=80&width=80&text=CAE'),
('880e8400-e29b-41d4-a716-446655440003', '0xcdef1234567890abcdef1234567890abcdef1234', 'mathfan', 'Mathematics Fan', 'PhD in Mathematics with a passion for visual representations of mathematical concepts.', '/placeholder.svg?height=80&width=80&text=MF'),
('880e8400-e29b-41d4-a716-446655440004', '0xdef1234567890abcdef1234567890abcdef12345', 'gallerista', 'Digital Gallerista', 'Curator of digital art exhibitions. Always seeking the next breakthrough in generative art.', '/placeholder.svg?height=80&width=80&text=DG'),
('880e8400-e29b-41d4-a716-446655440005', '0xef1234567890abcdef1234567890abcdef123456', 'techcollector', 'Tech Collector', 'Technology executive with a passion for the intersection of code and creativity.', '/placeholder.svg?height=80&width=80&text=TC');

-- Insert realistic artwork likes
INSERT INTO artwork_likes (artwork_id, user_id) VALUES
-- High-value pieces get more likes
('770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440004'),
('770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440005'),
('770e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440012', '880e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440012', '880e8400-e29b-41d4-a716-446655440004'),
('770e8400-e29b-41d4-a716-446655440014', '880e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440014', '880e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440014', '880e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440016', '880e8400-e29b-41d4-a716-446655440005');

-- Insert sample transactions (completed sales)
INSERT INTO transactions (artwork_id, seller_id, buyer_id, price, currency, status, tx_hash, completed_at, platform_fee, artist_royalty) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 
 3.5, 'ETH', 'completed', '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12', NOW() - INTERVAL '5 days', 0.175, 0.35),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 
 2.2, 'ETH', 'completed', '0x2345678901bcdef1234567890abcdef1234567890abcdef1234567890abcdef123', NOW() - INTERVAL '3 days', 0.11, 0.22),
('770e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440003', 
 1.7, 'ETH', 'completed', '0x3456789012cdef1234567890abcdef1234567890abcdef1234567890abcdef1234', NOW() - INTERVAL '1 day', 0.085, 0.17);

-- Insert artist follows
INSERT INTO artist_follows (follower_id, artist_id) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004'),
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002'),
('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006');

-- Insert sample bids for active artworks
INSERT INTO bids (artwork_id, bidder_id, amount, currency, expires_at, is_active) VALUES
('770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440003', 3.8, 'ETH', NOW() + INTERVAL '7 days', true),
('770e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440001', 3.5, 'ETH', NOW() + INTERVAL '5 days', true),
('770e8400-e29b-41d4-a716-446655440012', '880e8400-e29b-41d4-a716-446655440004', 4.9, 'ETH', NOW() + INTERVAL '3 days', true),
('770e8400-e29b-41d4-a716-446655440014', '880e8400-e29b-41d4-a716-446655440002', 5.8, 'ETH', NOW() + INTERVAL '10 days', true);

-- Insert artwork views (simulating organic traffic)
INSERT INTO artwork_views (artwork_id, user_id, ip_address, created_at) VALUES
-- Recent views for trending pieces
('770e8400-e29b-41d4-a716-446655440014', '880e8400-e29b-41d4-a716-446655440001', '192.168.1.100', NOW() - INTERVAL '1 hour'),
('770e8400-e29b-41d4-a716-446655440014', '880e8400-e29b-41d4-a716-446655440002', '192.168.1.101', NOW() - INTERVAL '2 hours'),
('770e8400-e29b-41d4-a716-446655440016', '880e8400-e29b-41d4-a716-446655440003', '192.168.1.102', NOW() - INTERVAL '30 minutes'),
('770e8400-e29b-41d4-a716-446655440012', '880e8400-e29b-41d4-a716-446655440004', '192.168.1.103', NOW() - INTERVAL '45 minutes'),
('770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440005', '192.168.1.104', NOW() - INTERVAL '15 minutes');

-- Update artist totals based on actual transactions and artworks
UPDATE artists SET 
    total_sales = COALESCE((
        SELECT SUM(price) 
        FROM transactions 
        WHERE seller_id = artists.id AND status = 'completed'
    ), 0),
    total_artworks = COALESCE((
        SELECT COUNT(*) 
        FROM artworks 
        WHERE artist_id = artists.id
    ), 0);

-- Verify data integrity
DO $$ 
DECLARE
    artwork_count INTEGER;
    artist_count INTEGER;
    user_count INTEGER;
    transaction_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO artwork_count FROM artworks;
    SELECT COUNT(*) INTO artist_count FROM artists;
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO transaction_count FROM transactions;
    
    RAISE NOTICE 'Database seeded successfully!';
    RAISE NOTICE 'Artists: %, Users: %, Artworks: %, Transactions: %', 
        artist_count, user_count, artwork_count, transaction_count;
END $$;
