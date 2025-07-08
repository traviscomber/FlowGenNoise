import { getSupabaseServerClient } from "./supabase"

export interface HealthCheckResult {
  category: string
  issue: string
  severity: "low" | "medium" | "high" | "critical"
  fixable: boolean
  sqlFix?: string
  description: string
}

export interface HealthScore {
  overall: number
  categories: {
    structure: number
    data: number
    performance: number
    security: number
  }
}

export class DatabaseHealthChecker {
  private client = getSupabaseServerClient()

  async runFullHealthCheck(): Promise<{
    results: HealthCheckResult[]
    score: HealthScore
  }> {
    const results: HealthCheckResult[] = []

    // Check table structure
    const structureIssues = await this.checkTableStructure()
    results.push(...structureIssues)

    // Check data consistency
    const dataIssues = await this.checkDataConsistency()
    results.push(...dataIssues)

    // Check performance
    const performanceIssues = await this.checkPerformance()
    results.push(...performanceIssues)

    // Check security
    const securityIssues = await this.checkSecurity()
    results.push(...securityIssues)

    const score = this.calculateHealthScore(results)

    return { results, score }
  }

  private async checkTableStructure(): Promise<HealthCheckResult[]> {
    const issues: HealthCheckResult[] = []

    // Check if required tables exist
    const requiredTables = ["artworks", "transactions", "nft_metadata"]

    for (const table of requiredTables) {
      const { data, error } = await this.client
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_name", table)
        .eq("table_schema", "public")

      if (error || !data || data.length === 0) {
        issues.push({
          category: "Structure",
          issue: `Missing table: ${table}`,
          severity: "critical",
          fixable: true,
          sqlFix: this.getCreateTableSQL(table),
          description: `The ${table} table is required for the application to function properly.`,
        })
      }
    }

    // Check for required columns
    await this.checkRequiredColumns(issues)

    return issues
  }

  private async checkRequiredColumns(issues: HealthCheckResult[]) {
    const requiredColumns = {
      artworks: ["id", "title", "description", "image_url", "price", "status", "created_at"],
      transactions: ["id", "artwork_id", "buyer_address", "amount", "transaction_hash", "created_at"],
      nft_metadata: ["id", "artwork_id", "token_id", "contract_address", "metadata_uri"],
    }

    for (const [table, columns] of Object.entries(requiredColumns)) {
      for (const column of columns) {
        const { data } = await this.client.rpc("get_table_columns", { tbl_name: table })

        if (data && !data.some((col: any) => col.column_name === column)) {
          issues.push({
            category: "Structure",
            issue: `Missing column: ${table}.${column}`,
            severity: "high",
            fixable: true,
            sqlFix: this.getAddColumnSQL(table, column),
            description: `The ${column} column is required in the ${table} table.`,
          })
        }
      }
    }
  }

  private async checkDataConsistency(): Promise<HealthCheckResult[]> {
    const issues: HealthCheckResult[] = []

    // Check for negative prices
    const { data: negativePrice } = await this.client.from("artworks").select("id").lt("price", 0)

    if (negativePrice && negativePrice.length > 0) {
      issues.push({
        category: "Data",
        issue: `${negativePrice.length} artworks with negative prices`,
        severity: "medium",
        fixable: true,
        sqlFix: "UPDATE artworks SET price = 0 WHERE price < 0;",
        description: "Artworks cannot have negative prices.",
      })
    }

    // Check for orphaned transactions
    const { data: orphanedTransactions } = await this.client
      .from("transactions")
      .select("id, artwork_id")
      .not("artwork_id", "in", `(SELECT id FROM artworks)`)

    if (orphanedTransactions && orphanedTransactions.length > 0) {
      issues.push({
        category: "Data",
        issue: `${orphanedTransactions.length} orphaned transactions`,
        severity: "high",
        fixable: true,
        sqlFix: "DELETE FROM transactions WHERE artwork_id NOT IN (SELECT id FROM artworks);",
        description: "Transactions reference non-existent artworks.",
      })
    }

    return issues
  }

  private async checkPerformance(): Promise<HealthCheckResult[]> {
    const issues: HealthCheckResult[] = []

    // Check for missing indexes
    const requiredIndexes = [
      { name: "idx_artworks_created_at", table: "artworks", column: "created_at" },
      { name: "idx_artworks_price", table: "artworks", column: "price" },
      { name: "idx_transactions_artwork_id", table: "transactions", column: "artwork_id" },
    ]

    for (const index of requiredIndexes) {
      const { data } = await this.client.rpc("check_index_exists", { idx_name: index.name })

      if (!data) {
        issues.push({
          category: "Performance",
          issue: `Missing index: ${index.name}`,
          severity: "medium",
          fixable: true,
          sqlFix: `CREATE INDEX ${index.name} ON ${index.table}(${index.column});`,
          description: `Index on ${index.table}.${index.column} will improve query performance.`,
        })
      }
    }

    return issues
  }

