import { getSupabaseServerClient } from "./supabase"

export interface DatabaseIssue {
  id: string
  type: "error" | "warning" | "info"
  category: "structure" | "data" | "performance" | "security"
  title: string
  description: string
  fixSql?: string
  autoFixable: boolean
  severity: "critical" | "high" | "medium" | "low"
}

export interface HealthCheckResult {
  status: "healthy" | "warning" | "critical"
  score: number
  issues: DatabaseIssue[]
  summary: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
  }
  lastChecked: string
}

class DatabaseHealthChecker {
  private serverClient = getSupabaseServerClient()

  async runFullHealthCheck(autoFix = false): Promise<HealthCheckResult> {
    const issues: DatabaseIssue[] = []

    try {
      // Check table structure
      const structureIssues = await this.checkTableStructure()
      issues.push(...structureIssues)

      // Check data consistency
      const dataIssues = await this.checkDataConsistency()
      issues.push(...dataIssues)

      // Check performance
      const performanceIssues = await this.checkPerformance()
      issues.push(...performanceIssues)

      // Check security
      const securityIssues = await this.checkSecurity()
      issues.push(...securityIssues)

      // Auto-fix if requested
      if (autoFix) {
        await this.autoFixIssues(issues)
      }
    } catch (error) {
      console.error("Health check failed:", error)
      issues.push({
        id: "health-check-error",
        type: "error",
        category: "structure",
        title: "Health Check Failed",
        description: `Failed to run health check: ${error instanceof Error ? error.message : "Unknown error"}`,
        autoFixable: false,
        severity: "critical",
      })
    }

    return this.generateReport(issues)
  }

  private async checkTableStructure(): Promise<DatabaseIssue[]> {
    const issues: DatabaseIssue[] = []

    // Required tables and their essential columns
    const requiredTables = {
      artists: ["id", "wallet_address", "username", "created_at"],
      artworks: ["id", "artist_id", "title", "price", "status", "created_at"],
      users: ["id", "wallet_address", "created_at"],
      collections: ["id", "artist_id", "name", "created_at"],
      transactions: ["id", "artwork_id", "seller_id", "buyer_id", "price", "status"],
      artwork_views: ["id", "artwork_id", "created_at"],
      artwork_likes: ["id", "artwork_id", "user_id", "created_at"],
    }

    for (const [tableName, requiredColumns] of Object.entries(requiredTables)) {
      try {
        // Check if table exists
        const { data: tableExists, error: tableError } = await this.serverClient.from(tableName).select("*").limit(1)

        if (tableError && tableError.code === "PGRST116") {
          issues.push({
            id: `missing-table-${tableName}`,
            type: "error",
            category: "structure",
            title: `Missing Table: ${tableName}`,
            description: `Required table '${tableName}' does not exist`,
            fixSql: this.generateCreateTableSQL(tableName),
            autoFixable: true,
            severity: "critical",
          })
          continue
        }

        // Check columns if table exists
        const { data: columns } = await this.serverClient
          .rpc("get_table_columns", { table_name: tableName })
          .catch(() => ({ data: null }))

        if (columns) {
          const existingColumns = columns.map((col: any) => col.column_name)
          const missingColumns = requiredColumns.filter((col) => !existingColumns.includes(col))

          for (const missingCol of missingColumns) {
            issues.push({
              id: `missing-column-${tableName}-${missingCol}`,
              type: "error",
              category: "structure",
              title: `Missing Column: ${tableName}.${missingCol}`,
              description: `Required column '${missingCol}' is missing from table '${tableName}'`,
              fixSql: this.generateAddColumnSQL(tableName, missingCol),
              autoFixable: true,
              severity: "high",
            })
          }
        }
      } catch (error) {
        issues.push({
          id: `table-check-error-${tableName}`,
          type: "warning",
          category: "structure",
          title: `Cannot Check Table: ${tableName}`,
          description: `Failed to check table structure: ${error instanceof Error ? error.message : "Unknown error"}`,
          autoFixable: false,
          severity: "medium",
        })
      }
    }

    return issues
  }

