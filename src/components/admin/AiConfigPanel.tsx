"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"

interface AiConfigPanelProps {
  sectionId: string
  sectionType: string
  onContentGenerated: (content: string) => void
}

const PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "gemini", label: "Google Gemini" },
  { value: "replicate", label: "Replicate (Images)" },
]

const MODELS: Record<string, { value: string; label: string }[]> = {
  openai: [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4.1", label: "GPT-4.1" },
  ],
  anthropic: [
    { value: "claude-sonnet-4-5-20250929", label: "Claude Sonnet 4.5" },
    { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
  ],
  gemini: [
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  ],
  replicate: [
    { value: "black-forest-labs/flux-schnell", label: "Flux Schnell" },
    { value: "black-forest-labs/flux-1.1-pro", label: "Flux 1.1 Pro" },
  ],
}

const PROMPT_TEMPLATES: Record<string, string> = {
  content: "Write engaging, informative content about {{topic}} for homeowners looking to hire a professional. Include practical advice and what to expect.",
  faq: "Generate 5-7 frequently asked questions and detailed answers about {{topic}} that homeowners commonly ask before hiring a professional.",
  pricing: "Create a pricing guide for {{topic}} with 4-6 common service items, typical price ranges (low and high), and helpful notes about what affects pricing.",
  tips: "Write 5-8 practical tips for homeowners about {{topic}}. Focus on what they should know before, during, and after hiring a professional.",
  questions: "Generate 6-8 important questions that homeowners should ask a professional about {{topic}} before hiring them.",
  hero: "Write a compelling hero section title and subtitle for a {{topic}} services page that encourages homeowners to find a trusted professional.",
  image: "A professional photograph of a skilled tradesperson performing {{topic}} work in a modern home, high quality, well-lit",
}

export function AiConfigPanel({ sectionId, sectionType, onContentGenerated }: AiConfigPanelProps) {
  const [provider, setProvider] = useState("openai")
  const [model, setModel] = useState("gpt-4o")
  const [prompt, setPrompt] = useState(PROMPT_TEMPLATES[sectionType] ?? "")
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  // Load existing AI config for this section
  useEffect(() => {
    fetch(`/api/admin/ai/config?sectionId=${sectionId}`)
      .then((r) => r.json())
      .then((config) => {
        if (config) {
          setProvider(config.provider)
          setModel(config.model || MODELS[config.provider]?.[0]?.value || "")
          setPrompt(config.prompt)
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [sectionId])

  // Update model when provider changes
  useEffect(() => {
    const models = MODELS[provider]
    if (models && !models.some((m) => m.value === model)) {
      setModel(models[0]?.value ?? "")
    }
  }, [provider])

  async function handleGenerate() {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, provider, model, prompt, sectionType }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Generation failed")
        return
      }
      onContentGenerated(data.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed")
    } finally {
      setGenerating(false)
    }
  }

  if (!loaded) return null

  return (
    <div className="mt-4 p-4 rounded-lg bg-surface-container/50 border border-outline-variant/30 space-y-3">
      <h4 className="text-sm font-semibold text-on-surface flex items-center gap-2">
        <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        AI Content Generation
      </h4>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-on-surface-variant mb-1">Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="h-9 w-full rounded-lg border border-outline-variant bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-on-surface-variant mb-1">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="h-9 w-full rounded-lg border border-outline-variant bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {(MODELS[provider] ?? []).map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-on-surface-variant mb-1">
          Prompt
          <span className="text-outline ml-1">{"(use {{topic}} as placeholder)"}</span>
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
        />
      </div>

      {error && (
        <p className="text-sm text-error">{error}</p>
      )}

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleGenerate} disabled={generating || !prompt}>
          {generating ? "Generating..." : "Generate"}
        </Button>
        {!generating && (
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setPrompt(PROMPT_TEMPLATES[sectionType] ?? "")}
          >
            Reset Prompt
          </Button>
        )}
      </div>
    </div>
  )
}
