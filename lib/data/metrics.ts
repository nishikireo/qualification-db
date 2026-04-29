import { cache } from "react"
import type { QualificationMetric } from "@/types/qualification"
import { getSiteData } from "./siteData"
import { toBool, toNum } from "./utils"

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