import { MetadataRoute } from "next"
import {
  getQualificationComparisons,
  getQualifications,
  getStaticPages,
} from "@/lib/data"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://open-shikaku.jp"

  const [qualifications, comparisons, staticPages] = await Promise.all([
    getQualifications(),
    getQualificationComparisons(),
    getStaticPages(),
  ])

  const qualificationUrls: MetadataRoute.Sitemap = qualifications.map((q) => ({
    url: `${baseUrl}/qualifications/${q.slug}`,
    lastModified: q.last_verified_at ? new Date(q.last_verified_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  const compareUrls: MetadataRoute.Sitemap = comparisons.map((comparison) => ({
    url: `${baseUrl}/compare/${comparison.comparison_slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.75,
  }))

  const staticPageUrls: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
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
    {
      url: `${baseUrl}/qualifications`,
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