import type { Metadata } from "next"
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"

export const metadata: Metadata = {
  title: "About",
  description:
    "資格DBについて。このサイトが何をするサイトか、どのような情報を提供するのかを説明します。",
}

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <BreadcrumbJsonLd
        items={[
          { name: "ホーム", item: siteUrl },
          { name: "About", item: `${siteUrl}/about` },
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        ホーム / About
      </nav>

      <h1 className="mb-6 text-3xl font-bold">About</h1>

      <div className="space-y-6 leading-8 text-gray-800">
        <p>
          資格DBは、資格を感覚ではなくデータで比較するためのサイトです。
        </p>

        <p>
          各資格について、難易度、合格率、勉強時間、受験料、独学しやすさ、転職価値などを整理し、
          比較しやすい形で公開します。
        </p>

        <p>
          目的は、資格に関する情報を長い説明文で読むのではなく、
          まず比較可能なデータとして把握できるようにすることです。
        </p>

        <h2 className="pt-4 text-2xl font-semibold">このサイトで分かること</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>資格ごとの基本情報</li>
          <li>難易度や勉強時間の目安</li>
          <li>受験料や受験資格</li>
          <li>独学しやすさや実務との関係</li>
          <li>他資格との比較</li>
        </ul>

        <h2 className="pt-4 text-2xl font-semibold">このサイトの考え方</h2>
        <p>
          資格の評価は人によって異なりますが、少なくとも比較の土台となる定量情報や条件は整理できます。
          資格DBでは、その土台をなるべく明確にすることを重視しています。
        </p>
      </div>
    </main>
  )
}