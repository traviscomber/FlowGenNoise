-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First, add missing columns to existing tables
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS owner_address TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS purchase_transaction_hash TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS sold_at TIMESTAMP WITH TIME ZONE;

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(20, 8) DEFAULT 0;

-- Create blockchain_transactions table
CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tx_hash TEXT NOT NULL UNIQUE,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('mint', 'purchase', 'transfer', 'list', 'delist')),
    chain_id INTEGER NOT NULL,
    value TEXT, -- Wei amount as string
    gas_used TEXT,
    gas_price TEXT,
    token_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    block_number BIGINT,
    block_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nft_metadata table
CREATE TABLE IF NOT EXISTS nft_metadata (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    token_id TEXT NOT NULL,
    contract_address TEXT NOT NULL,
    chain_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    metadata_url TEXT NOT NULL,
    attributes JSONB DEFAULT '[]',
    creator_address TEXT NOT NULL,
    owner_address TEXT NOT NULL,
    is_listed BOOLEAN DEFAULT FALSE,
    list_price DECIMAL(20, 8),
    royalty_percentage DECIMAL(5, 2) DEFAULT 10.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(token_id, contract_address, chain_id)
);

-- Create wallet_connections table
CREATE TABLE IF NOT EXISTS wallet_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT NOT NULL UNIQUE,
    chain_id INTEGER NOT NULL,
    last_connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    connection_count INTEGER DEFAULT 1,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gas_tracker table for monitoring gas prices
CREATE TABLE IF NOT EXISTS gas_tracker (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chain_id INTEGER NOT NULL,
    gas_price_gwei DECIMAL(10, 2) NOT NULL,
    fast_gas_price DECIMAL(10, 2),
    standard_gas_price DECIMAL(10, 2),
    safe_gas_price DECIMAL(10, 2),
    block_number BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketplace_stats table
CREATE TABLE IF NOT EXISTS marketplace_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    total_volume DECIMAL(20, 8) DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    total_nfts INTEGER DEFAULT 0,
    active_listings INTEGER DEFAULT 0,
    unique_owners INTEGER DEFAULT 0,
    average_price DECIMAL(20, 8) DEFAULT 0,
    floor_price DECIMAL(20, 8) DEFAULT 0,
    chain_id INTEGER NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(chain_id)
);

