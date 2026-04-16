import type { Metadata } from "next"
import "./globals.css"
import StructuredData from "@/components/StructuredData"
import { GoogleTagManager } from "@next/third-parties/google"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://open-shikaku.jp"
const siteName = "オープン資格"

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
      <body className="min-h-screen bg-white text-neutral-950">
        <GoogleTagManager gtmId="GTM-MXK3GNMK" />
        <StructuredData data={organizationJsonLd} />
        <StructuredData data={websiteJsonLd} />

        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  )
}