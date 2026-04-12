import type { Metadata } from "next"
import "./globals.css"
import StructuredData from "@/components/StructuredData"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"
const siteName = "資格DB"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | 資格をデータで比較する`,
    template: `%s | ${siteName}`,
  },
  description:
    "資格の難易度、合格率、勉強時間、受験料、独学しやすさ、転職価値をデータで比較する資格データベース。",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
  }

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
  }

  return (
    <html lang="ja">
      <body>
        <StructuredData data={organizationJsonLd} />
        <StructuredData data={websiteJsonLd} />
        {children}
      </body>
    </html>
  )
}