  private async checkSecurity(): Promise<HealthCheckResult[]> {
    const issues: HealthCheckResult[] = []

    // Check RLS policies
    const criticalTables = ["artworks", "transactions"]

    for (const table of criticalTables) {
      const { data } = await this.client.rpc("check_rls_enabled", { tbl_name: table })

      if (!data) {
        issues.push({
          category: "Security",
          issue: `RLS not enabled on ${table}`,
          severity: "high",
          fixable: true,
          sqlFix: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`,
          description: `Row Level Security should be enabled on ${table} for data protection.`,
        })
      }
    }

    return issues
  }

  private calculateHealthScore(results: HealthCheckResult[]): HealthScore {
    const totalIssues = results.length
    const criticalIssues = results.filter((r) => r.severity === "critical").length
    const highIssues = results.filter((r) => r.severity === "high").length
    const mediumIssues = results.filter((r) => r.severity === "medium").length

    // Calculate overall score (0-100)
    const penalty = criticalIssues * 25 + highIssues * 15 + mediumIssues * 5
    const overall = Math.max(0, 100 - penalty)

    // Calculate category scores
    const categories = {
      structure: this.getCategoryScore(results, "Structure"),
      data: this.getCategoryScore(results, "Data"),
      performance: this.getCategoryScore(results, "Performance"),
      security: this.getCategoryScore(results, "Security"),
    }

    return { overall, categories }
  }

  private getCategoryScore(results: HealthCheckResult[], category: string): number {
    const categoryIssues = results.filter((r) => r.category === category)
    if (categoryIssues.length === 0) return 100

    const penalty = categoryIssues.reduce((sum, issue) => {
      switch (issue.severity) {
        case "critical":
          return sum + 30
        case "high":
          return sum + 20
        case "medium":
          return sum + 10
        case "low":
          return sum + 5
        default:
          return sum
      }
    }, 0)

    return Math.max(0, 100 - penalty)
  }

  async autoFixIssues(issues: HealthCheckResult[]): Promise<{
    fixed: number
    failed: number
    results: string[]
  }> {
    let fixed = 0
    let failed = 0
    const results: string[] = []

    const fixableIssues = issues.filter((issue) => issue.fixable && issue.sqlFix)

    for (const issue of fixableIssues) {
      try {
        const { data, error } = await this.client.rpc("execute_sql", {
          query_text: issue.sqlFix,
        })

        if (error) {
          failed++
          results.push(`Failed to fix: ${issue.issue} - ${error.message}`)
        } else {
          fixed++
          results.push(`Fixed: ${issue.issue}`)
        }
      } catch (err) {
        failed++
        results.push(`Failed to fix: ${issue.issue} - ${err}`)
      }
    }

    return { fixed, failed, results }
  }

  private getCreateTableSQL(table: string): string {
    const schemas = {
      artworks: `
        CREATE TABLE artworks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          image_url TEXT NOT NULL,
          price DECIMAL(10,2) NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'available',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      transactions: `
        CREATE TABLE transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          artwork_id UUID REFERENCES artworks(id),
          buyer_address TEXT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          transaction_hash TEXT UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      nft_metadata: `
        CREATE TABLE nft_metadata (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          artwork_id UUID REFERENCES artworks(id),
          token_id TEXT,
          contract_address TEXT,
          metadata_uri TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    }

    return schemas[table as keyof typeof schemas] || ""
  }

  private getAddColumnSQL(table: string, column: string): string {
    const columnDefinitions: Record<string, Record<string, string>> = {
      artworks: {
        title: "ADD COLUMN title TEXT NOT NULL DEFAULT ''",
        description: "ADD COLUMN description TEXT",
        image_url: "ADD COLUMN image_url TEXT NOT NULL DEFAULT ''",
        price: "ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0",
        status: "ADD COLUMN status TEXT NOT NULL DEFAULT 'available'",
        created_at: "ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()",
      },
    }

    const def = columnDefinitions[table]?.[column]
    return def ? `ALTER TABLE ${table} ${def};` : ""
  }
}

export async function runDatabaseHealthCheck(autoFix = false) {
  const checker = new DatabaseHealthChecker()
  const { results, score } = await checker.runFullHealthCheck()

  let fixResults = null
  if (autoFix) {
    fixResults = await checker.autoFixIssues(results)
  }

  return { results, score, fixResults }
}
