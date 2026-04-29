import { cache } from "react"
import type { Qualification } from "@/types/qualification"
import { getSiteData } from "./siteData"
import { toBool, toNum } from "./utils"

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