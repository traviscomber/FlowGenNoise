-- Clear existing data (in correct order to avoid foreign key constraints)
DELETE FROM artwork_views;
DELETE FROM artwork_likes;
DELETE FROM follows;
DELETE FROM bids;
DELETE FROM transactions;
DELETE FROM artworks;
DELETE FROM collections;
DELETE FROM users;
DELETE FROM artists;

-- Insert Artists
INSERT INTO artists (id, wallet_address, username, display_name, bio, avatar_url, banner_url, website_url, twitter_handle, instagram_handle, verified, total_sales, total_artworks) VALUES
('550e8400-e29b-41d4-a716-446655440001', '0x1234567890123456789012345678901234567890', 'flowmaster', 'FlowMaster', 'Pioneer of spiral flow art. Creating mesmerizing mathematical beauty since 2021. Each piece explores the infinite dance of curves and colors.', '/placeholder.svg?height=100&width=100&text=FM', '/placeholder.svg?height=400&width=800&text=FlowMaster+Banner', 'https://flowmaster.art', '@flowmaster_art', 'flowmaster_art', true, 25.7, 18),

('550e8400-e29b-41d4-a716-446655440002', '0x2345678901234567890123456789012345678901', 'pixelartist', 'PixelArtist', 'Digital grid specialist crafting perfect geometric harmony. My work explores the intersection of order and chaos in digital space.', '/placeholder.svg?height=100&width=100&text=PA', '/placeholder.svg?height=400&width=800&text=PixelArtist+Banner', 'https://pixelartist.digital', '@pixel_artist', 'pixel_artist_official', true, 18.3, 14),

('550e8400-e29b-41d4-a716-446655440003', '0x3456789012345678901234567890123456789012', 'celestialcreator', 'CelestialCreator', 'Capturing cosmic phenomena through generative art. Each piece is a window into the mathematical beauty of the universe.', '/placeholder.svg?height=100&width=100&text=CC', '/placeholder.svg?height=400&width=800&text=Celestial+Creator', 'https://celestialcreator.space', '@celestial_creator', 'celestialcreator', true, 22.1, 12),

('550e8400-e29b-41d4-a716-446655440004', '0x4567890123456789012345678901234567890123', 'mathartist', 'MathArtist', 'Visualizing probability and statistics through beautiful generative algorithms. Making mathematics accessible through art.', '/placeholder.svg?height=100&width=100&text=MA', '/placeholder.svg?height=400&width=800&text=Math+Artist', 'https://mathartist.io', '@math_artist', 'mathartist_viz', false, 14.2, 10),

('550e8400-e29b-41d4-a716-446655440005', '0x5678901234567890123456789012345678901234', 'gridmaster', 'GridMaster', 'Minimalist perfectionist creating clean, structured digital art. Every line has purpose, every space has meaning.', '/placeholder.svg?height=100&width=100&text=GM', '/placeholder.svg?height=400&width=800&text=Grid+Master', 'https://gridmaster.minimal', '@grid_master', 'gridmaster_art', false, 8.8, 8),

('550e8400-e29b-41d4-a716-446655440006', '0x6789012345678901234567890123456789012345', 'abstractflow', 'AbstractFlow', 'Experimental artist pushing the boundaries of generative art. Combining traditional techniques with cutting-edge AI.', '/placeholder.svg?height=100&width=100&text=AF', '/placeholder.svg?height=400&width=800&text=Abstract+Flow', 'https://abstractflow.experimental', '@abstract_flow', 'abstractflow_art', true, 31.5, 22);

-- Insert Users/Collectors
INSERT INTO users (id, wallet_address, username, display_name, bio, avatar_url, email) VALUES
('660e8400-e29b-41d4-a716-446655440001', '0xa123456789012345678901234567890123456789', 'cryptowhale', 'CryptoWhale', 'Passionate collector of generative art. Building the future of digital culture.', '/placeholder.svg?height=80&width=80&text=CW', 'whale@crypto.art'),

