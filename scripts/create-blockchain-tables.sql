-- Create blockchain transactions table
CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tx_hash TEXT NOT NULL UNIQUE,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('mint', 'purchase', 'transfer', 'list', 'delist')),
    chain_id INTEGER NOT NULL,
    value TEXT,
    gas_used TEXT,
    gas_price TEXT,
    token_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    block_number BIGINT,
    block_hash TEXT,
    transaction_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create NFT metadata table
CREATE TABLE IF NOT EXISTS nft_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token_id TEXT NOT NULL,
    contract_address TEXT NOT NULL,
    chain_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    image_ipfs_hash TEXT,
    metadata_url TEXT,
    metadata_ipfs_hash TEXT,
    attributes JSONB DEFAULT '[]',
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(token_id, contract_address, chain_id)
);

-- Create wallet connections table
CREATE TABLE IF NOT EXISTS wallet_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    chain_id INTEGER NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    connection_count INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(wallet_address, chain_id)
);

-- Create gas price tracking table
CREATE TABLE IF NOT EXISTS gas_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chain_id INTEGER NOT NULL,
    gas_price_gwei DECIMAL(20, 9) NOT NULL,
    fast_gas_price_gwei DECIMAL(20, 9),
    standard_gas_price_gwei DECIMAL(20, 9),
    safe_gas_price_gwei DECIMAL(20, 9),
    block_number BIGINT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create IPFS pins table
