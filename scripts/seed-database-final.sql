-- Insert Artists
INSERT INTO artists (id, wallet_address, username, display_name, bio, avatar_url, banner_url, website_url, twitter_handle, instagram_handle, verified, total_sales, total_artworks) VALUES
('550e8400-e29b-41d4-a716-446655440000', '0x1234567890123456789012345678901234567890', 'flowmaster', 'FlowMaster', 'Pioneer of spiral flow art, creating mesmerizing mathematical visualizations that bridge the gap between code and canvas.', '/placeholder.svg?height=100&width=100&text=FM', '/placeholder.svg?height=400&width=800&text=FlowMaster+Banner', 'https://flowmaster.art', '@flowmaster_art', 'flowmaster_art', true, 25.7, 18),
('550e8400-e29b-41d4-a716-446655440001', '0x2345678901234567890123456789012345678901', 'pixelartist', 'PixelArtist', 'Digital grid specialist crafting perfect geometric harmony through algorithmic precision and mathematical beauty.', '/placeholder.svg?height=100&width=100&text=PA', '/placeholder.svg?height=400&width=800&text=PixelArtist+Banner', 'https://pixelartist.io', '@pixel_artist', 'pixel_artist_official', true, 18.3, 14),
('550e8400-e29b-41d4-a716-446655440002', '0x3456789012345678901234567890123456789012', 'celestialcreator', 'CelestialCreator', 'Exploring cosmic phenomena through generative art, transforming celestial mechanics into stunning visual narratives.', '/placeholder.svg?height=100&width=100&text=CC', '/placeholder.svg?height=400&width=800&text=CelestialCreator+Banner', 'https://celestialcreator.space', '@celestial_creator', 'celestialcreator', true, 22.1, 12),
('550e8400-e29b-41d4-a716-446655440003', '0x4567890123456789012345678901234567890123', 'mathartist', 'MathArtist', 'Probability visualization expert, turning statistical distributions into captivating artistic expressions.', '/placeholder.svg?height=100&width=100&text=MA', '/placeholder.svg?height=400&width=800&text=MathArtist+Banner', 'https://mathartist.com', '@math_artist', 'mathartist_official', false, 14.2, 10),
('550e8400-e29b-41d4-a716-446655440004', '0x5678901234567890123456789012345678901234', 'gridmaster', 'GridMaster', 'Minimalist perfectionist creating structured harmony through precise geometric arrangements and clean aesthetics.', '/placeholder.svg?height=100&width=100&text=GM', '/placeholder.svg?height=400&width=800&text=GridMaster+Banner', 'https://gridmaster.design', '@grid_master', 'gridmaster_design', false, 8.8, 8),
('550e8400-e29b-41d4-a716-446655440005', '0x6789012345678901234567890123456789012345', 'abstractflow', 'AbstractFlow', 'Experimental hybrid artist pushing boundaries between traditional flow fields and AI-generated compositions.', '/placeholder.svg?height=100&width=100&text=AF', '/placeholder.svg?height=400&width=800&text=AbstractFlow+Banner', 'https://abstractflow.xyz', '@abstract_flow', 'abstractflow_art', true, 31.5, 22);

-- Insert Users (Collectors)
INSERT INTO users (id, wallet_address, username, display_name, bio, avatar_url, email) VALUES
('880e8400-e29b-41d4-a716-446655440000', '0x7890123456789012345678901234567890123456', 'artcollector1', 'Digital Connoisseur', 'Passionate collector of generative art and mathematical visualizations.', '/placeholder.svg?height=80&width=80&text=DC', 'collector1@example.com'),
('880e8400-e29b-41d4-a716-446655440001', '0x8901234567890123456789012345678901234567', 'cryptoart_fan', 'CryptoArt Enthusiast', 'Early adopter of blockchain art, focusing on algorithmic and flow-based pieces.', '/placeholder.svg?height=80&width=80&text=CE', 'cryptofan@example.com'),
('880e8400-e29b-41d4-a716-446655440002', '0x9012345678901234567890123456789012345678', 'mathvisual', 'Mathematical Visualizer', 'Mathematician turned art collector, drawn to pieces that showcase mathematical beauty.', '/placeholder.svg?height=80&width=80&text=MV', 'mathvisual@example.com'),
('880e8400-e29b-41d4-a716-446655440003', '0xa123456789012345678901234567890123456789', 'flowenthusiast', 'Flow Enthusiast', 'Dedicated to collecting the finest examples of flow field art and generative design.', '/placeholder.svg?height=80&width=80&text=FE', 'flowfan@example.com'),
('880e8400-e29b-41d4-a716-446655440004', '0xb234567890123456789012345678901234567890', 'digitalcurator', 'Digital Curator', 'Curating the future of digital art, one algorithmic masterpiece at a time.', '/placeholder.svg?height=80&width=80&text=DC', 'curator@example.com');

