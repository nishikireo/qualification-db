import fs from "node:fs/promises"
import path from "node:path"
import { cache } from "react"
import type {
  DifficultyBenchmark,
  ListPage,
  Qualification,
  QualificationComparison,
  QualificationMetric,
  QualificationResourceLink,
  QualificationQuizItem,
  QualificationExamSchedule,
  SitePage,
} from "@/types/qualification"

type RawRow = Record<string, string>

type SiteDataFile = {
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
      official_exam_guide_url: r.official_exam_guide_url,
      status: r.status,

      exam_frequency_text: r.exam_frequency_text,
      exam_months_text: r.exam_months_text,
      eligibility_text: r.eligibility_text,
      exam_format_text: r.exam_format_text,

      pass_rate_latest: toNum(r.pass_rate_latest),
      study_hours_min: toNum(r.study_hours_min),
      study_hours_max: toNum(r.study_hours_max),
      exam_fee_tax_included: toNum(r.exam_fee_tax_included),

      average_salary_min: toNum(r.average_salary_min),
      average_salary_max: toNum(r.average_salary_max),
      average_salary_note: r.average_salary_note,
      source_average_salary_url: r.source_average_salary_url,

      renewal_required: toBool(r.renewal_required),
      renewal_text: r.renewal_text,

      exclusive_work_flag: toBool(r.exclusive_work_flag),
      exclusive_work_text: r.exclusive_work_text,

      difficulty_deviation: toNum(r.difficulty_deviation),
      self_study_score: toNum(r.self_study_score),
      cost_performance_score: toNum(r.cost_performance_score),
      career_value_score: toNum(r.career_value_score),
      job_relevance_score: toNum(r.job_relevance_score),
      salary_up_potential_score: toNum(r.salary_up_potential_score),
      brand_recognition_score: toNum(r.brand_recognition_score),
      practicality_score: toNum(r.practicality_score),

      summary_short: r.summary_short,
      difficulty_reason_text: r.difficulty_reason_text,
      who_should_take: r.who_should_take,
      who_should_not_take: r.who_should_not_take,

      source_pass_rate_url: r.source_pass_rate_url,
      source_fee_url: r.source_fee_url,
      source_eligibility_url: r.source_eligibility_url,
      last_verified_at: r.last_verified_at,
      publish_flag: toBool(r.publish_flag),

      passing_criteria_text: String(r.passing_criteria_text ?? ""),
      application_period_summary: String(r.application_period_summary ?? ""),
      exam_schedule_summary: String(r.exam_schedule_summary ?? ""),
      test_location_summary: String(r.test_location_summary ?? ""),
      source_schedule_url: String(r.source_schedule_url ?? ""),
    }))
    .filter((q) => q.publish_flag)
})