('660e8400-e29b-41d4-a716-446655440002', '0xb234567890123456789012345678901234567890', 'artlover2024', 'ArtLover', 'Discovering emerging artists and supporting the digital art revolution.', '/placeholder.svg?height=80&width=80&text=AL', 'lover@art.digital'),

('660e8400-e29b-41d4-a716-446655440003', '0xc345678901234567890123456789012345678901', 'nftcollector', 'NFTCollector', 'Curating the finest pieces in the NFT space. Quality over quantity.', '/placeholder.svg?height=80&width=80&text=NC', 'collector@nft.gallery'),

('660e8400-e29b-41d4-a716-446655440004', '0xd456789012345678901234567890123456789012', 'digitalpatron', 'DigitalPatron', 'Supporting artists and fostering creativity in the digital realm.', '/placeholder.svg?height=80&width=80&text=DP', 'patron@digital.support'),

('660e8400-e29b-41d4-a716-446655440005', '0xe567890123456789012345678901234567890123', 'artinvestor', 'ArtInvestor', 'Strategic collector focused on long-term value and artistic merit.', '/placeholder.svg?height=80&width=80&text=AI', 'investor@art.fund');

-- Insert Collections
INSERT INTO collections (id, artist_id, name, description, banner_url, slug, is_featured) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Cosmic Spirals', 'A journey through infinite mathematical beauty, where spirals dance with cosmic energy.', '/placeholder.svg?height=300&width=600&text=Cosmic+Spirals', 'cosmic-spirals', true),

('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Digital Grids', 'Perfect geometric harmony in digital space. Order emerging from algorithmic chaos.', '/placeholder.svg?height=300&width=600&text=Digital+Grids', 'digital-grids', true),

('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Lunar Series', 'Capturing the phases and beauty of celestial bodies through generative algorithms.', '/placeholder.svg?height=300&width=600&text=Lunar+Series', 'lunar-series', true),

('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Probability Clouds', 'Visualizing statistical beauty through color and form. Mathematics made visible.', '/placeholder.svg?height=300&width=600&text=Probability+Clouds', 'probability-clouds', true),

('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006', 'Hybrid Dimensions', 'Experimental fusion of traditional and AI-generated art techniques.', '/placeholder.svg?height=300&width=600&text=Hybrid+Dimensions', 'hybrid-dimensions', true);

-- Insert Artworks
INSERT INTO artworks (id, artist_id, collection_id, title, description, image_url, image_ipfs_hash, metadata_url, metadata_ipfs_hash, dataset, color_scheme, seed, num_samples, noise, generation_mode, price, currency, status, rarity, edition, views, likes, token_id, contract_address, blockchain, minted_at, listed_at) VALUES

-- Legendary Artworks
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Golden Spiral Infinity', 'A mesmerizing golden spiral that seems to extend into infinity, created using advanced mathematical algorithms and rendered in stunning detail.', '/placeholder.svg?height=800&width=800&text=Golden+Spiral', 'QmX1Y2Z3...GoldenSpiral', 'https://ipfs.io/ipfs/QmX1Y2Z3...GoldenSpiralMeta', 'QmA1B2C3...GoldenSpiralMeta', 'spiral', 'golden', 777, 10000, 0.15, 'svg', 7.77, 'ETH', 'available', 'Legendary', '1/1', 8901, 678, '1001', '0x1a2b3c4d5e6f7890123456789012345678901234', 'ethereum', '2024-01-15 10:30:00+00', '2024-01-15 11:00:00+00'),

