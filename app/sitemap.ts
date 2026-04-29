import { MetadataRoute } from "next"
import {
  getListPages,
  getQualificationComparisons,
  getQualifications,
  getStaticPages,
} from "@/lib/data"
import { siteUrl } from "@/lib/site"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [qualifications, comparisons, listPages, staticPages] = await Promise.all([
    getQualifications(),
    getQualificationComparisons(),
    getListPages(),
    getStaticPages(),
  ])

  const qualificationUrls: MetadataRoute.Sitemap = qualifications.map((q) => ({
    url: `${siteUrl}/qualifications/${q.slug}`,
    lastModified: q.last_verified_at ? new Date(q.last_verified_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  const compareUrls: MetadataRoute.Sitemap = comparisons.map((comparison) => ({
    url: `${siteUrl}/compare/${comparison.comparison_slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.75,
  }))

  const staticPageUrls: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${siteUrl}/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: page.slug === "about" ? 0.6 : 0.5,
  }))

  const listUrls: MetadataRoute.Sitemap = listPages.map((page) => ({
    url: `${siteUrl}/lists/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/qualifications`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...listUrls,
    ...qualificationUrls,
    ...compareUrls,
    ...staticPageUrls,
  ]
}
