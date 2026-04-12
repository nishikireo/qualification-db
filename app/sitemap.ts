import { MetadataRoute } from "next"
import { getQualifications } from "@/lib/data"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"
  const qualifications = await getQualifications()

  const qualificationUrls = qualifications.map((q) => ({
    url: `${baseUrl}/qualifications/${q.slug}`,
    lastModified: q.last_verified_at,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/lists/difficulty`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...qualificationUrls,
  ]
}