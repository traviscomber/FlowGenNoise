import { supabase } from "@/lib/supabase"

export interface DatabaseIssue {
  type: "missing_table" | "missing_column" | "invalid_constraint" | "missing_index" | "data_inconsistency"
  severity: "critical" | "warning" | "info"
  table: string
  column?: string
  description: string
  sqlFix?: string
  autoFixable: boolean
}

export interface HealthCheckResult {
  status: "healthy" | "issues_found" | "critical_errors"
  issues: DatabaseIssue[]
  fixedIssues: DatabaseIssue[]
  summary: {
    totalIssues: number
    criticalIssues: number
    autoFixedIssues: number
  }
}

/**
 * Comprehensive database health checker and auto-fixer
 */
export class DatabaseHealthChecker {
  private issues: DatabaseIssue[] = []
  private fixedIssues: DatabaseIssue[] = []

  /**
   * Run complete database health check
   */
  async runHealthCheck(autoFix = true): Promise<HealthCheckResult> {
    console.log("🔍 Starting database health check...")

    this.issues = []
    this.fixedIssues = []

    // Check all database components
    await this.checkRequiredTables()
    await this.checkTableColumns()
    await this.checkConstraints()
    await this.checkIndexes()
    await this.checkDataConsistency()
    await this.checkRLSPolicies()

    // Auto-fix issues if requested
    if (autoFix) {
      await this.autoFixIssues()
    }

    const result: HealthCheckResult = {
      status: this.getOverallStatus(),
      issues: this.issues,
      fixedIssues: this.fixedIssues,
      summary: {
        totalIssues: this.issues.length + this.fixedIssues.length,
        criticalIssues: this.issues.filter((i) => i.severity === "critical").length,
        autoFixedIssues: this.fixedIssues.length,
      },
    }

    console.log("✅ Database health check complete:", result.summary)
    return result
  }

  /**
   * Check if all required tables exist
   */
  private async checkRequiredTables() {
    const requiredTables = [
      "artists",
      "users",
      "collections",
      "artworks",
      "transactions",
      "bids",
      "artwork_likes",
      "artwork_views",
      "follows",
      "purchases",
      "wallet_connections",
      "blockchain_transactions",
    ]

    try {
      const { data: tables, error } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")

      if (error) {
        this.addIssue({
          type: "missing_table",
          severity: "critical",
          table: "information_schema",
          description: "Cannot access database schema information",
          autoFixable: false,
        })
        return
      }

      const existingTables = tables?.map((t) => t.table_name) || []

      for (const tableName of requiredTables) {
        if (!existingTables.includes(tableName)) {
          this.addIssue({
            type: "missing_table",
            severity: "critical",
            table: tableName,
            description: `Required table '${tableName}' is missing`,
            sqlFix: this.getCreateTableSQL(tableName),
            autoFixable: true,
          })
        }
      }
    } catch (error) {
      console.error("Error checking tables:", error)
      this.addIssue({
        type: "missing_table",
        severity: "critical",
        table: "unknown",
        description: "Failed to check table existence",
        autoFixable: false,
      })
    }
  }

