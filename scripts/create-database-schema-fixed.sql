-- Create custom types
CREATE TYPE rarity_type AS ENUM ('Common', 'Rare', 'Epic', 'Legendary');
CREATE TYPE currency_type AS ENUM ('ETH', 'USD', 'MATIC');
CREATE TYPE artwork_status AS ENUM ('available', 'sold', 'reserved', 'auction');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    website_url TEXT,
    twitter_handle TEXT,
    instagram_handle TEXT,
    verified BOOLEAN DEFAULT false,
    total_sales DECIMAL(20, 8) DEFAULT 0,
    total_artworks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users/Collectors table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    banner_url TEXT,
    slug TEXT UNIQUE NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artworks table
CREATE TABLE IF NOT EXISTS artworks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
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
    noise DECIMAL(5, 4) NOT NULL,
    generation_mode TEXT NOT NULL CHECK (generation_mode IN ('svg', 'ai')),
    
    -- Marketplace data
    price DECIMAL(20, 8) NOT NULL,
    currency currency_type NOT NULL DEFAULT 'ETH',
    status artwork_status DEFAULT 'available',
    rarity rarity_type NOT NULL DEFAULT 'Common',
    edition TEXT NOT NULL DEFAULT '1/1',
    
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(artist_id, title),
    CHECK (price > 0)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES artists(id) ON DELETE SET NULL,
    buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    price DECIMAL(20, 8) NOT NULL,
    currency currency_type NOT NULL,
    status transaction_status DEFAULT 'pending',
    
    -- Blockchain transaction data
    tx_hash TEXT,
    block_number BIGINT,
    gas_used BIGINT,
    gas_price DECIMAL(20, 8),
    
    -- Platform fees
    platform_fee DECIMAL(20, 8) DEFAULT 0,
    artist_royalty DECIMAL(20, 8) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CHECK (price > 0)
);

-- Likes table
CREATE TABLE IF NOT EXISTS artwork_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(artwork_id, user_id)
);

-- Views table
CREATE TABLE IF NOT EXISTS artwork_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follows table (artists following)
CREATE TABLE IF NOT EXISTS artist_follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(follower_id, artist_id)
);

-- Bids table (for auction functionality)
CREATE TABLE IF NOT EXISTS bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    bidder_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(20, 8) NOT NULL,
    currency currency_type NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CHECK (amount > 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_collection_id ON artworks(collection_id);
CREATE INDEX IF NOT EXISTS idx_artworks_status ON artworks(status);
CREATE INDEX IF NOT EXISTS idx_artworks_price ON artworks(price);
CREATE INDEX IF NOT EXISTS idx_artworks_rarity ON artworks(rarity);
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON artworks(created_at);
CREATE INDEX IF NOT EXISTS idx_artworks_dataset ON artworks(dataset);

CREATE INDEX IF NOT EXISTS idx_transactions_artwork_id ON transactions(artwork_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_artwork_likes_artwork_id ON artwork_likes(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_likes_user_id ON artwork_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_artwork_views_artwork_id ON artwork_views(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_views_created_at ON artwork_views(created_at);

CREATE INDEX IF NOT EXISTS idx_artist_follows_follower_id ON artist_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_artist_follows_artist_id ON artist_follows(artist_id);

CREATE INDEX IF NOT EXISTS idx_bids_artwork_id ON bids(artwork_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_is_active ON bids(is_active);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_artists_updated_at') THEN
        CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_collections_updated_at') THEN
        CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_artworks_updated_at') THEN
        CREATE TRIGGER update_artworks_updated_at BEFORE UPDATE ON artworks
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Function to update artwork metrics
CREATE OR REPLACE FUNCTION update_artwork_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'artwork_likes' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE artworks SET likes = likes + 1 WHERE id = NEW.artwork_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE artworks SET likes = likes - 1 WHERE id = OLD.artwork_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'artwork_views' THEN
        UPDATE artworks SET views = views + 1 WHERE id = NEW.artwork_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

-- Create triggers for metrics (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_artwork_likes_count') THEN
        CREATE TRIGGER update_artwork_likes_count 
            AFTER INSERT OR DELETE ON artwork_likes
            FOR EACH ROW EXECUTE FUNCTION update_artwork_metrics();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_artwork_views_count') THEN
        CREATE TRIGGER update_artwork_views_count 
            AFTER INSERT ON artwork_views
            FOR EACH ROW EXECUTE FUNCTION update_artwork_metrics();
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Create simple policies for public marketplace access
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Public artworks are viewable by everyone" ON artworks;
    DROP POLICY IF EXISTS "Public artists are viewable by everyone" ON artists;
    DROP POLICY IF EXISTS "Public collections are viewable by everyone" ON collections;
    DROP POLICY IF EXISTS "Public users are viewable by everyone" ON users;
    DROP POLICY IF EXISTS "Anyone can like artworks" ON artwork_likes;
    DROP POLICY IF EXISTS "Anyone can view artwork views" ON artwork_views;
    DROP POLICY IF EXISTS "Anyone can insert artwork views" ON artwork_views;
    DROP POLICY IF EXISTS "Public transactions are viewable by everyone" ON transactions;
    DROP POLICY IF EXISTS "Public bids are viewable by everyone" ON bids;
    DROP POLICY IF EXISTS "Public follows are viewable by everyone" ON artist_follows;
    
    -- Create new policies
    CREATE POLICY "Public artworks are viewable by everyone" ON artworks FOR SELECT USING (true);
    CREATE POLICY "Public artists are viewable by everyone" ON artists FOR SELECT USING (true);
    CREATE POLICY "Public collections are viewable by everyone" ON collections FOR SELECT USING (true);
    CREATE POLICY "Public users are viewable by everyone" ON users FOR SELECT USING (true);
    CREATE POLICY "Anyone can like artworks" ON artwork_likes FOR ALL USING (true);
    CREATE POLICY "Anyone can view artwork views" ON artwork_views FOR SELECT USING (true);
    CREATE POLICY "Anyone can insert artwork views" ON artwork_views FOR INSERT WITH CHECK (true);
    CREATE POLICY "Public transactions are viewable by everyone" ON transactions FOR SELECT USING (true);
    CREATE POLICY "Public bids are viewable by everyone" ON bids FOR SELECT USING (true);
    CREATE POLICY "Public follows are viewable by everyone" ON artist_follows FOR SELECT USING (true);
END $$;
