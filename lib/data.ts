import { getSheetValues } from "./sheets"
import type { Qualification, QualificationRelation, SitePage } from "@/types/qualification"

function rowsToObjects<T>(rows: string[][]): T[] {
  if (rows.length === 0) return []
  const [header, ...data] = rows
  return data.map((row) => {
    const obj: Record<string, string> = {}
    header.forEach((key, i) => {
      obj[key] = row[i] ?? ""
    })
    return obj as T
  })
}

function toBool(v: string) {
  return v === "TRUE" || v === "true" || v === "1"
}

function toNum(v: string) {
  if (!v) return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}

export async function getQualifications(): Promise<Qualification[]> {
  const rows = await getSheetValues("qualifications_master!A:ZZ")
  const raw = rowsToObjects<Record<string, string>>(rows)

  return raw
    .map((r) => ({
      slug: r.slug,
      name_ja: r.name_ja,
      name_short: r.name_short,
      category_primary: r.category_primary,
      qualification_type: r.qualification_type,
      issuing_body: r.issuing_body,
      official_site_url: r.official_site_url,
      exam_frequency_text: r.exam_frequency_text,
      eligibility_text: r.eligibility_text,
      exam_format_text: r.exam_format_text,
      pass_rate_latest: toNum(r.pass_rate_latest),
      study_hours_min: toNum(r.study_hours_min),
      study_hours_max: toNum(r.study_hours_max),
      exam_fee_tax_included: toNum(r.exam_fee_tax_included),
      exclusive_work_flag: toBool(r.exclusive_work_flag),
      difficulty_score: toNum(r.difficulty_score),
      self_study_score: toNum(r.self_study_score),
      cost_performance_score: toNum(r.cost_performance_score),
      career_value_score: toNum(r.career_value_score),
      summary_short: r.summary_short,
      difficulty_reason_text: r.difficulty_reason_text,
      who_should_take: r.who_should_take,
      who_should_not_take: r.who_should_not_take,
      source_pass_rate_url: r.source_pass_rate_url,
      source_fee_url: r.source_fee_url,
      source_eligibility_url: r.source_eligibility_url,
      last_verified_at: r.last_verified_at,
      publish_flag: toBool(r.publish_flag),
    }))
    .filter((q) => q.publish_flag)
}

export async function getQualificationBySlug(slug: string) {
  const items = await getQualifications()
  return items.find((q) => q.slug === slug) ?? null
}

export async function getRelations(): Promise<QualificationRelation[]> {
  const rows = await getSheetValues("qualification_relations!A:ZZ")
  const raw = rowsToObjects<Record<string, string>>(rows)

  return raw
    .map((r) => ({
      qualification_slug: r.qualification_slug,
      related_slug: r.related_slug,
      relation_type: r.relation_type,
      relation_weight: Number(r.relation_weight || 0),
      relation_reason: r.relation_reason,
      publish_flag: toBool(r.publish_flag),
    }))
    .filter((r) => r.publish_flag)
}

export async function getComparedQualifications(slug: string) {
  const [items, relations] = await Promise.all([getQualifications(), getRelations()])
  const related = relations
    .filter((r) => r.qualification_slug === slug && r.relation_type === "compared_with")
    .sort((a, b) => b.relation_weight - a.relation_weight)

  return related
    .map((r) => items.find((q) => q.slug === r.related_slug))
    .filter(Boolean) as Qualification[]
}

export async function getStaticPages(): Promise<SitePage[]> {
  const rows = await getSheetValues("site_pages!A:ZZ")
  const raw = rowsToObjects<Record<string, string>>(rows)

  return raw
    .map((r) => ({
      slug: r.slug,
      page_type: r.page_type,
      title: r.title,
      body_markdown: r.body_markdown,
      publish_flag: toBool(r.publish_flag),
    }))
    .filter((p) => p.publish_flag)
}