-- Insert Collections
INSERT INTO collections (id, artist_id, name, description, banner_url, slug, is_featured) VALUES
('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Cosmic Spirals', 'A mesmerizing collection exploring the infinite beauty of spiral mathematics in cosmic contexts.', '/placeholder.svg?height=300&width=600&text=Cosmic+Spirals', 'cosmic-spirals', true),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Digital Grids', 'Perfect geometric harmony through algorithmic precision and mathematical beauty.', '/placeholder.svg?height=300&width=600&text=Digital+Grids', 'digital-grids', true),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Lunar Series', 'Celestial mechanics transformed into stunning visual narratives inspired by lunar phases.', '/placeholder.svg?height=300&width=600&text=Lunar+Series', 'lunar-series', true),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Probability Clouds', 'Statistical distributions visualized as captivating artistic expressions.', '/placeholder.svg?height=300&width=600&text=Probability+Clouds', 'probability-clouds', false),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'Hybrid Dimensions', 'Experimental fusion of traditional flow fields with AI-generated compositions.', '/placeholder.svg?height=300&width=600&text=Hybrid+Dimensions', 'hybrid-dimensions', true);

-- Insert Artworks
INSERT INTO artworks (id, artist_id, collection_id, title, description, image_url, dataset, color_scheme, seed, num_samples, noise, generation_mode, price, currency, status, rarity, edition, views, likes, token_id, contract_address, minted_at, listed_at) VALUES
-- FlowMaster's Artworks
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'Golden Spiral Infinity', 'A mesmerizing exploration of the golden ratio manifested through infinite spiral patterns, where mathematics meets cosmic beauty.', '/placeholder.svg?height=800&width=800&text=Golden+Spiral+Art', 'spirals', 'golden', 42, 1000, 0.15, 'svg', 7.77, 'ETH', 'available', 'Legendary', '1 of 1', 6789, 567, 'TK001', '0xABC123...', '2024-01-15 10:30:00', '2024-01-15 12:00:00'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'Cosmic Vortex', 'Deep space spiral formations captured in algorithmic beauty, representing the dance of galaxies through time.', '/placeholder.svg?height=800&width=800&text=Cosmic+Vortex+Art', 'spirals', 'cosmic', 128, 800, 0.12, 'ai', 2.45, 'ETH', 'available', 'Epic', '1 of 3', 4521, 342, 'TK002', '0xDEF456...', '2024-01-20 14:15:00', '2024-01-20 16:00:00'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'Fibonacci Dreams', 'Nature\'s mathematical sequence visualized through flowing spiral harmonics and organic color transitions.', '/placeholder.svg?height=800&width=800&text=Fibonacci+Dreams+Art', 'spirals', 'nature', 256, 1200, 0.08, 'svg', 1.89, 'ETH', 'available', 'Rare', '2 of 5', 3210, 198, 'TK003', '0xGHI789...', '2024-01-25 09:45:00', '2024-01-25 11:30:00'),

-- PixelArtist's Artworks  
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Digital Grid Symphony', 'Perfect geometric harmony achieved through algorithmic precision, showcasing the beauty of mathematical order.', '/placeholder.svg?height=800&width=800&text=Digital+Grid+Symphony', 'grid', 'monochrome', 512, 900, 0.05, 'svg', 2.90, 'ETH', 'available', 'Epic', '1 of 2', 5432, 423, 'TK004', '0xJKL012...', '2024-02-01 13:20:00', '2024-02-01 15:00:00'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Perfect Order', 'Minimalist grid composition demonstrating the elegance of structured mathematical relationships.', '/placeholder.svg?height=800&width=800&text=Perfect+Order+Art', 'grid', 'minimal', 64, 600, 0.02, 'svg', 1.12, 'ETH', 'available', 'Common', '3 of 10', 2876, 156, 'TK005', '0xMNO345...', '2024-02-05 11:10:00', '2024-02-05 12:45:00'),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Structured Harmony', 'Clean geometric patterns that celebrate the intersection of technology and artistic expression.', '/placeholder.svg?height=800&width=800&text=Structured+Harmony+Art', 'grid', 'tech', 1024, 750, 0.03, 'svg', 0.95, 'ETH', 'available', 'Common', '5 of 15', 1987, 89, 'TK006', '0xPQR678...', '2024-02-10 16:30:00', '2024-02-10 18:00:00'),

