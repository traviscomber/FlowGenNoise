import { supabase, getSupabaseServerClient } from "./supabase"

export interface HealthIssue {
  id: string
  category: "structure" | "data" | "performance" | "security"
  severity: "high" | "medium" | "low"
  title: string
  description: string
  fixSql?: string
  canAutoFix: boolean
}

export interface HealthReport {
  overallScore: number
  issues: HealthIssue[]
  categories: {
    structure: { score: number; issues: number }
    data: { score: number; issues: number }
    performance: { score: number; issues: number }
    security: { score: number; issues: number }
  }
  lastChecked: string
}

export async function runDatabaseHealthCheck(autoFix = false): Promise<HealthReport> {
  const issues: HealthIssue[] = []

  try {
    // Check table structure
    const structureIssues = await checkTableStructure()
    issues.push(...structureIssues)

    // Check data consistency
    const dataIssues = await checkDataConsistency()
    issues.push(...dataIssues)

    // Check performance
    const performanceIssues = await checkPerformance()
    issues.push(...performanceIssues)

    // Check security
    const securityIssues = await checkSecurity()
    issues.push(...securityIssues)

    // Auto-fix if requested
    if (autoFix) {
      await applyAutoFixes(issues.filter((issue) => issue.canAutoFix))
    }

    // Calculate scores
    const categories = calculateCategoryScores(issues)
    const overallScore = calculateOverallScore(categories)

    return {
      overallScore,
      issues,
      categories,
      lastChecked: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Health check failed:", error)
    return {
      overallScore: 0,
      issues: [
        {
          id: "health-check-error",
          category: "structure",
          severity: "high",
          title: "Health Check Failed",
          description: error instanceof Error ? error.message : "Unknown error",
          canAutoFix: false,
        },
      ],
      categories: {
        structure: { score: 0, issues: 1 },
        data: { score: 0, issues: 0 },
        performance: { score: 0, issues: 0 },
        security: { score: 0, issues: 0 },
      },
      lastChecked: new Date().toISOString(),
    }
  }
}

async function checkTableStructure(): Promise<HealthIssue[]> {
  const issues: HealthIssue[] = []

  try {
    // Check if required tables exist
    const requiredTables = ["artworks", "users", "purchases", "nft_tokens"]

    for (const tableName of requiredTables) {
      const { data, error } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .eq("table_name", tableName)

      if (error || !data || data.length === 0) {
        issues.push({
          id: `missing-table-${tableName}`,
          category: "structure",
          severity: "high",
          title: `Missing Table: ${tableName}`,
          description: `Required table '${tableName}' does not exist`,
          fixSql: getCreateTableSQL(tableName),
          canAutoFix: true,
        })
      }
    }

    // Check for required columns in existing tables
    const columnChecks = [
      { table: "artworks", column: "price", type: "numeric" },
      { table: "artworks", column: "created_at", type: "timestamp" },
      { table: "users", column: "wallet_address", type: "text" },
      { table: "purchases", column: "transaction_hash", type: "text" },
    ]

    for (const check of columnChecks) {
      const { data, error } = await supabase
        .from("information_schema.columns")
        .select("column_name, data_type")
        .eq("table_schema", "public")
        .eq("table_name", check.table)
        .eq("column_name", check.column)

      if (error || !data || data.length === 0) {
        issues.push({
          id: `missing-column-${check.table}-${check.column}`,
          category: "structure",
          severity: "medium",
          title: `Missing Column: ${check.table}.${check.column}`,
          description: `Required column '${check.column}' missing from table '${check.table}'`,
          fixSql: `ALTER TABLE ${check.table} ADD COLUMN IF NOT EXISTS ${check.column} ${check.type};`,
          canAutoFix: true,
        })
      }
    }
  } catch (error) {
    issues.push({
      id: "structure-check-error",
      category: "structure",
      severity: "high",
      title: "Structure Check Failed",
      description: error instanceof Error ? error.message : "Unknown error",
      canAutoFix: false,
    })
  }

  return issues
}

async function checkDataConsistency(): Promise<HealthIssue[]> {
  const issues: HealthIssue[] = []

  try {
    // Check for negative prices
    const { data: negativePrice, error: priceError } = await supabase
      .from("artworks")
      .select("id, price")
      .lt("price", 0)

    if (!priceError && negativePrice && negativePrice.length > 0) {
      issues.push({
        id: "negative-prices",
        category: "data",
        severity: "medium",
        title: "Negative Prices Found",
        description: `Found ${negativePrice.length} artworks with negative prices`,
        fixSql: "UPDATE artworks SET price = 0 WHERE price < 0;",
        canAutoFix: true,
      })
    }

    // Check for orphaned purchases
    const { data: orphanedPurchases, error: orphanError } = await supabase
      .from("purchases")
      .select("id, artwork_id")
      .not("artwork_id", "in", `(SELECT id FROM artworks)`)

    if (!orphanError && orphanedPurchases && orphanedPurchases.length > 0) {
      issues.push({
        id: "orphaned-purchases",
        category: "data",
        severity: "high",
        title: "Orphaned Purchase Records",
        description: `Found ${orphanedPurchases.length} purchases referencing non-existent artworks`,
        fixSql: "DELETE FROM purchases WHERE artwork_id NOT IN (SELECT id FROM artworks);",
        canAutoFix: true,
      })
    }
  } catch (error) {
    issues.push({
      id: "data-check-error",
      category: "data",
      severity: "medium",
      title: "Data Consistency Check Failed",
      description: error instanceof Error ? error.message : "Unknown error",
      canAutoFix: false,
    })
  }

  return issues
}

async function checkPerformance(): Promise<HealthIssue[]> {
  const issues: HealthIssue[] = []

  try {
    // Check for missing indexes
    const requiredIndexes = [
      { table: "artworks", column: "created_at", name: "idx_artworks_created_at" },
      { table: "artworks", column: "price", name: "idx_artworks_price" },
      { table: "purchases", column: "user_id", name: "idx_purchases_user_id" },
      { table: "purchases", column: "artwork_id", name: "idx_purchases_artwork_id" },
    ]

    for (const index of requiredIndexes) {
      const { data, error } = await supabase
        .from("pg_indexes")
        .select("indexname")
        .eq("tablename", index.table)
        .eq("indexname", index.name)

      if (error || !data || data.length === 0) {
        issues.push({
          id: `missing-index-${index.name}`,
          category: "performance",
          severity: "medium",
          title: `Missing Index: ${index.name}`,
          description: `Performance index missing on ${index.table}.${index.column}`,
          fixSql: `CREATE INDEX IF NOT EXISTS ${index.name} ON ${index.table} (${index.column});`,
          canAutoFix: true,
        })
      }
    }
  } catch (error) {
    issues.push({
      id: "performance-check-error",
      category: "performance",
      severity: "low",
      title: "Performance Check Failed",
      description: error instanceof Error ? error.message : "Unknown error",
      canAutoFix: false,
    })
  }

  return issues
}

async function checkSecurity(): Promise<HealthIssue[]> {
  const issues: HealthIssue[] = []

  try {
    // Check RLS policies
    const tables = ["artworks", "users", "purchases", "nft_tokens"]

    for (const table of tables) {
      const { data, error } = await supabase.from("pg_policies").select("policyname").eq("tablename", table)

      if (error || !data || data.length === 0) {
        issues.push({
          id: `missing-rls-${table}`,
          category: "security",
          severity: "high",
          title: `Missing RLS Policies: ${table}`,
          description: `Table '${table}' has no Row Level Security policies`,
          fixSql: getRLSPolicySQL(table),
          canAutoFix: true,
        })
      }
    }
  } catch (error) {
    issues.push({
      id: "security-check-error",
      category: "security",
      severity: "medium",
      title: "Security Check Failed",
      description: error instanceof Error ? error.message : "Unknown error",
      canAutoFix: false,
    })
  }

  return issues
}

async function applyAutoFixes(issues: HealthIssue[]): Promise<void> {
  const serverClient = getSupabaseServerClient()

  for (const issue of issues) {
    if (issue.fixSql) {
      try {
        const { error } = await serverClient.rpc("execute_sql", {
          query_text: issue.fixSql,
        })

        if (error) {
          console.error(`Failed to apply fix for ${issue.id}:`, error)
        } else {
          console.log(`✅ Applied fix for ${issue.id}`)
        }
      } catch (error) {
        console.error(`Error applying fix for ${issue.id}:`, error)
      }
    }
  }
}

function calculateCategoryScores(issues: HealthIssue[]) {
  const categories = {
    structure: { score: 100, issues: 0 },
    data: { score: 100, issues: 0 },
    performance: { score: 100, issues: 0 },
    security: { score: 100, issues: 0 },
  }

  for (const issue of issues) {
    categories[issue.category].issues++

    const penalty = issue.severity === "high" ? 30 : issue.severity === "medium" ? 15 : 5
    categories[issue.category].score = Math.max(0, categories[issue.category].score - penalty)
  }

  return categories
}

function calculateOverallScore(categories: typeof categories) {
  const scores = Object.values(categories).map((cat) => cat.score)
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
}

function getCreateTableSQL(tableName: string): string {
  const schemas = {
    artworks: `
      CREATE TABLE IF NOT EXISTS artworks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        price NUMERIC(10,2) DEFAULT 0,
        creator_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
    users: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wallet_address TEXT UNIQUE,
        username TEXT,
        email TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
    purchases: `
      CREATE TABLE IF NOT EXISTS purchases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        artwork_id UUID,
        price NUMERIC(10,2),
        transaction_hash TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
    nft_tokens: `
      CREATE TABLE IF NOT EXISTS nft_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        artwork_id UUID,
        token_id TEXT,
        contract_address TEXT,
        owner_address TEXT,
        metadata_uri TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
  }

  return schemas[tableName as keyof typeof schemas] || ""
}

function getRLSPolicySQL(tableName: string): string {
  return `
    ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY IF NOT EXISTS "${tableName}_public_read" 
    ON ${tableName} FOR SELECT 
    TO public 
    USING (true);
    
    CREATE POLICY IF NOT EXISTS "${tableName}_authenticated_write" 
    ON ${tableName} FOR ALL 
    TO authenticated 
    USING (true);
  `
}
