import { cache } from "react"
import type { SitePage } from "@/types/qualification"
import { getSiteData } from "./siteData"
import { toBool } from "./utils"

export const getStaticPages = cache(async (): Promise<SitePage[]> => {
  const data = await getSiteData()

  return data.site_pages
    .map((r) => ({
      slug: r.slug,
      page_type: r.page_type,
      title: r.title,
      body_markdown: r.body_markdown,
      publish_flag: toBool(r.publish_flag),
    }))
    .filter((p) => p.publish_flag)
})