-- CelestialCreator's Artworks
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'Eclipse Phenomenon', 'Capturing the rare beauty of celestial alignment through algorithmic interpretation of astronomical data.', '/placeholder.svg?height=800&width=800&text=Eclipse+Phenomenon+Art', 'moons', 'eclipse', 777, 1500, 0.18, 'ai', 5.25, 'ETH', 'available', 'Legendary', '1 of 1', 8901, 678, 'TK007', '0xSTU901...', '2024-02-14 20:00:00', '2024-02-14 21:30:00'),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'Celestial Arcs', 'Lunar trajectory patterns transformed into flowing artistic compositions with cosmic color palettes.', '/placeholder.svg?height=800&width=800&text=Celestial+Arcs+Art', 'moons', 'celestial', 333, 1100, 0.14, 'ai', 1.95, 'ETH', 'available', 'Epic', '2 of 4', 4567, 289, 'TK008', '0xVWX234...', '2024-02-18 12:15:00', '2024-02-18 14:00:00'),
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'Lunar Phases', 'The eternal dance of moon phases captured in flowing mathematical visualizations.', '/placeholder.svg?height=800&width=800&text=Lunar+Phases+Art', 'moons', 'phases', 888, 950, 0.11, 'svg', 1.67, 'ETH', 'available', 'Rare', '3 of 7', 3456, 234, 'TK009', '0xYZA567...', '2024-02-22 08:45:00', '2024-02-22 10:30:00'),

-- MathArtist's Artworks
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'Probability Cloud', 'Statistical beauty revealed through Gaussian distribution visualizations in flowing, organic forms.', '/placeholder.svg?height=800&width=800&text=Probability+Cloud+Art', 'gaussian', 'statistical', 1337, 2000, 0.25, 'ai', 1.45, 'ETH', 'available', 'Rare', '1 of 6', 2345, 167, 'TK010', '0xBCD890...', '2024-02-25 15:20:00', '2024-02-25 17:00:00'),
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'Statistical Beauty', 'Complex probability distributions transformed into mesmerizing visual narratives.', '/placeholder.svg?height=800&width=800&text=Statistical+Beauty+Art', 'gaussian', 'probability', 2048, 1800, 0.22, 'svg', 1.23, 'ETH', 'available', 'Rare', '2 of 8', 1876, 134, 'TK011', '0xEFG123...', '2024-03-01 10:30:00', '2024-03-01 12:15:00'),

-- GridMaster's Artworks
('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440004', NULL, 'Minimal Grid 01', 'Pure geometric minimalism showcasing the elegance of simple mathematical relationships.', '/placeholder.svg?height=800&width=800&text=Minimal+Grid+01', 'checkerboard', 'minimal', 16, 400, 0.01, 'svg', 0.89, 'ETH', 'available', 'Common', '1 of 20', 1234, 78, 'TK012', '0xHIJ456...', '2024-03-05 14:00:00', '2024-03-05 15:30:00'),
('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440004', NULL, 'Checkerboard Dreams', 'Classic patterns reimagined through contemporary algorithmic interpretation.', '/placeholder.svg?height=800&width=800&text=Checkerboard+Dreams', 'checkerboard', 'classic', 32, 500, 0.04, 'svg', 1.05, 'ETH', 'available', 'Common', '4 of 12', 987, 56, 'TK013', '0xKLM789...', '2024-03-08 11:45:00', '2024-03-08 13:20:00'),

