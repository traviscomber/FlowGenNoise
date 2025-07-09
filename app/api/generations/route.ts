import { NextResponse } from "next/server"
import { getGenerations } from "@/lib/supabase"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const generations = await getGenerations(limit)

    return NextResponse.json({
      generations,
      count: generations.length,
    })
  } catch (error) {
    console.error("Error fetching generations:", error)
    return NextResponse.json({ error: "Failed to fetch generations" }, { status: 500 })
  }
}
