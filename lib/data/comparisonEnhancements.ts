import { cache } from "react"
import type {
  ComparisonLearningGap,
  ComparisonQuestionPair,
} from "@/types/qualification"
import { getSiteData } from "./siteData"
import { toBool, toNum } from "./utils"

function sortByDisplayOrder<T extends { display_order: number | null }>(
  a: T,
  b: T
) {
  return (a.display_order ?? 9999) - (b.display_order ?? 9999)
}

export const getComparisonLearningGaps = cache(
  async (): Promise<ComparisonLearningGap[]> => {
    const data = await getSiteData()

    return (data.comparison_learning_gaps ?? [])
      .map((r) => ({
        comparison_slug: r.comparison_slug,
        direction: r.direction,
        from_qualification_slug: r.from_qualification_slug,
        to_qualification_slug: r.to_qualification_slug,
        gap_label: r.gap_label,
        gap_category: r.gap_category,
        reuse_level: r.reuse_level,
        gap_level: r.gap_level,
        estimated_extra_hours_min: toNum(r.estimated_extra_hours_min),
        estimated_extra_hours_max: toNum(r.estimated_extra_hours_max),
        study_note: r.study_note,
        display_order: toNum(r.display_order),
        publish_flag: toBool(r.publish_flag),
      }))
      .filter((item) => item.publish_flag)
      .sort(sortByDisplayOrder)
  }
)

export const getComparisonLearningGapsBySlug = cache(
  async (comparisonSlug: string): Promise<ComparisonLearningGap[]> => {
    const items = await getComparisonLearningGaps()

    return items
      .filter((item) => item.comparison_slug === comparisonSlug)
      .sort(sortByDisplayOrder)
  }
)

export const getComparisonQuestionPairs = cache(
  async (): Promise<ComparisonQuestionPair[]> => {
    const data = await getSiteData()

    return (data.comparison_question_pairs ?? [])
      .map((r) => ({
        comparison_slug: r.comparison_slug,
        pair_id: r.pair_id,
        topic_label: r.topic_label,
        comparison_type: r.comparison_type,

        left_qualification_slug: r.left_qualification_slug,
        left_question_title: r.left_question_title,
        left_question_text: r.left_question_text,
        left_answer_summary: r.left_answer_summary,

        right_qualification_slug: r.right_qualification_slug,
        right_question_title: r.right_question_title,
        right_question_text: r.right_question_text,
        right_answer_summary: r.right_answer_summary,

        difference_summary: r.difference_summary,
        left_difficulty: r.left_difficulty,
        right_difficulty: r.right_difficulty,

        display_order: toNum(r.display_order),
        source_note: r.source_note,
        publish_flag: toBool(r.publish_flag),
      }))
      .filter((item) => item.publish_flag)
      .sort(sortByDisplayOrder)
  }
)

export const getComparisonQuestionPairsBySlug = cache(
  async (comparisonSlug: string): Promise<ComparisonQuestionPair[]> => {
    const items = await getComparisonQuestionPairs()

    return items
      .filter((item) => item.comparison_slug === comparisonSlug)
      .sort(sortByDisplayOrder)
  }
)