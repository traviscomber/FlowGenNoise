import { NextResponse } from "next/server"
import { buildPrompt } from "@/lib/ai-prompt"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { dataset, scenario, colorScheme, customPrompt } = body as {
      dataset: string
      scenario?: string
      colorScheme: string
      customPrompt?: string
    }

    const prompt = buildPrompt(dataset, scenario, colorScheme, customPrompt)
    return NextResponse.json({ prompt, length: prompt.length })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to build prompt" }, { status: 400 })
  }
}
