-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS artwork_views CASCADE;
DROP TABLE IF EXISTS artwork_likes CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS artworks CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS artists CASCADE;

-- Create artists table
CREATE TABLE artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    website_url TEXT,
    twitter_handle TEXT,
    instagram_handle TEXT,
    verified BOOLEAN DEFAULT FALSE,
    total_sales DECIMAL(20,8) DEFAULT 0,
    total_artworks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    email TEXT,
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collections table
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    banner_url TEXT,
    slug TEXT UNIQUE NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create artworks table
CREATE TABLE artworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    image_ipfs_hash TEXT,
    metadata_url TEXT,
    metadata_ipfs_hash TEXT,
    
    -- Generation parameters
    dataset TEXT NOT NULL,
    color_scheme TEXT NOT NULL,
    seed INTEGER NOT NULL,
    num_samples INTEGER NOT NULL,
    noise DECIMAL(5,4) NOT NULL,
    generation_mode TEXT CHECK (generation_mode IN ('svg', 'ai')) NOT NULL,
    
    -- Marketplace data
    price DECIMAL(20,8) NOT NULL,
    currency TEXT CHECK (currency IN ('ETH', 'USD', 'MATIC')) DEFAULT 'ETH',
    status TEXT CHECK (status IN ('available', 'sold', 'reserved', 'auction')) DEFAULT 'available',
    rarity TEXT CHECK (rarity IN ('Common', 'Rare', 'Epic', 'Legendary')) NOT NULL,
    edition TEXT NOT NULL,
    
    -- Engagement metrics
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    
    -- Blockchain data
    token_id TEXT,
    contract_address TEXT,
    blockchain TEXT DEFAULT 'ethereum',
    
    -- Timestamps
    minted_at TIMESTAMP WITH TIME ZONE,
    listed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    price DECIMAL(20,8) NOT NULL,
    currency TEXT CHECK (currency IN ('ETH', 'USD', 'MATIC')) DEFAULT 'ETH',
    status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
    tx_hash TEXT,
    block_number BIGINT,
    gas_used BIGINT,
    gas_price DECIMAL(20,8),
    platform_fee DECIMAL(20,8) DEFAULT 0,
    artist_royalty DECIMAL(20,8) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create artwork_likes table
CREATE TABLE artwork_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(artwork_id, user_id)
);

-- Create artwork_views table
CREATE TABLE artwork_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bids table
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(20,8) NOT NULL,
    currency TEXT CHECK (currency IN ('ETH', 'USD', 'MATIC')) DEFAULT 'ETH',
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create follows table
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Create indexes for performance
CREATE INDEX idx_artworks_artist_id ON artworks(artist_id);
CREATE INDEX idx_artworks_collection_id ON artworks(collection_id);
CREATE INDEX idx_artworks_status ON artworks(status);
CREATE INDEX idx_artworks_rarity ON artworks(rarity);
CREATE INDEX idx_artworks_price ON artworks(price);
CREATE INDEX idx_artworks_created_at ON artworks(created_at);
CREATE INDEX idx_artworks_views ON artworks(views);
CREATE INDEX idx_artworks_likes ON artworks(likes);

CREATE INDEX idx_transactions_artwork_id ON transactions(artwork_id);
CREATE INDEX idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

CREATE INDEX idx_artwork_likes_artwork_id ON artwork_likes(artwork_id);
CREATE INDEX idx_artwork_likes_user_id ON artwork_likes(user_id);

CREATE INDEX idx_artwork_views_artwork_id ON artwork_views(artwork_id);
CREATE INDEX idx_artwork_views_created_at ON artwork_views(created_at);

CREATE INDEX idx_collections_artist_id ON collections(artist_id);
CREATE INDEX idx_collections_is_featured ON collections(is_featured);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artworks_updated_at BEFORE UPDATE ON artworks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for automatic metrics updates
CREATE OR REPLACE FUNCTION update_artwork_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE artworks SET likes = likes + 1 WHERE id = NEW.artwork_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE artworks SET likes = likes - 1 WHERE id = OLD.artwork_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER artwork_likes_count_trigger
    AFTER INSERT OR DELETE ON artwork_likes
    FOR EACH ROW EXECUTE FUNCTION update_artwork_likes_count();

-- Create trigger for updating artist stats
CREATE OR REPLACE FUNCTION update_artist_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE artists SET total_artworks = total_artworks + 1 WHERE id = NEW.artist_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE artists SET total_artworks = total_artworks - 1 WHERE id = OLD.artist_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER artist_stats_trigger
    AFTER INSERT OR DELETE ON artworks
    FOR EACH ROW EXECUTE FUNCTION update_artist_stats();

-- Enable Row Level Security
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (marketplace is public)
CREATE POLICY "Public read access for artists" ON artists FOR SELECT USING (true);
CREATE POLICY "Public read access for users" ON users FOR SELECT USING (true);
CREATE POLICY "Public read access for collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Public read access for artworks" ON artworks FOR SELECT USING (true);
CREATE POLICY "Public read access for transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Public read access for artwork_likes" ON artwork_likes FOR SELECT USING (true);
CREATE POLICY "Public read access for artwork_views" ON artwork_views FOR SELECT USING (true);
CREATE POLICY "Public read access for bids" ON bids FOR SELECT USING (true);
CREATE POLICY "Public read access for follows" ON follows FOR SELECT USING (true);

-- Allow public insert for engagement tracking
CREATE POLICY "Public insert for artwork_views" ON artwork_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert for artwork_likes" ON artwork_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete for artwork_likes" ON artwork_likes FOR DELETE USING (true);
