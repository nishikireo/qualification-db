export type Qualification = {
  slug: string
  name_ja: string
  name_short: string
  category_primary: string
  qualification_type: string
  issuing_body: string
  official_site_url: string
  exam_frequency_text: string
  eligibility_text: string
  exam_format_text: string
  pass_rate_latest: number | null
  study_hours_min: number | null
  study_hours_max: number | null
  exam_fee_tax_included: number | null
  exclusive_work_flag: boolean
  difficulty_score: number | null
  self_study_score: number | null
  cost_performance_score: number | null
  career_value_score: number | null
  summary_short: string
  difficulty_reason_text: string
  who_should_take: string
  who_should_not_take: string
  source_pass_rate_url?: string
  source_fee_url?: string
  source_eligibility_url?: string
  last_verified_at: string
  publish_flag: boolean
}

export type QualificationRelation = {
  qualification_slug: string
  related_slug: string
  relation_type: string
  relation_weight: number
  relation_reason?: string
  publish_flag: boolean
}

export type SitePage = {
  slug: string
  page_type: string
  title: string
  body_markdown: string
  publish_flag: boolean
}

export type QualificationMetric = {
  qualification_slug: string
  metric_year: number | null
  metric_period_label: string
  metric_exam_type: string
  metric_subject: string
  applicants_count: number | null
  examinees_count: number | null
  passers_count: number | null
  pass_rate: number | null
  exam_fee_tax_included: number | null
  source_result_url?: string
  source_fee_url?: string
  checked_at: string
  publish_flag: boolean
  notes?: string
}