-- AbstractFlow's Artworks
('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440004', 'Dimensional Fusion', 'Groundbreaking hybrid composition merging traditional flow fields with AI-generated elements.', '/placeholder.svg?height=800&width=800&text=Dimensional+Fusion+Art', 'spirals', 'hybrid', 4096, 2500, 0.30, 'ai', 3.50, 'ETH', 'available', 'Legendary', '1 of 1', 7654, 543, 'TK014', '0xNOP012...', '2024-03-12 18:30:00', '2024-03-12 20:00:00'),
('660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440004', 'Binary Dreams', 'Digital consciousness explored through the intersection of code, mathematics, and artistic vision.', '/placeholder.svg?height=800&width=800&text=Binary+Dreams+Art', 'grid', 'digital', 8192, 3000, 0.35, 'ai', 2.75, 'ETH', 'Epic', '1 of 2', 5432, 398, 'TK015', '0xQRS345...', '2024-03-15 09:15:00', '2024-03-15 11:00:00'),
('660e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440004', 'Flow State Alpha', 'Experimental composition pushing the boundaries between algorithmic generation and artistic intuition.', '/placeholder.svg?height=800&width=800&text=Flow+State+Alpha', 'moons', 'experimental', 16384, 2200, 0.28, 'ai', 1.88, 'ETH', 'available', 'Rare', '3 of 5', 3210, 245, 'TK016', '0xTUV678...', '2024-03-18 13:45:00', '2024-03-18 15:30:00');

-- Insert Artwork Likes
INSERT INTO artwork_likes (artwork_id, user_id) VALUES
-- Popular artworks get more likes
('660e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440000'),
('660e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440003'),
('660e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440004'),
('660e8400-e29b-41d4-a716-446655440013', '880e8400-e29b-41d4-a716-446655440000'),
('660e8400-e29b-41d4-a716-446655440013', '880e8400-e29b-41d4-a716-446655440003'),
('660e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440004'),
('660e8400-e29b-41d4-a716-446655440014', '880e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440014', '880e8400-e29b-41d4-a716-446655440003');

-- Insert Artwork Views (sample data)
INSERT INTO artwork_views (artwork_id, user_id, ip_address) VALUES
('660e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440000', '192.168.1.100'),
('660e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001', '192.168.1.101'),
('660e8400-e29b-41d4-a716-446655440000', NULL, '192.168.1.102'),
('660e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440002', '192.168.1.103'),
('660e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440003', '192.168.1.104'),
('660e8400-e29b-41d4-a716-446655440013', '880e8400-e29b-41d4-a716-446655440004', '192.168.1.105');

-- Insert Follows
INSERT INTO follows (follower_id, following_id) VALUES
('880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000'),
('880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002'),
('880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005'),
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000'),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002'),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004'),
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005'),
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001');

-- Insert Transactions (completed sales)
INSERT INTO transactions (id, artwork_id, seller_id, buyer_id, price, currency, status, tx_hash, block_number, gas_used, gas_price, platform_fee, artist_royalty, completed_at) VALUES
('990e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440000', 2.45, 'ETH', 'completed', '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890', 18500000, 21000, 20.5, 0.0735, 0.245, '2024-01-21 10:30:00'),
('990e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 1.95, 'ETH', 'completed', '0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab', 18500100, 21000, 19.8, 0.0585, 0.195, '2024-02-19 14:45:00'),
('990e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440002', 1.23, 'ETH', 'completed', '0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcd', 18500200, 21000, 18.2, 0.0369, 0.123, '2024-03-02 16:20:00');

-- Insert Active Bids
INSERT INTO bids (artwork_id, bidder_id, amount, currency, expires_at, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001', 7.50, 'ETH', '2024-04-01 23:59:59', true),
('660e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440002', 7.25, 'ETH', '2024-04-01 23:59:59', true),
('660e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440003', 5.00, 'ETH', '2024-03-30 23:59:59', true),
('660e8400-e29b-41d4-a716-446655440013', '880e8400-e29b-41d4-a716-446655440004', 3.25, 'ETH', '2024-03-28 23:59:59', true),
('660e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440000', 2.75, 'ETH', '2024-03-25 23:59:59', true);

-- Update artist total_sales based on completed transactions
UPDATE artists SET total_sales = (
    SELECT COALESCE(SUM(t.price), 0)
    FROM transactions t
    WHERE t.seller_id = artists.id AND t.status = 'completed'
);

-- Final verification - show summary
SELECT 
    'Artists' as table_name, COUNT(*) as count FROM artists
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Collections', COUNT(*) FROM collections
UNION ALL
SELECT 'Artworks', COUNT(*) FROM artworks
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'Likes', COUNT(*) FROM artwork_likes
UNION ALL
SELECT 'Views', COUNT(*) FROM artwork_views
UNION ALL
SELECT 'Follows', COUNT(*) FROM follows
UNION ALL
SELECT 'Bids', COUNT(*) FROM bids;