  private async checkDataConsistency(): Promise<DatabaseIssue[]> {
    const issues: DatabaseIssue[] = []

    try {
      // Check for orphaned artworks (artist doesn't exist)
      const { data: orphanedArtworks } = await this.serverClient
        .from("artworks")
        .select("id, artist_id")
        .not("artist_id", "in", `(SELECT id FROM artists)`)
        .limit(10)

      if (orphanedArtworks && orphanedArtworks.length > 0) {
        issues.push({
          id: "orphaned-artworks",
          type: "warning",
          category: "data",
          title: "Orphaned Artworks",
          description: `Found ${orphanedArtworks.length} artworks with invalid artist references`,
          fixSql: `DELETE FROM artworks WHERE artist_id NOT IN (SELECT id FROM artists);`,
          autoFixable: true,
          severity: "medium",
        })
      }

      // Check for negative prices
      const { data: negativePrice } = await this.serverClient
        .from("artworks")
        .select("id, price")
        .lt("price", 0)
        .limit(10)

      if (negativePrice && negativePrice.length > 0) {
        issues.push({
          id: "negative-prices",
          type: "error",
          category: "data",
          title: "Invalid Prices",
          description: `Found ${negativePrice.length} artworks with negative prices`,
          fixSql: `UPDATE artworks SET price = 0.01 WHERE price < 0;`,
          autoFixable: true,
          severity: "high",
        })
      }

      // Check for duplicate wallet addresses in artists
      const { data: duplicateWallets } = await this.serverClient
        .from("artists")
        .select("wallet_address")
        .not("wallet_address", "is", null)

      if (duplicateWallets) {
        const walletCounts = duplicateWallets.reduce((acc: any, artist) => {
          acc[artist.wallet_address] = (acc[artist.wallet_address] || 0) + 1
          return acc
        }, {})

        const duplicates = Object.entries(walletCounts).filter(([_, count]) => (count as number) > 1)

        if (duplicates.length > 0) {
          issues.push({
            id: "duplicate-wallet-addresses",
            type: "warning",
            category: "data",
            title: "Duplicate Wallet Addresses",
            description: `Found ${duplicates.length} duplicate wallet addresses in artists table`,
            autoFixable: false,
            severity: "medium",
          })
        }
      }
    } catch (error) {
      issues.push({
        id: "data-consistency-error",
        type: "warning",
        category: "data",
        title: "Data Consistency Check Failed",
        description: `Failed to check data consistency: ${error instanceof Error ? error.message : "Unknown error"}`,
        autoFixable: false,
        severity: "low",
      })
    }

    return issues
  }

  private async checkPerformance(): Promise<DatabaseIssue[]> {
    const issues: DatabaseIssue[] = []

    // Check for missing indexes
    const recommendedIndexes = [
      { table: "artworks", columns: ["artist_id"], name: "idx_artworks_artist_id" },
      { table: "artworks", columns: ["status"], name: "idx_artworks_status" },
      { table: "artworks", columns: ["rarity"], name: "idx_artworks_rarity" },
      { table: "artworks", columns: ["price"], name: "idx_artworks_price" },
      { table: "artworks", columns: ["created_at"], name: "idx_artworks_created_at" },
      { table: "transactions", columns: ["artwork_id"], name: "idx_transactions_artwork_id" },
      { table: "transactions", columns: ["status"], name: "idx_transactions_status" },
      { table: "artwork_views", columns: ["artwork_id"], name: "idx_artwork_views_artwork_id" },
      { table: "artwork_likes", columns: ["artwork_id"], name: "idx_artwork_likes_artwork_id" },
    ]

    for (const index of recommendedIndexes) {
      try {
        const { data: indexExists } = await this.serverClient
          .rpc("check_index_exists", { index_name: index.name })
          .catch(() => ({ data: false }))

        if (!indexExists) {
          issues.push({
            id: `missing-index-${index.name}`,
            type: "info",
            category: "performance",
            title: `Missing Index: ${index.name}`,
            description: `Recommended index on ${index.table}(${index.columns.join(", ")}) is missing`,
            fixSql: `CREATE INDEX IF NOT EXISTS ${index.name} ON ${index.table} (${index.columns.join(", ")});`,
            autoFixable: true,
            severity: "low",
          })
        }
      } catch (error) {
        // Ignore index check errors
      }
    }

    return issues
  }

