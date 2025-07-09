import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ngtfnkcszgnmpddfgdst.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndGZua2NzemdubXBkZGZnZHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTUzNTcsImV4cCI6MjA2NzQ3MTM1N30.Gg-hbKTbSo_M1cUVkwz2gqp1tyyFtqp5UBTG_WI-8bg"

function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function createSupabaseClient() {
  if (!validateUrl(supabaseUrl)) {
    console.error("[supabase] Invalid URL:", supabaseUrl)
    throw new Error("Invalid Supabase URL configuration")
  }

  if (!supabaseAnonKey || supabaseAnonKey.length < 10) {
    console.error("[supabase] Invalid anon key")
    throw new Error("Invalid Supabase anon key configuration")
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient()
  }
  return supabaseInstance
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    const client = getSupabaseClient()
    return client[prop as keyof typeof client]
  },
})

export default supabase