  /**
   * Check if all required columns exist in tables
   */
  private async checkTableColumns() {
    const tableColumns = {
      artworks: [
        "id",
        "artist_id",
        "collection_id",
        "title",
        "description",
        "image_url",
        "image_ipfs_hash",
        "metadata_url",
        "metadata_ipfs_hash",
        "dataset",
        "color_scheme",
        "seed",
        "num_samples",
        "noise",
        "generation_mode",
        "price",
        "currency",
        "status",
        "rarity",
        "edition",
        "views",
        "likes",
        "token_id",
        "contract_address",
        "blockchain",
        "owner_address",
        "purchase_transaction_hash",
        "sold_at",
        "minted_at",
        "listed_at",
        "created_at",
        "updated_at",
      ],
      artists: [
        "id",
        "wallet_address",
        "username",
        "display_name",
        "bio",
        "avatar_url",
        "banner_url",
        "website_url",
        "twitter_handle",
        "instagram_handle",
        "verified",
        "total_sales",
        "total_artworks",
        "created_at",
        "updated_at",
      ],
      users: [
        "id",
        "wallet_address",
        "username",
        "display_name",
        "bio",
        "avatar_url",
        "email",
        "notification_preferences",
        "created_at",
        "updated_at",
      ],
      blockchain_transactions: [
        "id",
        "transaction_hash",
        "from_address",
        "to_address",
        "value_eth",
        "gas_used",
        "gas_price",
        "block_number",
        "transaction_type",
        "artwork_id",
        "status",
        "created_at",
        "completed_at",
      ],
    }

    for (const [tableName, requiredColumns] of Object.entries(tableColumns)) {
      try {
        const { data: columns, error } = await supabase
          .from("information_schema.columns")
          .select("column_name")
          .eq("table_name", tableName)
          .eq("table_schema", "public")

        if (error) {
          this.addIssue({
            type: "missing_column",
            severity: "warning",
            table: tableName,
            description: `Cannot check columns for table '${tableName}'`,
            autoFixable: false,
          })
          continue
        }

        const existingColumns = columns?.map((c) => c.column_name) || []

        for (const columnName of requiredColumns) {
          if (!existingColumns.includes(columnName)) {
            this.addIssue({
              type: "missing_column",
              severity: "critical",
              table: tableName,
              column: columnName,
              description: `Missing column '${columnName}' in table '${tableName}'`,
              sqlFix: this.getAddColumnSQL(tableName, columnName),
              autoFixable: true,
            })
          }
        }
      } catch (error) {
        console.error(`Error checking columns for ${tableName}:`, error)
      }
    }
  }

  /**
   * Check database constraints
   */
  private async checkConstraints() {
    const requiredConstraints = [
      {
        table: "artworks",
        constraint: "artworks_artist_id_fkey",
        type: "foreign_key",
        description: "Foreign key constraint for artist_id",
      },
      {
        table: "transactions",
        constraint: "transactions_artwork_id_fkey",
        type: "foreign_key",
        description: "Foreign key constraint for artwork_id",
      },
    ]

    try {
      const { data: constraints, error } = await supabase
        .from("information_schema.table_constraints")
        .select("constraint_name, table_name, constraint_type")
        .eq("table_schema", "public")

      if (error) {
        this.addIssue({
          type: "invalid_constraint",
          severity: "warning",
          table: "information_schema",
          description: "Cannot check database constraints",
          autoFixable: false,
        })
        return
      }

      const existingConstraints = constraints?.map((c) => c.constraint_name) || []

      for (const constraint of requiredConstraints) {
        if (!existingConstraints.includes(constraint.constraint)) {
          this.addIssue({
            type: "invalid_constraint",
            severity: "warning",
            table: constraint.table,
            description: `Missing constraint: ${constraint.description}`,
            sqlFix: this.getAddConstraintSQL(constraint),
            autoFixable: true,
          })
        }
      }
    } catch (error) {
      console.error("Error checking constraints:", error)
    }
  }

  /**
   * Check database indexes for performance
   */
  private async checkIndexes() {
    const recommendedIndexes = [
      { table: "artworks", columns: ["artist_id"], name: "idx_artworks_artist_id" },
      { table: "artworks", columns: ["status"], name: "idx_artworks_status" },
      { table: "artworks", columns: ["rarity"], name: "idx_artworks_rarity" },
      { table: "transactions", columns: ["artwork_id"], name: "idx_transactions_artwork_id" },
      { table: "blockchain_transactions", columns: ["transaction_hash"], name: "idx_blockchain_tx_hash" },
    ]

    try {
      const { data: indexes, error } = await supabase
        .from("pg_indexes")
        .select("indexname, tablename")
        .eq("schemaname", "public")

      if (error) {
        this.addIssue({
          type: "missing_index",
          severity: "info",
          table: "pg_indexes",
          description: "Cannot check database indexes",
          autoFixable: false,
        })
        return
      }

      const existingIndexes = indexes?.map((i) => i.indexname) || []

      for (const index of recommendedIndexes) {
        if (!existingIndexes.includes(index.name)) {
          this.addIssue({
            type: "missing_index",
            severity: "info",
            table: index.table,
            description: `Missing performance index on ${index.table}(${index.columns.join(", ")})`,
            sqlFix: `CREATE INDEX IF NOT EXISTS ${index.name} ON ${index.table} (${index.columns.join(", ")});`,
            autoFixable: true,
          })
        }
      }
    } catch (error) {
      console.error("Error checking indexes:", error)
    }
  }

