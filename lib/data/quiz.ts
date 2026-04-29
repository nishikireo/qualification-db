import { cache } from "react"
import type { QualificationQuizItem } from "@/types/qualification"
import { getSiteData } from "./siteData"
import { toBool, toNum } from "./utils"

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