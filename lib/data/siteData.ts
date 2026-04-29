import fs from "node:fs/promises"
import path from "node:path"
import { cache } from "react"

export type RawRow = Record<string, string>

export type SiteDataFile = {
  fetchedAt: string
  qualifications_master: RawRow[]
  qualification_metrics: RawRow[]
  qualification_exam_schedules: RawRow[]
  qualification_resource_links: RawRow[]
  qualification_quiz_items: RawRow[]
  difficulty_benchmark_master: RawRow[]
  qualification_comparisons: RawRow[]
  list_pages: RawRow[]
  site_pages: RawRow[]
  settings: RawRow[]
}

export const getSiteData = cache(async (): Promise<SiteDataFile> => {
  const filePath = path.join(process.cwd(), "data", "site-data.json")
  const text = await fs.readFile(filePath, "utf-8")

  return JSON.parse(text) as SiteDataFile
})