CREATE TABLE IF NOT EXISTS ipfs_pins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ipfs_hash TEXT NOT NULL UNIQUE,
    pin_size BIGINT,
    pin_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_name TEXT,
    file_type TEXT,
    content_type TEXT CHECK (content_type IN ('image', 'metadata', 'other')),
    artwork_id UUID REFERENCES artworks(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_pinned BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_tx_hash ON blockchain_transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_from_address ON blockchain_transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_to_address ON blockchain_transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_chain_id ON blockchain_transactions(chain_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_type ON blockchain_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_status ON blockchain_transactions(status);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_created_at ON blockchain_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_nft_metadata_token_id ON nft_metadata(token_id);
CREATE INDEX IF NOT EXISTS idx_nft_metadata_contract_address ON nft_metadata(contract_address);
CREATE INDEX IF NOT EXISTS idx_nft_metadata_chain_id ON nft_metadata(chain_id);

CREATE INDEX IF NOT EXISTS idx_wallet_connections_wallet_address ON wallet_connections(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_chain_id ON wallet_connections(chain_id);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_user_id ON wallet_connections(user_id);

CREATE INDEX IF NOT EXISTS idx_gas_prices_chain_id ON gas_prices(chain_id);
CREATE INDEX IF NOT EXISTS idx_gas_prices_timestamp ON gas_prices(timestamp);

CREATE INDEX IF NOT EXISTS idx_ipfs_pins_hash ON ipfs_pins(ipfs_hash);
CREATE INDEX IF NOT EXISTS idx_ipfs_pins_artwork_id ON ipfs_pins(artwork_id);
CREATE INDEX IF NOT EXISTS idx_ipfs_pins_user_id ON ipfs_pins(user_id);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blockchain_transactions_updated_at 
    BEFORE UPDATE ON blockchain_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nft_metadata_updated_at 
    BEFORE UPDATE ON nft_metadata 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallet_connections_updated_at 
    BEFORE UPDATE ON wallet_connections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ipfs_pins_updated_at 
    BEFORE UPDATE ON ipfs_pins 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE blockchain_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE gas_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipfs_pins ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Blockchain transactions: Users can see their own transactions
CREATE POLICY "Users can view their own transactions" ON blockchain_transactions
    FOR SELECT USING (
        from_address = LOWER(auth.jwt() ->> 'wallet_address') OR 
        to_address = LOWER(auth.jwt() ->> 'wallet_address')
    );

CREATE POLICY "Users can insert their own transactions" ON blockchain_transactions
    FOR INSERT WITH CHECK (
        from_address = LOWER(auth.jwt() ->> 'wallet_address')
    );

-- NFT metadata: Public read, authenticated insert/update
CREATE POLICY "Anyone can view NFT metadata" ON nft_metadata
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert NFT metadata" ON nft_metadata
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own NFT metadata" ON nft_metadata
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM artworks 
            WHERE artworks.token_id = nft_metadata.token_id 
            AND artworks.artist_id = auth.uid()
        )
    );

-- Wallet connections: Users can manage their own connections
CREATE POLICY "Users can view their own wallet connections" ON wallet_connections
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own wallet connections" ON wallet_connections
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own wallet connections" ON wallet_connections
    FOR UPDATE USING (user_id = auth.uid());

-- Gas prices: Public read, service role insert
CREATE POLICY "Anyone can view gas prices" ON gas_prices
    FOR SELECT USING (true);

CREATE POLICY "Service role can insert gas prices" ON gas_prices
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- IPFS pins: Users can manage their own pins
CREATE POLICY "Users can view their own IPFS pins" ON ipfs_pins
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own IPFS pins" ON ipfs_pins
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own IPFS pins" ON ipfs_pins
    FOR UPDATE USING (user_id = auth.uid());

-- Add blockchain-related columns to existing artworks table
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS blockchain TEXT DEFAULT 'ethereum';
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS token_id TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS contract_address TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS image_ipfs_hash TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS metadata_ipfs_hash TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS metadata_url TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS minted_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for new artwork columns
CREATE INDEX IF NOT EXISTS idx_artworks_blockchain ON artworks(blockchain);
CREATE INDEX IF NOT EXISTS idx_artworks_token_id ON artworks(token_id);
CREATE INDEX IF NOT EXISTS idx_artworks_contract_address ON artworks(contract_address);
CREATE INDEX IF NOT EXISTS idx_artworks_image_ipfs_hash ON artworks(image_ipfs_hash);
CREATE INDEX IF NOT EXISTS idx_artworks_metadata_ipfs_hash ON artworks(metadata_ipfs_hash);

-- Add blockchain-related columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_chain_id INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nft_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_spent DECIMAL(20, 8) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_earned DECIMAL(20, 8) DEFAULT 0;

-- Add indexes for new user columns
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_preferred_chain_id ON users(preferred_chain_id);

-- Create view for user transaction summaries
CREATE OR REPLACE VIEW user_transaction_summary AS
SELECT 
    u.id as user_id,
    u.wallet_address,
    COUNT(bt.id) as total_transactions,
    COUNT(CASE WHEN bt.transaction_type = 'purchase' THEN 1 END) as purchases,
    COUNT(CASE WHEN bt.transaction_type = 'mint' THEN 1 END) as mints,
    COUNT(CASE WHEN bt.transaction_type = 'transfer' THEN 1 END) as transfers,
    COALESCE(SUM(CASE WHEN bt.transaction_type = 'purchase' AND bt.value IS NOT NULL 
                 THEN CAST(bt.value AS DECIMAL) / 1000000000000000000 END), 0) as total_spent_eth,
    COALESCE(SUM(CASE WHEN bt.transaction_type = 'mint' AND bt.value IS NOT NULL 
                 THEN CAST(bt.value AS DECIMAL) / 1000000000000000000 END), 0) as total_minting_fees_eth
FROM users u
LEFT JOIN blockchain_transactions bt ON LOWER(u.wallet_address) = LOWER(bt.from_address)
WHERE u.wallet_address IS NOT NULL
GROUP BY u.id, u.wallet_address;

-- Grant necessary permissions
GRANT SELECT ON user_transaction_summary TO authenticated;
GRANT SELECT ON user_transaction_summary TO anon;

-- Insert some sample gas price data
INSERT INTO gas_prices (chain_id, gas_price_gwei, fast_gas_price_gwei, standard_gas_price_gwei, safe_gas_price_gwei, block_number) VALUES
(1, 20.5, 25.0, 20.0, 15.0, 18500000),
(11155111, 2.5, 3.0, 2.5, 2.0, 4500000),
(137, 30.2, 35.0, 30.0, 25.0, 48000000),
(80001, 1.5, 2.0, 1.5, 1.0, 38000000)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE blockchain_transactions IS 'Stores all blockchain transactions related to NFT operations';
COMMENT ON TABLE nft_metadata IS 'Stores NFT metadata and IPFS information';
COMMENT ON TABLE wallet_connections IS 'Tracks user wallet connections and activity';
COMMENT ON TABLE gas_prices IS 'Historical gas price data for different networks';
COMMENT ON TABLE ipfs_pins IS 'Tracks IPFS pins for artwork and metadata storage';