-- Create purchases table to track NFT purchases
CREATE TABLE IF NOT EXISTS purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    buyer_id TEXT NOT NULL,
    seller_id TEXT NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    transaction_hash TEXT NOT NULL,
    blockchain_network TEXT,
    platform_fee DECIMAL(20, 8) DEFAULT 0,
    artist_royalty DECIMAL(20, 8) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_from_address ON blockchain_transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_to_address ON blockchain_transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_chain_id ON blockchain_transactions(chain_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_type ON blockchain_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_status ON blockchain_transactions(status);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_created_at ON blockchain_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_nft_metadata_owner ON nft_metadata(owner_address);
CREATE INDEX IF NOT EXISTS idx_nft_metadata_creator ON nft_metadata(creator_address);
CREATE INDEX IF NOT EXISTS idx_nft_metadata_chain_id ON nft_metadata(chain_id);
CREATE INDEX IF NOT EXISTS idx_nft_metadata_listed ON nft_metadata(is_listed);
CREATE INDEX IF NOT EXISTS idx_nft_metadata_price ON nft_metadata(list_price);

CREATE INDEX IF NOT EXISTS idx_wallet_connections_address ON wallet_connections(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_chain ON wallet_connections(chain_id);

CREATE INDEX IF NOT EXISTS idx_gas_tracker_chain_id ON gas_tracker(chain_id);
CREATE INDEX IF NOT EXISTS idx_gas_tracker_created_at ON gas_tracker(created_at);

CREATE INDEX IF NOT EXISTS idx_purchases_artwork_id ON purchases(artwork_id);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_id ON purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_seller_id ON purchases(seller_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);

-- Add indexes for new artwork columns
CREATE INDEX IF NOT EXISTS idx_artworks_owner_address ON artworks(owner_address);
CREATE INDEX IF NOT EXISTS idx_artworks_purchase_tx ON artworks(purchase_transaction_hash);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_blockchain_transactions_updated_at 
    BEFORE UPDATE ON blockchain_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nft_metadata_updated_at 
    BEFORE UPDATE ON nft_metadata 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallet_connections_updated_at 
    BEFORE UPDATE ON wallet_connections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RPC functions for updating stats
CREATE OR REPLACE FUNCTION update_artist_earnings(artist_wallet TEXT, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
    -- Update user earnings
    UPDATE users 
    SET total_earnings = COALESCE(total_earnings, 0) + amount,
        updated_at = NOW()
    WHERE wallet_address = artist_wallet;
    
    -- If user doesn't exist, this won't fail
    IF NOT FOUND THEN
        RAISE NOTICE 'Artist wallet % not found in users table', artist_wallet;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_marketplace_stats(total_volume DECIMAL, total_sales INTEGER)
RETURNS VOID AS $$
BEGIN
    -- Update marketplace stats for all chains
    INSERT INTO marketplace_stats (chain_id, total_volume, total_sales, updated_at)
    VALUES (1, total_volume, total_sales, NOW())
    ON CONFLICT (chain_id) 
    DO UPDATE SET 
        total_volume = marketplace_stats.total_volume + EXCLUDED.total_volume,
        total_sales = marketplace_stats.total_sales + EXCLUDED.total_sales,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE blockchain_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE gas_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for blockchain_transactions
CREATE POLICY "Users can view their own transactions" ON blockchain_transactions
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert transactions" ON blockchain_transactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update transactions" ON blockchain_transactions
    FOR UPDATE USING (true);

-- Create policies for nft_metadata
CREATE POLICY "Anyone can view NFT metadata" ON nft_metadata
    FOR SELECT USING (true);

CREATE POLICY "Anyone can update NFT metadata" ON nft_metadata
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can insert NFT metadata" ON nft_metadata
    FOR INSERT WITH CHECK (true);

-- Create policies for wallet_connections
CREATE POLICY "Anyone can view wallet connections" ON wallet_connections
    FOR SELECT USING (true);

CREATE POLICY "Anyone can manage connections" ON wallet_connections
    FOR ALL USING (true);

-- Create policies for gas_tracker
CREATE POLICY "Anyone can view gas prices" ON gas_tracker
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert gas data" ON gas_tracker
    FOR INSERT WITH CHECK (true);

-- Create policies for marketplace_stats
CREATE POLICY "Anyone can view marketplace stats" ON marketplace_stats
    FOR SELECT USING (true);

CREATE POLICY "Anyone can update stats" ON marketplace_stats
    FOR ALL USING (true);

-- Create policies for purchases
CREATE POLICY "Anyone can view purchases" ON purchases
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert purchases" ON purchases
    FOR INSERT WITH CHECK (true);

-- Insert initial marketplace stats for supported chains
INSERT INTO marketplace_stats (chain_id, total_volume, total_sales, total_nfts, active_listings, unique_owners, average_price, floor_price)
VALUES 
    (1, 0, 0, 0, 0, 0, 0, 0),      -- Ethereum Mainnet
    (11155111, 0, 0, 0, 0, 0, 0, 0), -- Sepolia Testnet
    (137, 0, 0, 0, 0, 0, 0, 0),    -- Polygon Mainnet
    (80001, 0, 0, 0, 0, 0, 0, 0)   -- Mumbai Testnet
ON CONFLICT (chain_id) DO NOTHING;

-- Create view for user NFT portfolio
CREATE OR REPLACE VIEW user_nft_portfolio AS
SELECT 
    u.wallet_address,
    u.username,
    COUNT(n.id) as nft_count,
    SUM(CASE WHEN n.is_listed THEN 1 ELSE 0 END) as listed_count,
    SUM(n.list_price) as total_listed_value,
    AVG(n.list_price) as avg_price
FROM users u
LEFT JOIN nft_metadata n ON u.wallet_address = n.owner_address
GROUP BY u.wallet_address, u.username;

-- Create view for transaction history with user details
CREATE OR REPLACE VIEW transaction_history_view AS
SELECT 
    bt.*,
    u_from.username as from_username,
    u_to.username as to_username,
    n.name as nft_name,
    n.image_url as nft_image
FROM blockchain_transactions bt
LEFT JOIN users u_from ON bt.from_address = u_from.wallet_address
LEFT JOIN users u_to ON bt.to_address = u_to.wallet_address
LEFT JOIN nft_metadata n ON bt.token_id = n.token_id
ORDER BY bt.created_at DESC;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
