import { MetadataRoute } from "next"
import { getQualifications, getRelations, getStaticPages } from "@/lib/data"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://open-shikaku.jp"

  const [qualifications, relations, staticPages] = await Promise.all([
    getQualifications(),
    getRelations(),
    getStaticPages(),
  ])

  const qualificationUrls: MetadataRoute.Sitemap = qualifications.map((q) => ({
    url: `${baseUrl}/qualifications/${q.slug}`,
    lastModified: q.last_verified_at ? new Date(q.last_verified_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  const compareUrls: MetadataRoute.Sitemap = relations
    .filter((r) => r.publish_flag && r.relation_type === "compared_with")
    .map((r) => ({
      url: `${baseUrl}/compare/${r.qualification_slug}-vs-${r.related_slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))

  const staticPageUrls: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: page.slug === "about" ? 0.6 : 0.5,
  }))

  const listUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/lists/difficulty`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/lists/self-study`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/lists/cost-performance`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/lists/no-eligibility`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/lists/exclusive-work`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/lists/real-estate`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ]

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...listUrls,
    ...qualificationUrls,
    ...compareUrls,
    ...staticPageUrls,
  ]
}