  /**
   * Check data consistency
   */
  private async checkDataConsistency() {
    try {
      // Check for orphaned artworks (artist doesn't exist)
      const { data: orphanedArtworks, error: orphanError } = await supabase
        .from("artworks")
        .select("id, artist_id")
        .not("artist_id", "in", `(SELECT id FROM artists)`)

      if (!orphanError && orphanedArtworks && orphanedArtworks.length > 0) {
        this.addIssue({
          type: "data_inconsistency",
          severity: "warning",
          table: "artworks",
          description: `Found ${orphanedArtworks.length} artworks with invalid artist_id references`,
          autoFixable: false,
        })
      }

      // Check for invalid price values
      const { data: invalidPrices, error: priceError } = await supabase
        .from("artworks")
        .select("id, price")
        .lt("price", 0)

      if (!priceError && invalidPrices && invalidPrices.length > 0) {
        this.addIssue({
          type: "data_inconsistency",
          severity: "warning",
          table: "artworks",
          description: `Found ${invalidPrices.length} artworks with negative prices`,
          sqlFix: "UPDATE artworks SET price = 0 WHERE price < 0;",
          autoFixable: true,
        })
      }
    } catch (error) {
      console.error("Error checking data consistency:", error)
    }
  }

  /**
   * Check Row Level Security policies
   */
  private async checkRLSPolicies() {
    const requiredPolicies = [
      { table: "artworks", policy: "artworks_select_policy" },
      { table: "artists", policy: "artists_select_policy" },
      { table: "users", policy: "users_select_policy" },
    ]

    try {
      const { data: policies, error } = await supabase.from("pg_policies").select("policyname, tablename")

      if (error) {
        this.addIssue({
          type: "invalid_constraint",
          severity: "info",
          table: "pg_policies",
          description: "Cannot check RLS policies",
          autoFixable: false,
        })
        return
      }

      const existingPolicies = policies?.map((p) => p.policyname) || []

      for (const policy of requiredPolicies) {
        if (!existingPolicies.includes(policy.policy)) {
          this.addIssue({
            type: "invalid_constraint",
            severity: "info",
            table: policy.table,
            description: `Missing RLS policy '${policy.policy}' for table '${policy.table}'`,
            sqlFix: this.getRLSPolicySQL(policy.table, policy.policy),
            autoFixable: true,
          })
        }
      }
    } catch (error) {
      console.error("Error checking RLS policies:", error)
    }
  }

  /**
   * Auto-fix issues that can be automatically resolved
   */
  private async autoFixIssues() {
    const fixableIssues = this.issues.filter((issue) => issue.autoFixable && issue.sqlFix)

    for (const issue of fixableIssues) {
      try {
        console.log(`🔧 Auto-fixing: ${issue.description}`)

        // Execute the SQL fix
        const { error } = await supabase.rpc("execute_sql", { sql: issue.sqlFix })

        if (!error) {
          // Move from issues to fixed issues
          this.fixedIssues.push(issue)
          this.issues = this.issues.filter((i) => i !== issue)
          console.log(`✅ Fixed: ${issue.description}`)
        } else {
          console.error(`❌ Failed to fix: ${issue.description}`, error)
          issue.autoFixable = false
        }
      } catch (error) {
        console.error(`❌ Error auto-fixing issue: ${issue.description}`, error)
        issue.autoFixable = false
      }
    }
  }

  /**
   * Add an issue to the list
   */
  private addIssue(issue: DatabaseIssue) {
    this.issues.push(issue)
  }

  /**
   * Get overall health status
   */
  private getOverallStatus(): "healthy" | "issues_found" | "critical_errors" {
    const criticalIssues = this.issues.filter((i) => i.severity === "critical")

    if (criticalIssues.length > 0) {
      return "critical_errors"
    } else if (this.issues.length > 0) {
      return "issues_found"
    } else {
      return "healthy"
    }
  }

