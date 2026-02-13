"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { cn } from "@/lib/utils"
import type { GeoData } from "@/lib/geo"

interface FindAProFormProps {
  geoData: GeoData
  categorySlug: string
  subServiceSlug?: string
}

export function FindAProForm({ geoData, categorySlug, subServiceSlug }: FindAProFormProps) {
  const [name, setName] = useState("")
  const [postalCode, setPostalCode] = useState(geoData.postalCode ?? "")
  const [jobDescription, setJobDescription] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !postalCode.trim()) return

    setStatus("submitting")
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categorySlug,
          subServiceSlug,
          name: name.trim(),
          postalCode: postalCode.trim(),
          jobDescription: jobDescription.trim() || undefined,
          detectedCity: geoData.city,
          detectedRegion: geoData.region,
        }),
      })
      if (!res.ok) throw new Error("Failed to submit")
      setStatus("success")
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-success-container bg-success-container/30 p-8 text-center space-y-3">
        <h3 className="font-display text-xl font-bold text-on-surface">Request Submitted!</h3>
        <p className="text-on-surface-variant">
          We\'re connecting you with pros{geoData.city ? ` in ${geoData.city}` : " near you"}. You\'ll hear back soon.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {geoData.city && (
        <p className="text-sm text-accent font-medium flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          Finding pros near {geoData.city}{geoData.region ? `, ${geoData.region}` : ""}
        </p>
      )}
      <Input
        id="name"
        label="Your Name"
        placeholder="John Smith"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        id="postalCode"
        label="Zip Code / Postcode"
        placeholder="Enter your zip code"
        value={postalCode}
        onChange={(e) => setPostalCode(e.target.value)}
        required
      />
      <div className="w-full">
        <label htmlFor="jobDescription" className="block text-sm font-medium text-on-surface-variant mb-1.5">
          Describe Your Job (optional)
        </label>
        <textarea
          id="jobDescription"
          className={cn(
            "flex w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "placeholder:text-outline min-h-[100px] resize-y"
          )}
          placeholder="Tell us what you need help with..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </div>
      {status === "error" && (
        <p className="text-sm text-error">Something went wrong. Please try again.</p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={status === "submitting"}>
        {status === "submitting" ? "Submitting..." : "Find Pros"}
      </Button>
    </form>
  )
}