  private async checkSecurity(): Promise<DatabaseIssue[]> {
    const issues: DatabaseIssue[] = []

    // Check RLS policies
    const tablesNeedingRLS = ["artworks", "artists", "users", "transactions"]

    for (const table of tablesNeedingRLS) {
      try {
        const { data: rlsEnabled } = await this.serverClient
          .rpc("check_rls_enabled", { table_name: table })
          .catch(() => ({ data: false }))

        if (!rlsEnabled) {
          issues.push({
            id: `missing-rls-${table}`,
            type: "warning",
            category: "security",
            title: `RLS Not Enabled: ${table}`,
            description: `Row Level Security is not enabled on table '${table}'`,
            fixSql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`,
            autoFixable: true,
            severity: "medium",
          })
        }
      } catch (error) {
        // Ignore RLS check errors
      }
    }

    return issues
  }

  private async autoFixIssues(issues: DatabaseIssue[]): Promise<void> {
    const fixableIssues = issues.filter((issue) => issue.autoFixable && issue.fixSql)

    for (const issue of fixableIssues) {
      try {
        if (issue.fixSql) {
          await this.serverClient.rpc("execute_sql", { sql_query: issue.fixSql })
          console.log(`Fixed issue: ${issue.title}`)
        }
      } catch (error) {
        console.error(`Failed to fix issue ${issue.id}:`, error)
      }
    }
  }

  private generateReport(issues: DatabaseIssue[]): HealthCheckResult {
    const summary = {
      total: issues.length,
      critical: issues.filter((i) => i.severity === "critical").length,
      high: issues.filter((i) => i.severity === "high").length,
      medium: issues.filter((i) => i.severity === "medium").length,
      low: issues.filter((i) => i.severity === "low").length,
    }

    let status: "healthy" | "warning" | "critical" = "healthy"
    if (summary.critical > 0) status = "critical"
    else if (summary.high > 0 || summary.medium > 2) status = "warning"

    const score = Math.max(0, 100 - (summary.critical * 25 + summary.high * 10 + summary.medium * 5 + summary.low * 1))

    return {
      status,
      score,
      issues,
      summary,
      lastChecked: new Date().toISOString(),
    }
  }

  private generateCreateTableSQL(tableName: string): string {
    const tableSchemas: Record<string, string> = {
      artists: `
        CREATE TABLE artists (
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
          total_sales DECIMAL(20,8) DEFAULT 0,
          total_artworks INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      artworks: `
        CREATE TABLE artworks (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
          collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
          title TEXT NOT NULL,
          description TEXT,
          image_url TEXT NOT NULL,
          image_ipfs_hash TEXT,
          metadata_url TEXT,
          metadata_ipfs_hash TEXT,
          dataset TEXT NOT NULL,
          color_scheme TEXT NOT NULL,
          seed INTEGER NOT NULL,
          num_samples INTEGER DEFAULT 1000,
          noise DECIMAL(3,2) DEFAULT 0.1,
          generation_mode TEXT CHECK (generation_mode IN ('svg', 'ai')) DEFAULT 'svg',
          price DECIMAL(20,8) NOT NULL CHECK (price >= 0),
          currency TEXT CHECK (currency IN ('ETH', 'USD', 'MATIC')) DEFAULT 'ETH',
          status TEXT CHECK (status IN ('available', 'sold', 'reserved', 'auction')) DEFAULT 'available',
          rarity TEXT CHECK (rarity IN ('Common', 'Rare', 'Epic', 'Legendary')) DEFAULT 'Common',
          edition TEXT,
          views INTEGER DEFAULT 0,
          likes INTEGER DEFAULT 0,
          token_id TEXT,
          contract_address TEXT,
          blockchain TEXT DEFAULT 'ethereum',
          minted_at TIMESTAMP WITH TIME ZONE,
          listed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    }

    return tableSchemas[tableName] || `-- No schema defined for table: ${tableName}`
  }

  private generateAddColumnSQL(tableName: string, columnName: string): string {
    const columnDefinitions: Record<string, Record<string, string>> = {
      artists: {
        wallet_address: "ALTER TABLE artists ADD COLUMN wallet_address TEXT UNIQUE NOT NULL;",
        username: "ALTER TABLE artists ADD COLUMN username TEXT UNIQUE NOT NULL;",
        created_at: "ALTER TABLE artists ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();",
      },
      artworks: {
        artist_id: "ALTER TABLE artworks ADD COLUMN artist_id UUID REFERENCES artists(id) ON DELETE CASCADE;",
        title: "ALTER TABLE artworks ADD COLUMN title TEXT NOT NULL;",
        price: "ALTER TABLE artworks ADD COLUMN price DECIMAL(20,8) NOT NULL CHECK (price >= 0);",
        status:
          "ALTER TABLE artworks ADD COLUMN status TEXT CHECK (status IN ('available', 'sold', 'reserved', 'auction')) DEFAULT 'available';",
        created_at: "ALTER TABLE artworks ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();",
      },
    }

    return columnDefinitions[tableName]?.[columnName] || `ALTER TABLE ${tableName} ADD COLUMN ${columnName} TEXT;`
  }
}

export const databaseHealthChecker = new DatabaseHealthChecker()

export async function runDatabaseHealthCheck(autoFix = false): Promise<HealthCheckResult> {
  return await databaseHealthChecker.runFullHealthCheck(autoFix)
}