export const getQualificationBySlug = cache(
  async (slug: string): Promise<Qualification | null> => {
    const items = await getQualifications()
    return items.find((q) => q.slug === slug) ?? null
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

export const getListPages = cache(async (): Promise<ListPage[]> => {
  const data = await getSiteData()

  return data.list_pages
    .map((r) => ({
      slug: r.slug,
      title: r.title,
      description: r.description,
      primary_metric: r.primary_metric,
      secondary_filter: r.secondary_filter,
      publish_recommendation: toBool(r.publish_recommendation),
    }))
    .filter((p) => p.publish_recommendation)
})

export const getListPageBySlug = cache(
  async (slug: string): Promise<ListPage | null> => {
    const pages = await getListPages()
    return pages.find((p) => p.slug === slug) ?? null
  }
)

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

export const getQualificationResourceLinks = cache(
  async (): Promise<QualificationResourceLink[]> => {
    const data = await getSiteData()

    return data.qualification_resource_links
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

export const getQualificationResourceLinksBySlug = cache(
  async (slug: string): Promise<QualificationResourceLink[]> => {
    const items = await getQualificationResourceLinks()

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

export const getDifficultyBenchmarks = cache(
  async (): Promise<DifficultyBenchmark[]> => {
    const data = await getSiteData()

    return data.difficulty_benchmark_master
      .map((r) => ({
        min_deviation: toNum(r.min_deviation),
        max_deviation: toNum(r.max_deviation),
        band_label: r.band_label,
        band_order: toNum(r.band_order),
        university_group: r.university_group,
        university_examples: r.university_examples,
        note: r.note,
        publish_flag: toBool(r.publish_flag),
      }))
      .filter((item) => item.publish_flag)
      .sort((a, b) => (b.min_deviation ?? 0) - (a.min_deviation ?? 0))
  }
)

export const getDifficultyBenchmarkByDeviation = cache(
  async (
    deviation: number | null | undefined
  ): Promise<DifficultyBenchmark | null> => {
    if (deviation === null || deviation === undefined) return null

    const items = await getDifficultyBenchmarks()

    return (
      items.find((item) => {
        const min = item.min_deviation ?? -Infinity
        const max = item.max_deviation ?? Infinity
        return deviation >= min && deviation <= max
      }) ?? null
    )
  }
)
export const getQualificationComparisons = cache(
  async (): Promise<QualificationComparison[]> => {
    const data = await getSiteData()

    return data.qualification_comparisons
      .map((r) => ({
        comparison_slug: r.comparison_slug,
        left_slug: r.left_slug,
        right_slug: r.right_slug,

        relation_type: r.relation_type || "compared_with",
        relation_weight: toNum(r.relation_weight),
        relation_reason: r.relation_reason,

        search_intent_type: r.search_intent_type,
        knowledge_overlap_rate: toNum(r.knowledge_overlap_rate),

        left_to_right_hours_min: toNum(r.left_to_right_hours_min),
        left_to_right_hours_max: toNum(r.left_to_right_hours_max),
        right_to_left_hours_min: toNum(r.right_to_left_hours_min),
        right_to_left_hours_max: toNum(r.right_to_left_hours_max),

        recommended_order: r.recommended_order,

        conversion_summary: r.conversion_summary,
        overlap_summary: r.overlap_summary,
        left_to_right_summary: r.left_to_right_summary,
        right_to_left_summary: r.right_to_left_summary,
        decision_summary: r.decision_summary,

        faq_1_question: r.faq_1_question,
        faq_1_answer: r.faq_1_answer,
        faq_2_question: r.faq_2_question,
        faq_2_answer: r.faq_2_answer,
        faq_3_question: r.faq_3_question,
        faq_3_answer: r.faq_3_answer,
        faq_4_question: r.faq_4_question,
        faq_4_answer: r.faq_4_answer,
        faq_5_question: r.faq_5_question,
        faq_5_answer: r.faq_5_answer,

        evidence_note: r.evidence_note,
        source_url_1: r.source_url_1,
        source_url_2: r.source_url_2,
        last_verified_at: r.last_verified_at,

        publish_flag: toBool(r.publish_flag),
      }))
      .filter((item) => item.publish_flag)
      .sort((a, b) => (b.relation_weight ?? 0) - (a.relation_weight ?? 0))
  }
)

export const getQualificationComparisonBySlug = cache(
  async (comparisonSlug: string): Promise<QualificationComparison | null> => {
    const comparisons = await getQualificationComparisons()
    return comparisons.find((item) => item.comparison_slug === comparisonSlug) ?? null
  }
)

export const getQualificationComparisonsByQualificationSlug = cache(
  async (slug: string): Promise<QualificationComparison[]> => {
    const comparisons = await getQualificationComparisons()

    return comparisons
      .filter((item) => item.left_slug === slug || item.right_slug === slug)
      .sort((a, b) => (b.relation_weight ?? 0) - (a.relation_weight ?? 0))
  }
)

export const getQualificationExamSchedules = cache(
  async (): Promise<QualificationExamSchedule[]> => {
    const data = await getSiteData()
    const rows = data.qualification_exam_schedules ?? []

    return rows
      .map((r) => ({
        qualification_slug: r.qualification_slug,
        exam_year: toNum(r.exam_year),
        exam_period_label: r.exam_period_label,
        application_start_date: r.application_start_date,
        application_end_date: r.application_end_date,
        exam_start_date: r.exam_start_date,
        exam_end_date: r.exam_end_date,
        result_date: r.result_date,
        test_locations: r.test_locations,
        source_url: r.source_url,
        checked_at: r.checked_at,
        publish_flag: toBool(r.publish_flag),
        notes: r.notes,
      }))
      .filter((item) => item.publish_flag)
  }
)

export const getQualificationExamSchedulesBySlug = cache(
  async (slug: string): Promise<QualificationExamSchedule[]> => {
    const schedules = await getQualificationExamSchedules()

    return schedules
      .filter((schedule) => schedule.qualification_slug === slug)
      .sort((a, b) => {
        const aDate =
          a.exam_start_date || a.application_start_date || "9999-12-31"
        const bDate =
          b.exam_start_date || b.application_start_date || "9999-12-31"

        return aDate.localeCompare(bDate)
      })
  }
)