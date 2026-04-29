import { cache } from "react"
import type { DifficultyBenchmark } from "@/types/qualification"
import { getSiteData } from "./siteData"
import { toBool, toNum } from "./utils"

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