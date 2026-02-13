"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { AiConfigPanel } from "./AiConfigPanel"

interface Section {
  id: string
  pageType: string
  pageId: string
  sectionType: string
  content: string | null
  sortOrder: number | null
  updatedAt: string | null
}

const SECTION_TYPES = [
  "hero",
  "content",
  "faq",
  "pricing",
  "image",
  "tips",
  "questions",
]

function SectionRow({
  section,
  onUpdate,
  onDelete,
}: {
  section: Section
  onUpdate: (id: string, data: Partial<Section>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const [sectionType, setSectionType] = useState(section.sectionType)
  const [contentStr, setContentStr] = useState(section.content ?? "")
  const [sortOrder, setSortOrder] = useState(section.sortOrder ?? 0)
  const [saving, setSaving] = useState(false)
  const [showAi, setShowAi] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await onUpdate(section.id, { sectionType, content: contentStr, sortOrder })
    } finally {
      setSaving(false)
    }
  }

  function handleContentGenerated(newContent: string) {
    setContentStr(newContent)
    // Also auto-save when AI generates content
    onUpdate(section.id, { content: newContent })
  }

  return (
    <div className="border border-outline-variant/50 rounded-lg">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-container/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-md bg-primary-container px-2.5 py-0.5 text-xs font-medium text-on-primary-container">
            {section.sectionType}
          </span>
          <span className="text-sm text-on-surface-variant">Order: {section.sortOrder}</span>
        </div>
        <svg
          className={`h-5 w-5 text-on-surface-variant transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="p-4 pt-0 space-y-4 border-t border-outline-variant/30">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Section Type</label>
              <select
                value={sectionType}
                onChange={(e) => setSectionType(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {SECTION_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <Input
              label="Sort Order"
              type="number"
              value={String(sortOrder)}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Content (JSON)</label>
            <textarea
              className="flex w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[200px]"
              value={contentStr}
              onChange={(e) => setContentStr(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Section"}
            </Button>
            <Button
              size="sm"
              variant="tonal"
              onClick={() => setShowAi(!showAi)}
            >
              {showAi ? "Hide AI" : "AI Generate"}
            </Button>
            <Button
              size="sm"
              variant="text"
              className="text-error ml-auto"
              onClick={() => {
                if (confirm("Delete this section?")) onDelete(section.id)
              }}
            >
              Delete
            </Button>
          </div>

          {showAi && (
            <AiConfigPanel
              sectionId={section.id}
              sectionType={sectionType}
              onContentGenerated={handleContentGenerated}
            />
          )}
        </div>
      )}
    </div>
  )
}

export function SectionEditor({
  pageType,
  pageId,
  sections: initialSections,
}: {
  pageType: string
  pageId: string
  sections: Section[]
}) {
  const router = useRouter()
  const [sections, setSections] = useState(initialSections)
  const [adding, setAdding] = useState(false)
  const [newType, setNewType] = useState("content")

  async function handleAdd() {
    setAdding(true)
    try {
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageType,
          pageId,
          sectionType: newType,
          content: "{}",
          sortOrder: sections.length,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setSections([...sections, {
          id: data.id,
          pageType,
          pageId,
          sectionType: newType,
          content: "{}",
          sortOrder: sections.length,
          updatedAt: new Date().toISOString(),
        }])
      }
    } finally {
      setAdding(false)
    }
  }

  async function handleUpdate(id: string, data: Partial<Section>) {
    const res = await fetch(`/api/admin/sections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setSections(sections.map((s) => s.id === id ? { ...s, ...data } : s))
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/sections/${id}`, { method: "DELETE" })
    if (res.ok) {
      setSections(sections.filter((s) => s.id !== id))
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Page Sections ({sections.length})</CardTitle>
          <div className="flex items-center gap-2">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="h-9 rounded-lg border border-outline-variant bg-white px-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {SECTION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <Button size="sm" onClick={handleAdd} disabled={adding}>
              {adding ? "Adding..." : "Add Section"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sections.length === 0 ? (
          <p className="text-center text-on-surface-variant py-8">
            No sections yet. Add one above.
          </p>
        ) : (
          <div className="space-y-3">
            {sections.map((section) => (
              <SectionRow
                key={section.id}
                section={section}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
