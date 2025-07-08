-- Insert Artists
INSERT INTO artists (id, wallet_address, username, display_name, bio, avatar_url, banner_url, website_url, twitter_handle, instagram_handle, verified, total_sales, total_artworks) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '0x1234567890abcdef1234567890abcdef12345678', 'flowmaster', 'FlowMaster', 'Pioneer of spiral art generation. Creating mathematical beauty through algorithmic flow patterns.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=300&fit=crop', 'https://flowmaster.art', 'flowmaster_art', 'flowmaster.art', true, 25.7, 18),
('b2c3d4e5-f6g7-8901-bcde-f23456789012', '0x2345678901bcdef12345678901bcdef234567890', 'pixelartist', 'PixelArtist', 'Digital grid specialist crafting perfect geometric harmony through computational precision.', 'https://images.unsplash.com/photo-1494790108755-2616c9c1e4c3?w=150&h=150&fit=crop&crop=face', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=300&fit=crop', 'https://pixelart.digital', 'pixel_artist', 'pixelartist', true, 18.3, 14),
('c3d4e5f6-g7h8-9012-cdef-345678901234', '0x3456789012cdef123456789012cdef3456789012', 'celestialcreator', 'CelestialCreator', 'Exploring cosmic phenomena through generative art. Each piece captures the essence of celestial mechanics.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=300&fit=crop', 'https://celestial.space', 'celestial_art', 'celestialcreator', true, 22.1, 12),
('d4e5f6g7-h8i9-0123-def4-56789012345a', '0x456789012def3456789012def45678901234567a', 'mathartist', 'MathArtist', 'Visualizing probability distributions and statistical beauty through algorithmic art generation.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=300&fit=crop', 'https://mathvisual.art', 'math_artist', 'mathartist', false, 14.2, 10),
('e5f6g7h8-i9j0-1234-ef56-789012345abc', '0x56789012ef456789012ef45678901234567890ab', 'gridmaster', 'GridMaster', 'Minimalist approach to grid-based generative art. Perfection through mathematical precision.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=300&fit=crop', 'https://gridperfect.art', 'grid_master', 'gridmaster', false, 8.8, 8),
('f6g7h8i9-j0k1-2345-fg67-89012345abcd', '0x6789012fg56789012fg567890123456789012abc', 'abstractflow', 'AbstractFlow', 'Experimental artist pushing boundaries of generative flow art. Hybrid techniques for unique expressions.', 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=300&fit=crop', 'https://abstractflow.studio', 'abstract_flow', 'abstractflow', true, 31.5, 22);

-- Insert Collections
INSERT INTO collections (id, artist_id, name, description, banner_url, slug, is_featured) VALUES
('col1-2345-6789-abcd-ef1234567890', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cosmic Spirals', 'A journey through mathematical spirals inspired by cosmic phenomena and celestial mechanics.', 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop', 'cosmic-spirals', true),
('col2-3456-789a-bcde-f23456789012', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 'Digital Grids', 'Perfect geometric harmony through computational precision and algorithmic grid generation.', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=400&fit=crop', 'digital-grids', true),
('col3-4567-89ab-cdef-345678901234', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 'Lunar Series', 'Capturing the phases and beauty of lunar cycles through generative art techniques.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop', 'lunar-series', true),
('col4-5678-9abc-def4-56789012345a', 'd4e5f6g7-h8i9-0123-def4-56789012345a', 'Probability Clouds', 'Visualizing statistical distributions and probability theory through artistic expression.', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=400&fit=crop', 'probability-clouds', true),
('col5-6789-abcd-ef56-789012345abc', 'f6g7h8i9-j0k1-2345-fg67-89012345abcd', 'Hybrid Dimensions', 'Experimental fusion of multiple generative techniques creating unique dimensional artworks.', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop', 'hybrid-dimensions', true);

-- Insert Users (Collectors)
INSERT INTO users (id, wallet_address, username, display_name, bio, avatar_url, email) VALUES
('user1-234-567-890-abcdef123456', '0xabcdef123456789abcdef123456789abcdef1234', 'collector_prime', 'Prime Collector', 'Passionate collector of generative art and mathematical beauty.', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face', 'prime@collectors.art'),
('user2-345-678-901-bcdef2345678', '0xbcdef23456789abcdef23456789abcdef23456789', 'artlover_eth', 'ETH Art Lover', 'Ethereum-based art enthusiast with focus on algorithmic creations.', 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face', 'eth@artlovers.com'),
('user3-456-789-012-cdef34567890', '0xcdef3456789abcdef3456789abcdef345678901a', 'flow_enthusiast', 'Flow Enthusiast', 'Dedicated to collecting flow-based generative artworks.', 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=150&h=150&fit=crop&crop=face', 'flow@enthusiasts.art'),
('user4-567-890-123-def456789012', '0xdef456789abcdef456789abcdef4567890123456', 'digital_curator', 'Digital Curator', 'Curating the finest digital art pieces for future generations.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face', 'curator@digital.gallery'),
('user5-678-901-234-ef56789012ab', '0xef56789012abcdef56789012abcdef567890123a', 'math_collector', 'Math Collector', 'Collecting mathematical art that bridges science and creativity.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'math@collectors.science');

-- Insert Artworks
INSERT INTO artworks (id, artist_id, collection_id, title, description, image_url, image_ipfs_hash, metadata_url, metadata_ipfs_hash, dataset, color_scheme, seed, num_samples, noise, generation_mode, price, currency, status, rarity, edition, views, likes, token_id, contract_address, blockchain, minted_at, listed_at) VALUES
-- Legendary Artworks
('art1-2345-6789-abcd-ef1234567890', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'col1-2345-6789-abcd-ef1234567890', 'Golden Spiral Infinity', 'A mesmerizing golden spiral that seems to extend infinitely, created using advanced mathematical algorithms and the golden ratio.', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=800&fit=crop', 'QmX1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T', 'https://ipfs.io/ipfs/QmMetadata1Golden', 'QmMeta1Golden2Spiral3Infinity4Data5Hash6', 'spirals', 'magma', 7777, 5000, 0.02, 'ai', 7.77, 'ETH', 'available', 'Legendary', '1/1 Legendary', 8901, 678, '12345', '0x1234567890abcdef1234567890abcdef12345678', 'ethereum', '2024-01-15 10:30:00', '2024-01-15 11:00:00'),
('art2-3456-789a-bcde-f23456789012', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 'col3-4567-89ab-cdef-345678901234', 'Eclipse Phenomenon', 'Capturing the rare beauty of a solar eclipse through generative art, with dynamic light and shadow interplay.', 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=800&fit=crop', 'QmY2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U', 'https://ipfs.io/ipfs/QmMetadata2Eclipse', 'QmMeta2Eclipse3Phenomenon4Data5Hash7', 'moons', 'plasma', 2024, 3000, 0.01, 'ai', 5.25, 'ETH', 'available', 'Legendary', '1/1 Legendary', 7234, 567, '12346', '0x2345678901bcdef12345678901bcdef234567890', 'ethereum', '2024-01-20 14:15:00', '2024-01-20 15:00:00'),
('art3-4567-89ab-cdef-345678901234', 'f6g7h8i9-j0k1-2345-fg67-89012345abcd', 'col5-6789-abcd-ef56-789012345abc', 'Dimensional Fusion', 'An experimental piece that fuses multiple dimensional perspectives into a single cohesive artwork.', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop', 'QmZ3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V', 'https://ipfs.io/ipfs/QmMetadata3Dimensional', 'QmMeta3Dimensional4Fusion5Data6Hash8', 'gaussian', 'viridis', 3333, 4000, 0.03, 'ai', 3.50, 'ETH', 'available', 'Legendary', '1/1 Legendary', 6789, 456, '12347', '0x3456789012cdef123456789012cdef3456789012', 'ethereum', '2024-01-25 09:45:00', '2024-01-25 10:30:00'),

-- Epic Artworks
('art4-5678-9abc-def4-56789012345a', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 'col2-3456-789a-bcde-f23456789012', 'Digital Grid Symphony', 'A harmonious composition of digital grids that create a symphony of geometric patterns and mathematical precision.', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=800&fit=crop', 'QmA4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W', 'https://ipfs.io/ipfs/QmMetadata4Digital', 'QmMeta4Digital5Grid6Symphony7Hash9', 'grid', 'cividis', 1111, 2000, 0.01, 'svg', 2.90, 'ETH', 'available', 'Epic', '1/5 Epic', 5432, 345, '12348', '0x456789012def3456789012def45678901234567a', 'ethereum', '2024-02-01 16:20:00', '2024-02-01 17:00:00'),
('art5-6789-abcd-ef56-789012345abc', 'f6g7h8i9-j0k1-2345-fg67-89012345abcd', 'col5-6789-abcd-ef56-789012345abc', 'Binary Dreams', 'Exploring the intersection of binary code and artistic expression through generative algorithms.', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=800&fit=crop', 'QmB5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X', 'https://ipfs.io/ipfs/QmMetadata5Binary', 'QmMeta5Binary6Dreams7Data8Hash10', 'checkerboard', 'grayscale', 1010, 1500, 0.02, 'ai', 2.75, 'ETH', 'available', 'Epic', '2/5 Epic', 4987, 298, '12349', '0x56789012ef456789012ef45678901234567890ab', 'ethereum', '2024-02-05 11:10:00', '2024-02-05 12:00:00'),
('art6-789a-bcde-f678-9012345abcde', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 'col3-4567-89ab-cdef-345678901234', 'Cosmic Vortex', 'A swirling cosmic vortex that draws viewers into its hypnotic mathematical beauty.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop', 'QmC6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y', 'https://ipfs.io/ipfs/QmMetadata6Cosmic', 'QmMeta6Cosmic7Vortex8Data9Hash11', 'spirals', 'plasma', 2222, 3500, 0.025, 'ai', 2.45, 'ETH', 'available', 'Epic', '3/5 Epic', 4321, 267, '12350', '0x6789012fg56789012fg567890123456789012abc', 'ethereum', '2024-02-10 13:30:00', '2024-02-10 14:15:00'),
('art7-89ab-cdef-7890-12345abcdef6', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'col1-2345-6789-abcd-ef1234567890', 'Celestial Arcs', 'Graceful arcs inspired by celestial movements and orbital mechanics, rendered in flowing mathematical curves.', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop', 'QmD7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z', 'https://ipfs.io/ipfs/QmMetadata7Celestial', 'QmMeta7Celestial8Arcs9Data10Hash12', 'moons', 'magma', 1234, 2500, 0.015, 'svg', 1.95, 'ETH', 'available', 'Epic', '4/5 Epic', 3876, 234, '12351', '0x1234567890abcdef1234567890abcdef12345678', 'ethereum', '2024-02-15 08:45:00', '2024-02-15 09:30:00'),

-- Rare Artworks
('art8-9abc-def7-8901-2345abcdef67', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'col1-2345-6789-abcd-ef1234567890', 'Fibonacci Dreams', 'A dreamy interpretation of the Fibonacci sequence through spiral generation and golden ratio mathematics.', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=800&fit=crop', 'QmE8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A', 'https://ipfs.io/ipfs/QmMetadata8Fibonacci', 'QmMeta8Fibonacci9Dreams10Hash13', 'spirals', 'viridis', 1618, 1800, 0.02, 'svg', 1.89, 'ETH', 'available', 'Rare', '1/10 Rare', 3245, 189, '12352', '0x2345678901bcdef12345678901bcdef234567890', 'ethereum', '2024-02-20 15:20:00', '2024-02-20 16:00:00'),
('art9-abcd-ef78-9012-345abcdef678', 'f6g7h8i9-j0k1-2345-fg67-89012345abcd', 'col5-6789-abcd-ef56-789012345abc', 'Flow State Alpha', 'Capturing the essence of flow state through dynamic algorithmic generation and fluid mathematical expressions.', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=800&fit=crop', 'QmF9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B', 'https://ipfs.io/ipfs/QmMetadata9Flow', 'QmMeta9Flow10State11Alpha12Hash14', 'gaussian', 'plasma', 4321, 2200, 0.03, 'ai', 1.88, 'ETH', 'available', 'Rare', '2/10 Rare', 2987, 156, '12353', '0x3456789012cdef123456789012cdef3456789012', 'ethereum', '2024-02-25 12:10:00', '2024-02-25 13:00:00'),
('art10-bcde-f789-0123-45abcdef789', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 'col3-4567-89ab-cdef-345678901234', 'Lunar Phases', 'A complete cycle of lunar phases captured through generative art, showing the beauty of celestial timing.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop', 'QmG0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C', 'https://ipfs.io/ipfs/QmMetadata10Lunar', 'QmMeta10Lunar11Phases12Data13Hash15', 'moons', 'cividis', 2829, 1600, 0.018, 'svg', 1.67, 'ETH', 'available', 'Rare', '3/10 Rare', 2654, 134, '12354', '0x456789012def3456789012def45678901234567a', 'ethereum', '2024-03-01 10:30:00', '2024-03-01 11:15:00'),
('art11-cdef-789a-0123-4abcdef789a', 'd4e5f6g7-h8i9-0123-def4-56789012345a', 'col4-5678-9abc-def4-56789012345a', 'Probability Cloud', 'A visualization of probability distributions creating cloud-like formations through statistical beauty.', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=800&fit=crop', 'QmH1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D', 'https://ipfs.io/ipfs/QmMetadata11Probability', 'QmMeta11Probability12Cloud13Hash16', 'gaussian', 'magma', 3141, 2800, 0.025, 'ai', 1.45, 'ETH', 'available', 'Rare', '4/10 Rare', 2198, 112, '12355', '0x56789012ef456789012ef45678901234567890ab', 'ethereum', '2024-03-05 14:45:00', '2024-03-05 15:30:00'),
('art12-def7-89ab-0123-abcdef789ab', 'd4e5f6g7-h8i9-0123-def4-56789012345a', 'col4-5678-9abc-def4-56789012345a', 'Statistical Beauty', 'Finding beauty in statistical patterns and mathematical distributions through generative visualization.', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=800&fit=crop', 'QmI2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3E', 'https://ipfs.io/ipfs/QmMetadata12Statistical', 'QmMeta12Statistical13Beauty14Hash17', 'checkerboard', 'viridis', 2718, 1900, 0.022, 'svg', 1.23, 'ETH', 'available', 'Rare', '5/10 Rare', 1876, 98, '12356', '0x6789012fg56789012fg567890123456789012abc', 'ethereum', '2024-03-10 09:15:00', '2024-03-10 10:00:00'),

-- Common Artworks
('art13-ef78-9abc-0123-bcdef789abc', 'e5f6g7h8-i9j0-1234-ef56-789012345abc', NULL, 'Perfect Order', 'A minimalist grid showcasing perfect mathematical order and geometric precision.', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=800&fit=crop', 'QmJ3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3E4F', 'https://ipfs.io/ipfs/QmMetadata13Perfect', 'QmMeta13Perfect14Order15Data16Hash18', 'grid', 'grayscale', 1000, 1000, 0.01, 'svg', 1.12, 'ETH', 'available', 'Common', '1/25 Common', 1543, 87, '12357', '0x1234567890abcdef1234567890abcdef12345678', 'ethereum', '2024-03-15 11:20:00', '2024-03-15 12:00:00'),
('art14-f789-abcd-0123-cdef789abcd', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 'col2-3456-789a-bcde-f23456789012', 'Checkerboard Dreams', 'Classic checkerboard pattern reimagined through modern generative techniques and algorithmic precision.', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=800&fit=crop', 'QmK4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3E4F5G', 'https://ipfs.io/ipfs/QmMetadata14Checkerboard', 'QmMeta14Checkerboard15Dreams16Hash19', 'checkerboard', 'cividis', 1212, 1200, 0.015, 'svg', 1.05, 'ETH', 'available', 'Common', '2/25 Common', 1298, 76, '12358', '0x2345678901bcdef12345678901bcdef234567890', 'ethereum', '2024-03-20 13:40:00', '2024-03-20 14:30:00'),
('art15-789a-bcde-0123-def789abcde', 'e5f6g7h8-i9j0-1234-ef56-789012345abc', NULL, 'Structured Harmony', 'Finding harmony in structured patterns through careful mathematical arrangement and grid-based design.', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=800&fit=crop', 'QmL5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3E4F5G6H', 'https://ipfs.io/ipfs/QmMetadata15Structured', 'QmMeta15Structured16Harmony17Hash20', 'grid', 'plasma', 1515, 1100, 0.012, 'svg', 0.95, 'ETH', 'available', 'Common', '3/25 Common', 1087, 65, '12359', '0x3456789012cdef123456789012cdef3456789012', 'ethereum', '2024-03-25 16:10:00', '2024-03-25 17:00:00'),
('art16-89ab-cdef-0123-ef789abcdef', 'e5f6g7h8-i9j0-1234-ef56-789012345abc', NULL, 'Minimal Grid 01', 'The first in a series of minimal grid explorations, focusing on essential geometric relationships.', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=800&fit=crop', 'QmM6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3E4F5G6H7I', 'https://ipfs.io/ipfs/QmMetadata16Minimal', 'QmMeta16Minimal17Grid18Data19Hash21', 'grid', 'magma', 1001, 900, 0.008, 'svg', 0.89, 'ETH', 'available', 'Common', '4/25 Common', 987, 56, '12360', '0x456789012def3456789012def45678901234567a', 'ethereum', '2024-03-30 08:25:00', '2024-03-30 09:15:00');

-- Insert Artwork Likes
INSERT INTO artwork_likes (artwork_id, user_id) VALUES
('art1-2345-6789-abcd-ef1234567890', 'user1-234-567-890-abcdef123456'),
('art1-2345-6789-abcd-ef1234567890', 'user2-345-678-901-bcdef2345678'),
('art1-2345-6789-abcd-ef1234567890', 'user3-456-789-012-cdef34567890'),
('art2-3456-789a-bcde-f23456789012', 'user1-234-567-890-abcdef123456'),
('art2-3456-789a-bcde-f23456789012', 'user4-567-890-123-def456789012'),
('art3-4567-89ab-cdef-345678901234', 'user2-345-678-901-bcdef2345678'),
('art3-4567-89ab-cdef-345678901234', 'user5-678-901-234-ef56789012ab'),
('art4-5678-9abc-def4-56789012345a', 'user1-234-567-890-abcdef123456'),
('art4-5678-9abc-def4-56789012345a', 'user3-456-789-012-cdef34567890'),
('art5-6789-abcd-ef56-789012345abc', 'user2-345-678-901-bcdef2345678'),
('art6-789a-bcde-f678-9012345abcde', 'user4-567-890-123-def456789012'),
('art7-89ab-cdef-7890-12345abcdef6', 'user5-678-901-234-ef56789012ab'),
('art8-9abc-def7-8901-2345abcdef67', 'user1-234-567-890-abcdef123456'),
('art9-abcd-ef78-9012-345abcdef678', 'user3-456-789-012-cdef34567890'),
('art10-bcde-f789-0123-45abcdef789', 'user2-345-678-901-bcdef2345678'),
('art11-cdef-789a-0123-4abcdef789a', 'user4-567-890-123-def456789012'),
('art12-def7-89ab-0123-abcdef789ab', 'user5-678-901-234-ef56789012ab'),
('art13-ef78-9abc-0123-bcdef789abc', 'user1-234-567-890-abcdef123456'),
('art14-f789-abcd-0123-cdef789abcd', 'user2-345-678-901-bcdef2345678'),
('art15-789a-bcde-0123-def789abcde', 'user3-456-789-012-cdef34567890'),
('art16-89ab-cdef-0123-ef789abcdef', 'user4-567-890-123-def456789012'),
('art1-2345-6789-abcd-ef1234567890', 'user4-567-890-123-def456789012'),
('art2-3456-789a-bcde-f23456789012', 'user3-456-789-012-cdef34567890'),
('art3-4567-89ab-cdef-345678901234', 'user1-234-567-890-abcdef123456'),
('art4-5678-9abc-def4-56789012345a', 'user5-678-901-234-ef56789012ab');

-- Insert Sample Artwork Views
INSERT INTO artwork_views (artwork_id, user_id, ip_address) VALUES
('art1-2345-6789-abcd-ef1234567890', 'user1-234-567-890-abcdef123456', '192.168.1.100'),
('art1-2345-6789-abcd-ef1234567890', 'user2-345-678-901-bcdef2345678', '10.0.0.50'),
('art1-2345-6789-abcd-ef1234567890', NULL, '203.0.113.45'),
('art2-3456-789a-bcde-f23456789012', 'user3-456-789-012-cdef34567890', '172.16.0.25'),
('art2-3456-789a-bcde-f23456789012', NULL, '198.51.100.75'),
('art3-4567-89ab-cdef-345678901234', 'user4-567-890-123-def456789012', '192.0.2.150'),
('art4-5678-9abc-def4-56789012345a', 'user5-678-901-234-ef56789012ab', '203.0.113.200');

-- Insert Follows
INSERT INTO follows (follower_id, following_id) VALUES
('user1-234-567-890-abcdef123456', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('user1-234-567-890-abcdef123456', 'c3d4e5f6-g7h8-9012-cdef-345678901234'),
('user2-345-678-901-bcdef2345678', 'b2c3d4e5-f6g7-8901-bcde-f23456789012'),
('user2-345-678-901-bcdef2345678', 'f6g7h8i9-j0k1-2345-fg67-89012345abcd'),
('user3-456-789-012-cdef34567890', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('user3-456-789-012-cdef34567890', 'd4e5f6g7-h8i9-0123-def4-56789012345a'),
('user4-567-890-123-def456789012', 'c3d4e5f6-g7h8-9012-cdef-345678901234'),
('user4-567-890-123-def456789012', 'e5f6g7h8-i9j0-1234-ef56-789012345abc'),
('user5-678-901-234-ef56789012ab', 'f6g7h8i9-j0k1-2345-fg67-89012345abcd'),
('user5-678-901-234-ef56789012ab', 'd4e5f6g7-h8i9-0123-def4-56789012345a');

-- Insert Completed Transactions
INSERT INTO transactions (artwork_id, seller_id, buyer_id, price, currency, status, tx_hash, block_number, gas_used, gas_price, platform_fee, artist_royalty, completed_at) VALUES
('art1-2345-6789-abcd-ef1234567890', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'user1-234-567-890-abcdef123456', 7.77, 'ETH', 'completed', '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab', 18500000, 21000, 20.5, 0.1943, 0.3885, '2024-01-15 12:30:00'),
('art8-9abc-def7-8901-2345abcdef67', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'user3-456-789-012-cdef34567890', 1.89, 'ETH', 'completed', '0xbcdef23456789abcdef23456789abcdef23456789abcdef23456789abcdef234567', 18501500, 21000, 18.2, 0.0473, 0.0945, '2024-02-20 17:45:00'),
('art13-ef78-9abc-0123-bcdef789abc', 'e5f6g7h8-i9j0-1234-ef56-789012345abc', 'user2-345-678-901-bcdef2345678', 1.12, 'ETH', 'completed', '0xcdef3456789abcdef3456789abcdef3456789abcdef3456789abcdef3456789abc', 18502000, 21000, 19.8, 0.028, 0.056, '2024-03-15 13:20:00');

-- Insert Active Bids
INSERT INTO bids (artwork_id, bidder_id, amount, currency, expires_at, is_active) VALUES
('art2-3456-789a-bcde-f23456789012', 'user2-345-678-901-bcdef2345678', 4.8, 'ETH', '2024-12-31 23:59:59', true),
('art3-4567-89ab-cdef-345678901234', 'user4-567-890-123-def456789012', 3.2, 'ETH', '2024-12-25 18:00:00', true),
('art4-5678-9abc-def4-56789012345a', 'user1-234-567-890-abcdef123456', 2.5, 'ETH', '2024-12-20 15:30:00', true),
('art5-6789-abcd-ef56-789012345abc', 'user5-678-901-234-ef56789012ab', 2.3, 'ETH', '2024-12-28 12:00:00', true),
('art6-789a-bcde-f678-9012345abcde', 'user3-456-789-012-cdef34567890', 2.1, 'ETH', '2024-12-22 20:45:00', true),
('art10-bcde-f789-0123-45abcdef789', 'user1-234-567-890-abcdef123456', 1.5, 'ETH', '2024-12-30 14:15:00', true),
('art11-cdef-789a-0123-4abcdef789a', 'user2-345-678-901-bcdef2345678', 1.3, 'ETH', '2024-12-26 16:30:00', true);
