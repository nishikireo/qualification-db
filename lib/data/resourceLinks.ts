import { cache } from "react"
import type { QualificationResourceLink } from "@/types/qualification"
import { getSiteData } from "./siteData"
import { toBool, toNum } from "./utils"

export const getQualificationResourceLinks = cache(
  async (): Promise<QualificationResourceLink[]> => {
    const data = await getSiteData()

    return data.qualification_resource_links
      .map((r) => ({
        qualification_slug: r.qualification_slug,
        link_type: r.link_type,
        link_title: r.link_title,
        link_url: r.link_url,
        display_order: toNum(r.display_order),
        publish_flag: toBool(r.publish_flag),
        notes: r.notes,
      }))
      .filter((item) => item.publish_flag)
  }
)

export const getQualificationResourceLinksBySlug = cache(
  async (slug: string): Promise<QualificationResourceLink[]> => {
    const items = await getQualificationResourceLinks()

    return items
      .filter((item) => item.qualification_slug === slug)
      .sort((a, b) => (a.display_order ?? 9999) - (b.display_order ?? 9999))
  }
)