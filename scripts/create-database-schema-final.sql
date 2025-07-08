-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create artists table
CREATE TABLE IF NOT EXISTS artists (
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
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    banner_url TEXT,
    slug TEXT UNIQUE NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create artworks table
CREATE TABLE IF NOT EXISTS artworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    noise DECIMAL(5,3) NOT NULL,
    generation_mode TEXT CHECK (generation_mode IN ('svg', 'ai')) NOT NULL,
    
    -- Marketplace data
    price DECIMAL(20,8) NOT NULL,
    currency TEXT CHECK (currency IN ('ETH', 'USD', 'MATIC')) DEFAULT 'ETH',
    status TEXT CHECK (status IN ('available', 'sold', 'reserved', 'auction')) DEFAULT 'available',
    rarity TEXT CHECK (rarity IN ('Common', 'Rare', 'Epic', 'Legendary')) DEFAULT 'Common',
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
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS artwork_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(artwork_id, user_id)
);

-- Create artwork_views table
CREATE TABLE IF NOT EXISTS artwork_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    bidder_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(20,8) NOT NULL,
    currency TEXT CHECK (currency IN ('ETH', 'USD', 'MATIC')) DEFAULT 'ETH',
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_collection_id ON artworks(collection_id);
CREATE INDEX IF NOT EXISTS idx_artworks_status ON artworks(status);
CREATE INDEX IF NOT EXISTS idx_artworks_price ON artworks(price);
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON artworks(created_at);
CREATE INDEX IF NOT EXISTS idx_artworks_views ON artworks(views);
CREATE INDEX IF NOT EXISTS idx_artworks_likes ON artworks(likes);
CREATE INDEX IF NOT EXISTS idx_artworks_dataset ON artworks(dataset);
CREATE INDEX IF NOT EXISTS idx_artworks_rarity ON artworks(rarity);

CREATE INDEX IF NOT EXISTS idx_transactions_artwork_id ON transactions(artwork_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_artwork_likes_artwork_id ON artwork_likes(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_likes_user_id ON artwork_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_artwork_views_artwork_id ON artwork_views(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_views_created_at ON artwork_views(created_at);

CREATE INDEX IF NOT EXISTS idx_bids_artwork_id ON bids(artwork_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_is_active ON bids(is_active);

CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_artists_updated_at') THEN
        CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_collections_updated_at') THEN
        CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_artworks_updated_at') THEN
        CREATE TRIGGER update_artworks_updated_at BEFORE UPDATE ON artworks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create function to update artist stats
CREATE OR REPLACE FUNCTION update_artist_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total_artworks
    UPDATE artists 
    SET total_artworks = (
        SELECT COUNT(*) 
        FROM artworks 
        WHERE artist_id = COALESCE(NEW.artist_id, OLD.artist_id)
    )
    WHERE id = COALESCE(NEW.artist_id, OLD.artist_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers for artist stats
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_artist_stats_on_artwork_insert') THEN
        CREATE TRIGGER update_artist_stats_on_artwork_insert 
        AFTER INSERT ON artworks 
        FOR EACH ROW EXECUTE FUNCTION update_artist_stats();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_artist_stats_on_artwork_delete') THEN
        CREATE TRIGGER update_artist_stats_on_artwork_delete 
        AFTER DELETE ON artworks 
        FOR EACH ROW EXECUTE FUNCTION update_artist_stats();
    END IF;
END $$;

-- Create function to update artwork metrics
CREATE OR REPLACE FUNCTION update_artwork_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'artwork_likes' THEN
        UPDATE artworks 
        SET likes = (
            SELECT COUNT(*) 
            FROM artwork_likes 
            WHERE artwork_id = COALESCE(NEW.artwork_id, OLD.artwork_id)
        )
        WHERE id = COALESCE(NEW.artwork_id, OLD.artwork_id);
    ELSIF TG_TABLE_NAME = 'artwork_views' THEN
        UPDATE artworks 
        SET views = (
            SELECT COUNT(*) 
            FROM artwork_views 
            WHERE artwork_id = NEW.artwork_id
        )
        WHERE id = NEW.artwork_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers for artwork metrics
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_likes_on_insert') THEN
        CREATE TRIGGER update_likes_on_insert 
        AFTER INSERT ON artwork_likes 
        FOR EACH ROW EXECUTE FUNCTION update_artwork_metrics();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_likes_on_delete') THEN
        CREATE TRIGGER update_likes_on_delete 
        AFTER DELETE ON artwork_likes 
        FOR EACH ROW EXECUTE FUNCTION update_artwork_metrics();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_views_on_insert') THEN
        CREATE TRIGGER update_views_on_insert 
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
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Public read access for artists" ON artists;
    DROP POLICY IF EXISTS "Public read access for users" ON users;
    DROP POLICY IF EXISTS "Public read access for collections" ON collections;
    DROP POLICY IF EXISTS "Public read access for artworks" ON artworks;
    DROP POLICY IF EXISTS "Public read access for transactions" ON transactions;
    DROP POLICY IF EXISTS "Public read access for artwork_likes" ON artwork_likes;
    DROP POLICY IF EXISTS "Public read access for artwork_views" ON artwork_views;
    DROP POLICY IF EXISTS "Public read access for bids" ON bids;
    DROP POLICY IF EXISTS "Public read access for follows" ON follows;
    
    -- Create new policies
    CREATE POLICY "Public read access for artists" ON artists FOR SELECT USING (true);
    CREATE POLICY "Public read access for users" ON users FOR SELECT USING (true);
    CREATE POLICY "Public read access for collections" ON collections FOR SELECT USING (true);
    CREATE POLICY "Public read access for artworks" ON artworks FOR SELECT USING (true);
    CREATE POLICY "Public read access for transactions" ON transactions FOR SELECT USING (true);
    CREATE POLICY "Public read access for artwork_likes" ON artwork_likes FOR SELECT USING (true);
    CREATE POLICY "Public read access for artwork_views" ON artwork_views FOR SELECT USING (true);
    CREATE POLICY "Public read access for bids" ON bids FOR SELECT USING (true);
    CREATE POLICY "Public read access for follows" ON follows FOR SELECT USING (true);
    
    -- Allow public insert for engagement tables
    CREATE POLICY "Public insert for artwork_likes" ON artwork_likes FOR INSERT WITH CHECK (true);
    CREATE POLICY "Public insert for artwork_views" ON artwork_views FOR INSERT WITH CHECK (true);
    CREATE POLICY "Public insert for transactions" ON transactions FOR INSERT WITH CHECK (true);
    CREATE POLICY "Public insert for bids" ON bids FOR INSERT WITH CHECK (true);
    CREATE POLICY "Public insert for follows" ON follows FOR INSERT WITH CHECK (true);
    
    -- Allow public delete for user actions
    CREATE POLICY "Public delete for artwork_likes" ON artwork_likes FOR DELETE USING (true);
    CREATE POLICY "Public delete for follows" ON follows FOR DELETE USING (true);
END $$;