  /**
   * Generate CREATE TABLE SQL for missing tables
   */
  private getCreateTableSQL(tableName: string): string {
    const tableSchemas: Record<string, string> = {
      artists: `
        CREATE TABLE IF NOT EXISTS artists (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
          total_sales DECIMAL DEFAULT 0,
          total_artworks INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `,
      users: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          wallet_address TEXT UNIQUE NOT NULL,
          username TEXT,
          display_name TEXT,
          bio TEXT,
          avatar_url TEXT,
          email TEXT,
          notification_preferences JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `,
      artworks: `
        CREATE TABLE IF NOT EXISTS artworks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          artist_id UUID REFERENCES artists(id),
          collection_id UUID,
          title TEXT NOT NULL,
          description TEXT,
          image_url TEXT NOT NULL,
          image_ipfs_hash TEXT,
          metadata_url TEXT,
          metadata_ipfs_hash TEXT,
          dataset TEXT NOT NULL,
          color_scheme TEXT NOT NULL,
          seed INTEGER NOT NULL,
          num_samples INTEGER DEFAULT 100,
          noise DECIMAL DEFAULT 0.1,
          generation_mode TEXT CHECK (generation_mode IN ('svg', 'ai')) DEFAULT 'svg',
          price DECIMAL NOT NULL CHECK (price >= 0),
          currency TEXT CHECK (currency IN ('ETH', 'USD', 'MATIC')) DEFAULT 'ETH',
          status TEXT CHECK (status IN ('available', 'sold', 'reserved', 'auction')) DEFAULT 'available',
          rarity TEXT CHECK (rarity IN ('Common', 'Rare', 'Epic', 'Legendary')) DEFAULT 'Common',
          edition TEXT DEFAULT '1/1',
          views INTEGER DEFAULT 0,
          likes INTEGER DEFAULT 0,
          token_id TEXT,
          contract_address TEXT,
          blockchain TEXT DEFAULT 'ethereum',
          owner_address TEXT,
          purchase_transaction_hash TEXT,
          sold_at TIMESTAMPTZ,
          minted_at TIMESTAMPTZ,
          listed_at TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `,
      blockchain_transactions: `
        CREATE TABLE IF NOT EXISTS blockchain_transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          transaction_hash TEXT UNIQUE NOT NULL,
          from_address TEXT NOT NULL,
          to_address TEXT NOT NULL,
          value_eth DECIMAL,
          gas_used BIGINT,
          gas_price BIGINT,
          block_number BIGINT,
          transaction_type TEXT CHECK (transaction_type IN ('mint', 'purchase', 'transfer')),
          artwork_id UUID,
          status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          completed_at TIMESTAMPTZ
        );
      `,
    }

    return tableSchemas[tableName] || `-- No schema defined for table: ${tableName}`
  }

  /**
   * Generate ADD COLUMN SQL for missing columns
   */
  private getAddColumnSQL(tableName: string, columnName: string): string {
    const columnDefinitions: Record<string, Record<string, string>> = {
      artworks: {
        owner_address: "ALTER TABLE artworks ADD COLUMN IF NOT EXISTS owner_address TEXT;",
        purchase_transaction_hash: "ALTER TABLE artworks ADD COLUMN IF NOT EXISTS purchase_transaction_hash TEXT;",
        sold_at: "ALTER TABLE artworks ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ;",
      },
    }

    return (
      columnDefinitions[tableName]?.[columnName] ||
      `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${columnName} TEXT;`
    )
  }

  /**
   * Generate constraint SQL
   */
  private getAddConstraintSQL(constraint: any): string {
    const constraintSQL: Record<string, string> = {
      artworks_artist_id_fkey:
        "ALTER TABLE artworks ADD CONSTRAINT artworks_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES artists(id);",
      transactions_artwork_id_fkey:
        "ALTER TABLE transactions ADD CONSTRAINT transactions_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES artworks(id);",
    }

    return constraintSQL[constraint.constraint] || `-- No SQL defined for constraint: ${constraint.constraint}`
  }

  /**
   * Generate RLS policy SQL
   */
  private getRLSPolicySQL(tableName: string, policyName: string): string {
    return `
      ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;
      CREATE POLICY IF NOT EXISTS ${policyName} ON ${tableName} FOR SELECT USING (true);
    `
  }
}

/**
 * Quick health check function for easy use
 */
export async function runDatabaseHealthCheck(autoFix = true): Promise<HealthCheckResult> {
  const checker = new DatabaseHealthChecker()
  return await checker.runHealthCheck(autoFix)
}
