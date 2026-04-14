import fs from "node:fs/promises"
import path from "node:path"
import { cache } from "react"
import type {
  Qualification,
  QualificationRelation,
  QualificationMetric,
  QualificationPastLink,
  QualificationQuizItem,
  SitePage,
} from "@/types/qualification"

type RawRow = Record<string, string>

type SiteDataFile = {
  fetchedAt: string
  qualifications_master: RawRow[]
  qualification_relations: RawRow[]
  qualification_metrics: RawRow[]
  qualification_past_links: RawRow[]
  qualification_quiz_items: RawRow[]
  site_pages: RawRow[]
  settings: RawRow[]
}

function toBool(v: string) {
  return v === "TRUE" || v === "true" || v === "1"
}

function toNum(v: string) {
  if (!v) return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}

const getSiteData = cache(async (): Promise<SiteDataFile> => {
  const filePath = path.join(process.cwd(), "data", "site-data.json")
  const text = await fs.readFile(filePath, "utf-8")
  return JSON.parse(text) as SiteDataFile
})

export const getQualifications = cache(async (): Promise<Qualification[]> => {
  const data = await getSiteData()

  return data.qualifications_master
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
      average_salary_min: toNum(r.average_salary_min),
      average_salary_max: toNum(r.average_salary_max),
      average_salary_note: r.average_salary_note,
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
})

export const getQualificationBySlug = cache(
  async (slug: string): Promise<Qualification | null> => {
    const items = await getQualifications()
    return items.find((q) => q.slug === slug) ?? null
  }
)

export const getRelations = cache(async (): Promise<QualificationRelation[]> => {
  const data = await getSiteData()

  return data.qualification_relations
    .map((r) => ({
      qualification_slug: r.qualification_slug,
      related_slug: r.related_slug,
      relation_type: r.relation_type,
      relation_weight: Number(r.relation_weight || 0),
      relation_reason: r.relation_reason,
      publish_flag: toBool(r.publish_flag),
    }))
    .filter((r) => r.publish_flag)
})

export const getComparedQualifications = cache(
  async (slug: string): Promise<Qualification[]> => {
    const [items, relations] = await Promise.all([getQualifications(), getRelations()])

    const related = relations
      .filter((r) => r.qualification_slug === slug && r.relation_type === "compared_with")
      .sort((a, b) => b.relation_weight - a.relation_weight)

    return related
      .map((r) => items.find((q) => q.slug === r.related_slug))
      .filter(Boolean) as Qualification[]
  }
)

export const getStaticPages = cache(async (): Promise<SitePage[]> => {
  const data = await getSiteData()

  return data.site_pages
    .map((r) => ({
      slug: r.slug,
      page_type: r.page_type,
      title: r.title,
      body_markdown: r.body_markdown,
      publish_flag: toBool(r.publish_flag),
    }))
    .filter((p) => p.publish_flag)
})

export const getQualificationMetrics = cache(
  async (): Promise<QualificationMetric[]> => {
    const data = await getSiteData()

    return data.qualification_metrics
      .map((r) => ({
        qualification_slug: r.qualification_slug,
        metric_year: toNum(r.metric_year),
        metric_period_label: r.metric_period_label,
        metric_exam_type: r.metric_exam_type,
        metric_subject: r.metric_subject,
        applicants_count: toNum(r.applicants_count),
        examinees_count: toNum(r.examinees_count),
        passers_count: toNum(r.passers_count),
        pass_rate: toNum(r.pass_rate),
        exam_fee_tax_included: toNum(r.exam_fee_tax_included),
        source_result_url: r.source_result_url,
        source_fee_url: r.source_fee_url,
        checked_at: r.checked_at,
        publish_flag: toBool(r.publish_flag),
        notes: r.notes,
      }))
      .filter((m) => m.publish_flag)
  }
)

export const getQualificationMetricsBySlug = cache(
  async (slug: string): Promise<QualificationMetric[]> => {
    const metrics = await getQualificationMetrics()

    return metrics
      .filter((m) => m.qualification_slug === slug)
      .sort((a, b) => {
        const yearA = a.metric_year ?? 0
        const yearB = b.metric_year ?? 0
        if (yearA !== yearB) return yearB - yearA
        return a.metric_subject.localeCompare(b.metric_subject)
      })
  }
)

export const getQualificationPastLinks = cache(
  async (): Promise<QualificationPastLink[]> => {
    const data = await getSiteData()

    return data.qualification_past_links
      .map((r) => ({
        qualification_slug: r.qualification_slug,
        link_type: r.link_type,
        link_title: r.link_title,
        link_url: r.link_url,
        display_order: toNum(r.display_order),
        publish_flag: toBool(r.publish_flag),
        notes: r.notes,
      }))
      .filter((item) => item.publish_flag)
  }
)

export const getQualificationPastLinksBySlug = cache(
  async (slug: string): Promise<QualificationPastLink[]> => {
    const items = await getQualificationPastLinks()

    return items
      .filter((item) => item.qualification_slug === slug)
      .sort((a, b) => (a.display_order ?? 9999) - (b.display_order ?? 9999))
  }
)

export const getQualificationQuizItems = cache(
  async (): Promise<QualificationQuizItem[]> => {
    const data = await getSiteData()

    return data.qualification_quiz_items
      .map((r) => ({
        qualification_slug: r.qualification_slug,
        question_type: r.question_type,
        question_text: r.question_text,
        choice_1: r.choice_1,
        choice_2: r.choice_2,
        choice_3: r.choice_3,
        choice_4: r.choice_4,
        answer_value: r.answer_value,
        explanation: r.explanation,
        display_order: toNum(r.display_order),
        publish_flag: toBool(r.publish_flag),
      }))
      .filter((item) => item.publish_flag)
  }
)

export const getQualificationQuizItemsBySlug = cache(
  async (slug: string): Promise<QualificationQuizItem[]> => {
    const items = await getQualificationQuizItems()

    return items
      .filter((item) => item.qualification_slug === slug)
      .sort((a, b) => (a.display_order ?? 9999) - (b.display_order ?? 9999))
  }
)