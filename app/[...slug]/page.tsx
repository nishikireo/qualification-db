import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import ReactMarkdown from "react-markdown"
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd"
import { getStaticPages } from "@/lib/data"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://open-shikaku.jp"

type Props = {
  params: Promise<{ slug?: string[] }>
}

function normalizeSlug(slugParts?: string[]) {
  if (!slugParts || slugParts.length === 0) return ""
  return slugParts.join("/")
}

function prettifySegment(segment: string) {
  const labelMap: Record<string, string> = {
    methodology: "Methodology",
    about: "About",
    sources: "Sources",
    privacy: "Privacy",
    terms: "Terms",
    "ai-policy": "AI Policy",
    "editorial-policy": "Editorial Policy",
  }

  return labelMap[segment] ?? segment
}

export async function generateStaticParams() {
  const pages = await getStaticPages()

  return pages.map((page) => ({
    slug: page.slug.split("/"),
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const currentSlug = normalizeSlug(slug)
  const pages = await getStaticPages()
  const page = pages.find((p) => p.slug === currentSlug)

  if (!page) return {}

  return {
    title: page.title,
    description: `${page.title} | オープン資格`,
  }
}

export default async function StaticPage({ params }: Props) {
  const { slug } = await params
  const currentSlug = normalizeSlug(slug)
  const pages = await getStaticPages()
  const page = pages.find((p) => p.slug === currentSlug)

  if (!page) notFound()

  const slugParts = currentSlug.split("/")

  const breadcrumbItems = [
    { name: "ホーム", item: siteUrl },
    ...slugParts.map((segment, index) => {
      const partialSlug = slugParts.slice(0, index + 1).join("/")
      const matchedPage = pages.find((p) => p.slug === partialSlug)

      return {
        name: matchedPage?.title ?? prettifySegment(segment),
        item: `${siteUrl}/${partialSlug}`,
      }
    }),
  ]

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <nav className="mb-6 text-sm text-neutral-500">
        <ol className="flex flex-wrap items-center gap-2">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1

            return (
              <li key={item.item} className="flex items-center gap-2">
                {index > 0 && <span>/</span>}
                {isLast ? (
                  <span className="text-neutral-950">{item.name}</span>
                ) : (
                  <Link href={item.item.replace(siteUrl, "") || "/"} className="hover:text-neutral-950">
                    {item.name}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      <h1 className="mb-6 text-3xl font-bold">{page.title}</h1>

      <article className="prose prose-neutral max-w-none">
        <ReactMarkdown>{page.body_markdown}</ReactMarkdown>
      </article>
    </main>
  )
}