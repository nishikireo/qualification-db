import { cache } from "react"
import type { ListPage } from "@/types/qualification"
import { getSiteData } from "./siteData"
import { toBool } from "./utils"

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