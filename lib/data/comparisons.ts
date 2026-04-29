import { cache } from "react"
import type { QualificationComparison } from "@/types/qualification"
import { getSiteData } from "./siteData"
import { toBool, toNum } from "./utils"

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

    return (
      comparisons.find((item) => item.comparison_slug === comparisonSlug) ??
      null
    )
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