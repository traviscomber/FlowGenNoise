"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Wand2, Copy, FileText, BarChart3, Sparkles, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PromptAnalysis {
  length: number
  wordCount: number
  hasGodlevelKeywords: boolean
  hasCulturalTerms: boolean
  hasTechnicalTerms: boolean
  maxLength: number
  utilizationPercentage: number
}

interface PromptManagerProps {
  prompt: string
  onPromptChange: (prompt: string) => void
  enhancementLevel: string
  onEnhance: () => void
  isEnhancing: boolean
}

export default function PromptManager({
  prompt,
  onPromptChange,
  enhancementLevel,
  onEnhance,
  isEnhancing,
}: PromptManagerProps) {
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null)
  const [qualityLevel, setQualityLevel] = useState("Basic")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Analyze prompt whenever it changes
  useEffect(() => {
    if (prompt.trim()) {
      analyzePrompt(prompt)
    } else {
      setAnalysis(null)
      setQualityLevel("Basic")
      setSuggestions([])
    }
  }, [prompt])

  const analyzePrompt = async (promptText: string) => {
    setIsAnalyzing(true)
    try {
      // Local analysis for immediate feedback
      const localAnalysis = {
        length: promptText.length,
        wordCount: promptText.split(/\s+/).length,
        hasGodlevelKeywords: /godlevel|museum|masterpiece|award-winning|professional|ultra-detailed/i.test(promptText),
        hasCulturalTerms: /cultural|heritage|traditional|authentic|respectful/i.test(promptText),
        hasTechnicalTerms: /8K|resolution|quality|composition|lighting|cinematic/i.test(promptText),
        maxLength: 4000,
        utilizationPercentage: Math.round((promptText.length / 4000) * 100),
      }

      setAnalysis(localAnalysis)

      // Determine quality level
      let quality = "Basic"
      if (localAnalysis.hasGodlevelKeywords && localAnalysis.hasCulturalTerms && localAnalysis.hasTechnicalTerms) {
        quality = "GODLEVEL"
      } else if (
        localAnalysis.hasGodlevelKeywords ||
        (localAnalysis.hasCulturalTerms && localAnalysis.hasTechnicalTerms)
      ) {
        quality = "Professional"
      } else if (localAnalysis.hasCulturalTerms || localAnalysis.hasTechnicalTerms) {
        quality = "Enhanced"
      }

      setQualityLevel(quality)

      // Generate suggestions
      const newSuggestions = []
      if (!localAnalysis.hasGodlevelKeywords) {
        newSuggestions.push("Use AI enhancement for GODLEVEL quality descriptors")
      }
      if (!localAnalysis.hasCulturalTerms) {
        newSuggestions.push("Add cultural heritage and respectful representation terms")
      }
      if (!localAnalysis.hasTechnicalTerms) {
        newSuggestions.push("Include technical photography and quality specifications")
      }
      if (localAnalysis.length < 500) {
        newSuggestions.push("Prompt could be more detailed for better results")
      }
      if (localAnalysis.length > 3800) {
        newSuggestions.push("Prompt is near character limit - consider optimization")
      }

      setSuggestions(newSuggestions)
    } catch (error) {
      console.error("Prompt analysis error:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      toast({
        title: "✅ Copied to Clipboard",
        description: "Prompt has been copied to your clipboard",
      })
    } catch (error) {
      toast({
        title: "❌ Copy Failed",
        description: "Could not copy prompt to clipboard",
        variant: "destructive",
      })
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "GODLEVEL":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
      case "Professional":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
      case "Enhanced":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 95) return "text-red-600"
    if (percentage >= 80) return "text-yellow-600"
    if (percentage >= 60) return "text-blue-600"
    return "text-green-600"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>GODLEVEL Prompt Manager</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {analysis && <Badge className={getQualityColor(qualityLevel)}>{qualityLevel}</Badge>}
            {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </div>
        <CardDescription>Manage and optimize your prompts for maximum artistic quality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prompt Editor */}
        <div className="space-y-2">
          <Label>Prompt Content</Label>
          <Textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Enter your GODLEVEL prompt here..."
            rows={6}
            className="font-mono text-sm"
          />
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>
              Characters: {analysis?.length || 0} / {analysis?.maxLength || 4000}
            </span>
            <span className={analysis ? getUtilizationColor(analysis.utilizationPercentage) : ""}>
              {analysis?.utilizationPercentage || 0}% utilized
            </span>
          </div>
          {analysis && <Progress value={analysis.utilizationPercentage} className="w-full h-2" />}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={onEnhance}
            disabled={isEnhancing || !prompt.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isEnhancing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                AI Enhance ({enhancementLevel})
              </>
            )}
          </Button>

          <Button onClick={copyToClipboard} variant="outline" disabled={!prompt.trim()}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <h3 className="font-semibold">Prompt Analysis</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analysis.length}</div>
                  <div className="text-sm text-gray-600">Characters</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analysis.wordCount}</div>
                  <div className="text-sm text-gray-600">Words</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{analysis.utilizationPercentage}%</div>
                  <div className="text-sm text-gray-600">Utilized</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div
                    className={`text-2xl font-bold ${getQualityColor(qualityLevel).includes("purple") ? "text-purple-600" : "text-gray-600"}`}
                  >
                    {qualityLevel}
                  </div>
                  <div className="text-sm text-gray-600">Quality</div>
                </div>
              </div>

              {/* Feature Detection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  {analysis.hasGodlevelKeywords ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm">GODLEVEL Keywords</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  {analysis.hasCulturalTerms ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm">Cultural Terms</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  {analysis.hasTechnicalTerms ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm">Technical Terms</span>
                </div>
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-semibold">Suggestions for Improvement:</div>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Quality Achievement */}
              {qualityLevel === "GODLEVEL" && (
                <Alert className="border-purple-200 bg-purple-50">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <AlertDescription className="text-purple-800">
                    <strong>🎉 GODLEVEL Quality Achieved!</strong> Your prompt contains all the elements for premium
                    artistic generation: quality descriptors, cultural terms, and technical specifications.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