('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'Eclipse Phenomenon', 'Capturing the rare beauty of a solar eclipse through generative art, with dynamic light and shadow interplay.', '/placeholder.svg?height=800&width=800&text=Eclipse', 'QmE1C2L3...Eclipse', 'https://ipfs.io/ipfs/QmE1C2L3...EclipseMeta', 'QmE1C2L3...EclipseMeta', 'celestial', 'eclipse', 2024, 8000, 0.12, 'ai', 5.25, 'ETH', 'available', 'Legendary', '1/1', 7234, 567, '1002', '0x2b3c4d5e6f7890123456789012345678901234ab', 'ethereum', '2024-02-01 14:20:00+00', '2024-02-01 15:00:00+00'),

('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440005', 'Dimensional Fusion', 'An experimental piece that blends multiple dimensional perspectives into a single cohesive artwork.', '/placeholder.svg?height=800&width=800&text=Dimensional+Fusion', 'QmD1F2U3...Fusion', 'https://ipfs.io/ipfs/QmD1F2U3...FusionMeta', 'QmD1F2U3...FusionMeta', 'hybrid', 'prismatic', 3141, 12000, 0.18, 'ai', 3.50, 'ETH', 'available', 'Legendary', '1/1', 6789, 445, '1003', '0x3c4d5e6f7890123456789012345678901234abcd', 'ethereum', '2024-02-10 09:15:00+00', '2024-02-10 10:00:00+00'),

-- Epic Artworks
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'Digital Grid Symphony', 'A complex grid pattern that creates visual music through perfect mathematical harmony.', '/placeholder.svg?height=800&width=800&text=Grid+Symphony', 'QmG1R2I3...Symphony', 'https://ipfs.io/ipfs/QmG1R2I3...SymphonyMeta', 'QmG1R2I3...SymphonyMeta', 'grid', 'monochrome', 1618, 5000, 0.08, 'svg', 2.90, 'ETH', 'available', 'Epic', '1/1', 5432, 389, '1004', '0x4d5e6f7890123456789012345678901234abcdef', 'ethereum', '2024-01-20 16:45:00+00', '2024-01-20 17:30:00+00'),

('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440005', 'Binary Dreams', 'Where digital meets organic - a fusion of binary code and flowing natural forms.', '/placeholder.svg?height=800&width=800&text=Binary+Dreams', 'QmB1N2A3...Dreams', 'https://ipfs.io/ipfs/QmB1N2A3...DreamsMeta', 'QmB1N2A3...DreamsMeta', 'hybrid', 'binary', 1010, 7500, 0.14, 'ai', 2.75, 'ETH', 'available', 'Epic', '1/1', 4987, 334, '1005', '0x5e6f7890123456789012345678901234abcdef12', 'ethereum', '2024-02-05 12:20:00+00', '2024-02-05 13:00:00+00'),

('880e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Cosmic Vortex', 'A swirling vortex of cosmic energy, pulling viewers into its hypnotic mathematical beauty.', '/placeholder.svg?height=800&width=800&text=Cosmic+Vortex', 'QmC1O2S3...Vortex', 'https://ipfs.io/ipfs/QmC1O2S3...VortexMeta', 'QmC1O2S3...VortexMeta', 'spiral', 'cosmic', 2718, 9000, 0.16, 'svg', 2.45, 'ETH', 'available', 'Epic', '1/1', 4321, 298, '1006', '0x6f7890123456789012345678901234abcdef1234', 'ethereum', '2024-01-25 08:10:00+00', '2024-01-25 09:00:00+00'),

