-- Create blockchain transactions table
CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tx_hash VARCHAR(66) NOT NULL UNIQUE,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('mint', 'purchase', 'transfer', 'list', 'delist')),
    chain_id INTEGER NOT NULL,
    value VARCHAR(78), -- For storing large numbers as strings
    gas_used VARCHAR(78),
    gas_price VARCHAR(78),
    token_id VARCHAR(78),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    block_number BIGINT,
    block_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for blockchain transactions
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_tx_hash ON blockchain_transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_from_address ON blockchain_transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_to_address ON blockchain_transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_chain_id ON blockchain_transactions(chain_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_type ON blockchain_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_status ON blockchain_transactions(status);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_created_at ON blockchain_transactions(created_at);

-- Add blockchain-related columns to existing tables
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS token_id VARCHAR(78);
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS contract_address VARCHAR(42);
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS blockchain VARCHAR(20) DEFAULT 'ethereum';
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS owner_address VARCHAR(42);
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS minted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS sold_at TIMESTAMP WITH TIME ZONE;

-- Add wallet address to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(42) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS chain_id INTEGER;

-- Add wallet address to artists table  
ALTER TABLE artists ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(42) UNIQUE;

-- Create NFT metadata table
CREATE TABLE IF NOT EXISTS nft_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    token_id VARCHAR(78) NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    chain_id INTEGER NOT NULL,
    metadata_uri VARCHAR(500),
    metadata_ipfs_hash VARCHAR(100),
    image_ipfs_hash VARCHAR(100),
    name VARCHAR(255),
    description TEXT,
    attributes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for NFT metadata
CREATE INDEX IF NOT EXISTS idx_nft_metadata_artwork_id ON nft_metadata(artwork_id);
CREATE INDEX IF NOT EXISTS idx_nft_metadata_token_id ON nft_metadata(token_id);
CREATE INDEX IF NOT EXISTS idx_nft_metadata_contract_address ON nft_metadata(contract_address);
CREATE INDEX IF NOT EXISTS idx_nft_metadata_chain_id ON nft_metadata(chain_id);

-- Create wallet connections table for tracking user wallet connections
CREATE TABLE IF NOT EXISTS wallet_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(42) NOT NULL,
    chain_id INTEGER NOT NULL,
    wallet_type VARCHAR(20) DEFAULT 'metamask',
    is_active BOOLEAN DEFAULT true,
    first_connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for wallet connections
CREATE INDEX IF NOT EXISTS idx_wallet_connections_user_id ON wallet_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_wallet_address ON wallet_connections(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_chain_id ON wallet_connections(chain_id);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_is_active ON wallet_connections(is_active);

-- Create gas tracker table for monitoring gas prices
CREATE TABLE IF NOT EXISTS gas_tracker (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chain_id INTEGER NOT NULL,
    gas_price_gwei DECIMAL(20, 9) NOT NULL,
    fast_gas_price_gwei DECIMAL(20, 9),
    standard_gas_price_gwei DECIMAL(20, 9),
    safe_gas_price_gwei DECIMAL(20, 9),
    block_number BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for gas tracker
CREATE INDEX IF NOT EXISTS idx_gas_tracker_chain_id ON gas_tracker(chain_id);
CREATE INDEX IF NOT EXISTS idx_gas_tracker_created_at ON gas_tracker(created_at);

-- Create RLS policies for blockchain transactions
ALTER TABLE blockchain_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view transactions they're involved in
CREATE POLICY "Users can view their transactions" ON blockchain_transactions
    FOR SELECT USING (
        from_address = (SELECT wallet_address FROM users WHERE id = auth.uid()) OR
        to_address = (SELECT wallet_address FROM users WHERE id = auth.uid())
    );

-- Policy: Allow inserting transaction records
CREATE POLICY "Allow transaction inserts" ON blockchain_transactions
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for NFT metadata
ALTER TABLE nft_metadata ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view NFT metadata
CREATE POLICY "Anyone can view NFT metadata" ON nft_metadata
    FOR SELECT USING (true);

-- Policy: Allow inserting NFT metadata
CREATE POLICY "Allow NFT metadata inserts" ON nft_metadata
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for wallet connections
ALTER TABLE wallet_connections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own wallet connections
CREATE POLICY "Users can view their wallet connections" ON wallet_connections
    FOR SELECT USING (user_id = auth.uid());

-- Policy: Users can insert their own wallet connections
CREATE POLICY "Users can insert their wallet connections" ON wallet_connections
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own wallet connections
CREATE POLICY "Users can update their wallet connections" ON wallet_connections
    FOR UPDATE USING (user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_blockchain_transactions_updated_at BEFORE UPDATE ON blockchain_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nft_metadata_updated_at BEFORE UPDATE ON nft_metadata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallet_connections_updated_at BEFORE UPDATE ON wallet_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
