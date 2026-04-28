export type Qualification = {
  slug: string
  name_ja: string
  name_short: string
  category_primary: string
  qualification_type: string
  issuing_body: string
  official_site_url: string
  official_exam_guide_url?: string
  status?: string

  exam_frequency_text: string
  exam_months_text?: string
  eligibility_text: string
  exam_format_text: string

  passing_criteria_text: string
  application_period_summary: string
  exam_schedule_summary: string
  test_location_summary: string
  source_schedule_url: string

  pass_rate_latest: number | null
  study_hours_min: number | null
  study_hours_max: number | null
  exam_fee_tax_included: number | null

  average_salary_min: number | null
  average_salary_max: number | null
  average_salary_note?: string
  source_average_salary_url?: string

  renewal_required?: boolean
  renewal_text?: string

  exclusive_work_flag: boolean
  exclusive_work_text?: string

  difficulty_deviation: number | null
  self_study_score: number | null
  cost_performance_score: number | null
  career_value_score: number | null
  job_relevance_score?: number | null
  salary_up_potential_score?: number | null
  brand_recognition_score?: number | null
  practicality_score?: number | null

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

export type QualificationPastLink = {
  qualification_slug: string
  link_type: string
  link_title: string
  link_url: string
  display_order: number | null
  publish_flag: boolean
  notes?: string
}

export type QualificationQuizItem = {
  qualification_slug: string
  question_type: string
  question_text: string
  choice_1?: string
  choice_2?: string
  choice_3?: string
  choice_4?: string
  answer_value: string
  explanation: string
  display_order: number | null
  publish_flag: boolean
}

export type DifficultyBenchmark = {
  min_deviation: number | null
  max_deviation: number | null
  band_label: string
  band_order: number | null
  university_group: string
  university_examples: string
  note: string
  publish_flag: boolean
}

export type QualificationComparison = {
  comparison_slug: string
  left_slug: string
  right_slug: string

  relation_type: string
  relation_weight: number | null
  relation_reason: string

  search_intent_type: string
  knowledge_overlap_rate: number | null

  left_to_right_hours_min: number | null
  left_to_right_hours_max: number | null
  right_to_left_hours_min: number | null
  right_to_left_hours_max: number | null

  recommended_order: string

  conversion_summary: string
  overlap_summary: string
  left_to_right_summary: string
  right_to_left_summary: string
  decision_summary: string

  faq_1_question: string
  faq_1_answer: string
  faq_2_question: string
  faq_2_answer: string
  faq_3_question: string
  faq_3_answer: string
  faq_4_question: string
  faq_4_answer: string
  faq_5_question: string
  faq_5_answer: string

  evidence_note: string
  source_url_1: string
  source_url_2: string
  last_verified_at: string

  publish_flag: boolean
}

export type ListPage = {
  slug: string
  title: string
  description: string
  primary_metric: string
  secondary_filter: string
  publish_recommendation: boolean
}

export type QualificationExamSchedule = {
  qualification_slug: string
  exam_year: number | null
  exam_period_label: string
  application_start_date: string
  application_end_date: string
  exam_start_date: string
  exam_end_date: string
  result_date: string
  test_locations: string
  source_url: string
  checked_at: string
  publish_flag: boolean
  notes: string
}