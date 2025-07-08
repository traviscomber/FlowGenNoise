-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    -- Update user earnings (assuming you have an earnings column in users table)
    UPDATE users 
    SET total_earnings = COALESCE(total_earnings, 0) + amount,
        updated_at = NOW()
    WHERE wallet_address = artist_wallet;
    
    -- If user doesn't exist, this won't fail
    IF NOT FOUND THEN
        -- Optionally log this or handle as needed
        RAISE NOTICE 'Artist wallet % not found in users table', artist_wallet;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_marketplace_stats(total_volume DECIMAL, total_sales INTEGER)
RETURNS VOID AS $$
BEGIN
    -- Update marketplace stats for all chains (you might want to make this chain-specific)
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

-- Create policies for blockchain_transactions
CREATE POLICY "Users can view their own transactions" ON blockchain_transactions
    FOR SELECT USING (
        auth.uid()::text = from_address OR 
        auth.uid()::text = to_address OR
        auth.role() = 'service_role'
    );

CREATE POLICY "Service role can insert transactions" ON blockchain_transactions
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update transactions" ON blockchain_transactions
    FOR UPDATE USING (auth.role() = 'service_role');

-- Create policies for nft_metadata
CREATE POLICY "Anyone can view NFT metadata" ON nft_metadata
    FOR SELECT USING (true);

CREATE POLICY "Owners can update their NFTs" ON nft_metadata
    FOR UPDATE USING (
        auth.uid()::text = owner_address OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Service role can insert NFT metadata" ON nft_metadata
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Create policies for wallet_connections
CREATE POLICY "Users can view their own connections" ON wallet_connections
    FOR SELECT USING (
        auth.uid()::text = wallet_address OR
        auth.role() = 'service_role'
    );

CREATE POLICY "Service role can manage connections" ON wallet_connections
    FOR ALL USING (auth.role() = 'service_role');

-- Create policies for gas_tracker
CREATE POLICY "Anyone can view gas prices" ON gas_tracker
    FOR SELECT USING (true);

CREATE POLICY "Service role can insert gas data" ON gas_tracker
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Create policies for marketplace_stats
CREATE POLICY "Anyone can view marketplace stats" ON marketplace_stats
    FOR SELECT USING (true);

CREATE POLICY "Service role can update stats" ON marketplace_stats
    FOR ALL USING (auth.role() = 'service_role');

-- Insert initial marketplace stats for supported chains
INSERT INTO marketplace_stats (chain_id, total_volume, total_sales, total_nfts, active_listings, unique_owners, average_price, floor_price)
VALUES 
    (1, 0, 0, 0, 0, 0, 0, 0),      -- Ethereum Mainnet
    (11155111, 0, 0, 0, 0, 0, 0, 0), -- Sepolia Testnet
    (137, 0, 0, 0, 0, 0, 0, 0),    -- Polygon Mainnet
    (80001, 0, 0, 0, 0, 0, 0, 0)   -- Mumbai Testnet
ON CONFLICT (chain_id) DO NOTHING;

-- Add earnings column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'total_earnings') THEN
        ALTER TABLE users ADD COLUMN total_earnings DECIMAL(20, 8) DEFAULT 0;
    END IF;
END $$;

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
GRANT INSERT, UPDATE ON blockchain_transactions TO authenticated;
GRANT INSERT, UPDATE ON nft_metadata TO authenticated;
GRANT INSERT, UPDATE ON wallet_connections TO authenticated;