('880e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'Celestial Arcs', 'Graceful arcs inspired by planetary orbits and celestial mechanics.', '/placeholder.svg?height=800&width=800&text=Celestial+Arcs', 'QmC1E2L3...Arcs', 'https://ipfs.io/ipfs/QmC1E2L3...ArcsMeta', 'QmC1E2L3...ArcsMeta', 'celestial', 'aurora', 1234, 6000, 0.11, 'ai', 1.95, 'ETH', 'available', 'Epic', '1/1', 3876, 267, '1007', '0x7890123456789012345678901234abcdef123456', 'ethereum', '2024-02-12 15:30:00+00', '2024-02-12 16:15:00+00'),

-- Rare Artworks
('880e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Fibonacci Dreams', 'The famous Fibonacci sequence brought to life through flowing, organic spirals.', '/placeholder.svg?height=600&width=600&text=Fibonacci', 'QmF1I2B3...Fibonacci', 'https://ipfs.io/ipfs/QmF1I2B3...FibonacciMeta', 'QmF1I2B3...FibonacciMeta', 'spiral', 'nature', 1123, 4000, 0.09, 'svg', 1.89, 'ETH', 'available', 'Rare', '1/1', 3245, 234, '1008', '0x90123456789012345678901234abcdef12345678', 'ethereum', '2024-01-30 11:45:00+00', '2024-01-30 12:30:00+00'),

('880e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440005', 'Flow State Alpha', 'Capturing the essence of creative flow through dynamic, ever-changing patterns.', '/placeholder.svg?height=600&width=600&text=Flow+State', 'QmF1L2O3...FlowState', 'https://ipfs.io/ipfs/QmF1L2O3...FlowStateMeta', 'QmF1L2O3...FlowStateMeta', 'hybrid', 'flow', 4321, 5500, 0.13, 'ai', 1.88, 'ETH', 'available', 'Rare', '1/1', 2987, 198, '1009', '0x0123456789012345678901234abcdef123456789', 'ethereum', '2024-02-08 13:20:00+00', '2024-02-08 14:00:00+00'),

('880e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'Lunar Phases', 'The complete lunar cycle captured in a single, mesmerizing composition.', '/placeholder.svg?height=600&width=600&text=Lunar+Phases', 'QmL1U2N3...Lunar', 'https://ipfs.io/ipfs/QmL1U2N3...LunarMeta', 'QmL1U2N3...LunarMeta', 'celestial', 'lunar', 2847, 4500, 0.10, 'ai', 1.67, 'ETH', 'available', 'Rare', '1/1', 2654, 187, '1010', '0x123456789012345678901234abcdef1234567890', 'ethereum', '2024-02-15 10:10:00+00', '2024-02-15 11:00:00+00'),

('880e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 'Probability Cloud', 'Statistical beauty visualized through color gradients and particle systems.', '/placeholder.svg?height=600&width=600&text=Probability', 'QmP1R2O3...Probability', 'https://ipfs.io/ipfs/QmP1R2O3...ProbabilityMeta', 'QmP1R2O3...ProbabilityMeta', 'probability', 'gradient', 9876, 3500, 0.07, 'svg', 1.45, 'ETH', 'available', 'Rare', '1/1', 2341, 156, '1011', '0x23456789012345678901234abcdef12345678901', 'ethereum', '2024-01-28 14:50:00+00', '2024-01-28 15:30:00+00'),

('880e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 'Statistical Beauty', 'Complex statistical distributions rendered as beautiful, flowing forms.', '/placeholder.svg?height=600&width=600&text=Statistical', 'QmS1T2A3...Statistical', 'https://ipfs.io/ipfs/QmS1T2A3...StatisticalMeta', 'QmS1T2A3...StatisticalMeta', 'probability', 'spectrum', 5432, 4200, 0.12, 'svg', 1.23, 'ETH', 'available', 'Rare', '1/1', 1987, 134, '1012', '0x3456789012345678901234abcdef123456789012', 'ethereum', '2024-02-03 09:25:00+00', '2024-02-03 10:15:00+00'),

-- Common Artworks
('880e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'Perfect Order', 'Clean, minimalist grid showcasing the beauty of perfect mathematical order.', '/placeholder.svg?height=500&width=500&text=Perfect+Order', 'QmP1E2R3...Order', 'https://ipfs.io/ipfs/QmP1E2R3...OrderMeta', 'QmP1E2R3...OrderMeta', 'grid', 'minimal', 1111, 2000, 0.05, 'svg', 1.12, 'ETH', 'available', 'Common', '1/1', 1654, 112, '1013', '0x456789012345678901234abcdef1234567890123', 'ethereum', '2024-01-22 16:00:00+00', '2024-01-22 16:45:00+00'),

('880e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'Checkerboard Dreams', 'Classic checkerboard pattern with a modern, artistic twist.', '/placeholder.svg?height=500&width=500&text=Checkerboard', 'QmC1H2E3...Checkerboard', 'https://ipfs.io/ipfs/QmC1H2E3...CheckerboardMeta', 'QmC1H2E3...CheckerboardMeta', 'grid', 'classic', 2222, 1800, 0.06, 'svg', 1.05, 'ETH', 'available', 'Common', '1/1', 1432, 98, '1014', '0x56789012345678901234abcdef12345678901234', 'ethereum', '2024-01-26 12:15:00+00', '2024-01-26 13:00:00+00'),

('880e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440005', null, 'Structured Harmony', 'Geometric precision meets artistic expression in this structured composition.', '/placeholder.svg?height=500&width=500&text=Structured', 'QmS1T2R3...Structured', 'https://ipfs.io/ipfs/QmS1T2R3...StructuredMeta', 'QmS1T2R3...StructuredMeta', 'grid', 'harmony', 3333, 2200, 0.04, 'svg', 0.95, 'ETH', 'available', 'Common', '1/1', 1298, 87, '1015', '0x6789012345678901234abcdef123456789012345', 'ethereum', '2024-02-07 11:30:00+00', '2024-02-07 12:15:00+00'),

('880e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440005', null, 'Minimal Grid 01', 'The first in a series exploring minimalist grid compositions.', '/placeholder.svg?height=500&width=500&text=Minimal+Grid', 'QmM1I2N3...MinimalGrid', 'https://ipfs.io/ipfs/QmM1I2N3...MinimalGridMeta', 'QmM1I2N3...MinimalGridMeta', 'grid', 'minimal', 4444, 1500, 0.03, 'svg', 0.89, 'ETH', 'available', 'Common', '1/1', 987, 76, '1016', '0x789012345678901234abcdef1234567890123456', 'ethereum', '2024-02-11 15:45:00+00', '2024-02-11 16:30:00+00');

-- Insert Transactions (completed sales)
INSERT INTO transactions (id, artwork_id, seller_id, buyer_id, price, currency, status, tx_hash, block_number, gas_used, gas_price, platform_fee, artist_royalty, created_at, completed_at) VALUES
('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 1.12, 'ETH', 'completed', '0xabc123def456789012345678901234567890123456789012345678901234567890', 18500000, 21000, 0.000000020, 0.0336, 0.112, '2024-01-22 17:00:00+00', '2024-01-22 17:05:00+00'),

('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 1.05, 'ETH', 'completed', '0xdef456789012345678901234567890123456789012345678901234567890abcd', 18500100, 21000, 0.000000019, 0.0315, 0.105, '2024-01-26 13:15:00+00', '2024-01-26 13:20:00+00'),

('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', 1.23, 'ETH', 'completed', '0x789012345678901234567890123456789012345678901234567890123456cdef', 18500200, 21000, 0.000000021, 0.0369, 0.123, '2024-02-03 10:30:00+00', '2024-02-03 10:35:00+00');

-- Insert Artwork Likes
INSERT INTO artwork_likes (artwork_id, user_id, created_at) VALUES
-- Golden Spiral Infinity likes
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '2024-01-15 12:00:00+00'),
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '2024-01-15 13:30:00+00'),
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', '2024-01-15 14:15:00+00'),
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004', '2024-01-15 15:45:00+00'),
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440005', '2024-01-15 16:20:00+00'),

-- Eclipse Phenomenon likes
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '2024-02-01 16:00:00+00'),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '2024-02-01 17:30:00+00'),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', '2024-02-01 18:15:00+00'),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005', '2024-02-01 19:45:00+00'),

-- Add likes for other artworks (sampling)
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', '2024-02-10 11:00:00+00'),
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', '2024-02-10 12:30:00+00'),
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440004', '2024-02-10 13:15:00+00'),

('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', '2024-01-20 18:30:00+00'),
('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', '2024-01-20 19:15:00+00'),
('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440005', '2024-01-20 20:45:00+00'),

('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', '2024-02-05 14:00:00+00'),
('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003', '2024-02-05 15:30:00+00'),

('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', '2024-01-25 10:00:00+00'),
('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440004', '2024-01-25 11:30:00+00'),

('880e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440001', '2024-02-12 17:15:00+00'),
('880e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440005', '2024-02-12 18:45:00+00'),

('880e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440003', '2024-01-30 13:30:00+00'),
('880e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440004', '2024-01-30 14:15:00+00'),

('880e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440002', '2024-02-08 15:00:00+00'),
('880e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440005', '2024-02-08 16:30:00+00'),

('880e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440001', '2024-02-15 12:00:00+00'),
('880e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440004', '2024-02-15 13:30:00+00'),

('880e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', '2024-01-28 16:30:00+00'),
('880e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440003', '2024-01-28 17:15:00+00');

-- Insert Artwork Views (sample data)
INSERT INTO artwork_views (artwork_id, user_id, ip_address, user_agent, created_at) VALUES
-- Views for Golden Spiral Infinity
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2024-01-15 11:30:00+00'),
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '2024-01-15 12:15:00+00'),
('880e8400-e29b-41d4-a716-446655440001', null, '192.168.1.102', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15', '2024-01-15 13:00:00+00'),
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', '192.168.1.103', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', '2024-01-15 14:30:00+00'),

-- Views for Eclipse Phenomenon
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '192.168.1.104', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2024-02-01 15:30:00+00'),
('880e8400-e29b-41d4-a716-446655440002', null, '192.168.1.105', 'Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/109.0 Firefox/115.0', '2024-02-01 16:15:00+00'),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004', '192.168.1.106', 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15', '2024-02-01 17:00:00+00');

-- Insert Follows (users following artists)
INSERT INTO follows (follower_id, following_id, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2024-01-10 10:00:00+00'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '2024-01-12 14:30:00+00'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', '2024-01-15 09:15:00+00'),

('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '2024-01-08 16:45:00+00'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', '2024-01-20 11:20:00+00'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', '2024-02-01 13:10:00+00'),

('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '2024-01-18 12:00:00+00'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '2024-01-25 15:30:00+00'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', '2024-02-05 10:45:00+00'),

('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '2024-01-14 17:20:00+00'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '2024-01-28 14:15:00+00'),

('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '2024-01-22 11:30:00+00'),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '2024-02-08 16:00:00+00'),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006', '2024-02-12 13:45:00+00');

-- Insert Active Bids
INSERT INTO bids (artwork_id, bidder_id, amount, currency, expires_at, is_active, created_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 7.50, 'ETH', '2024-03-15 23:59:59+00', true, '2024-03-01 10:30:00+00'),
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 7.25, 'ETH', '2024-03-15 23:59:59+00', true, '2024-02-28 14:15:00+00'),

('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 5.00, 'ETH', '2024-03-20 23:59:59+00', true, '2024-03-05 16:20:00+00'),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004', 4.80, 'ETH', '2024-03-20 23:59:59+00', true, '2024-03-03 12:45:00+00'),

('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440005', 3.25, 'ETH', '2024-03-25 23:59:59+00', true, '2024-03-10 09:10:00+00'),

('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 2.75, 'ETH', '2024-03-18 23:59:59+00', true, '2024-03-08 15:30:00+00'),

('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440003', 2.30, 'ETH', '2024-03-22 23:59:59+00', true, '2024-03-12 11:45:00+00');

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
