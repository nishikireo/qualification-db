import { cache } from "react"
import type { QualificationExamSchedule } from "@/types/qualification"
import { getSiteData } from "./siteData"
import { toBool, toNum } from "./utils"

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