import type { Metadata } from "next"
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "資格DBにおける難易度スコア、独学適性スコア、コスパスコアなどの考え方と算出方針を説明します。",
}

export default function MethodologyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <BreadcrumbJsonLd
        items={[
          { name: "ホーム", item: siteUrl },
          { name: "Methodology", item: `${siteUrl}/methodology` },
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        ホーム / Methodology
      </nav>

      <h1 className="mb-6 text-3xl font-bold">Methodology</h1>

      <div className="space-y-6 leading-8 text-gray-800">
        <p>
          このページでは、資格DBで表示している各種スコアの考え方を説明します。
        </p>

        <h2 className="pt-4 text-2xl font-semibold">難易度スコア</h2>
        <p>
          難易度スコアは、主に合格率、勉強時間、試験形式、前提知識の必要性などをもとに相対的に評価しています。
        </p>
        <p>
          合格率が低い資格、必要学習時間が長い資格、実技や複雑な出題形式を含む資格ほど、
          難易度スコアは高くなります。
        </p>

        <h2 className="pt-4 text-2xl font-semibold">独学適性スコア</h2>
        <p>
          独学適性スコアは、市販教材や過去問の豊富さ、通学必須度、実技必須度、情報量の多さなどをもとに評価しています。
        </p>

        <h2 className="pt-4 text-2xl font-semibold">コスパスコア</h2>
        <p>
          コスパスコアは、受験料、学習時間、実務との結びつき、知名度、独占業務の有無などを総合的に見て評価しています。
        </p>

        <h2 className="pt-4 text-2xl font-semibold">注意点</h2>
        <p>
          これらのスコアは、資格そのものの優劣を断定するものではなく、比較のための補助指標です。
          個人のバックグラウンドや目的によって感じ方は変わります。
        </p>

        <h2 className="pt-4 text-2xl font-semibold">データの確認</h2>
        <p>
          合格率、受験料、受験資格などの主要情報は、原則として公式または準公式情報源を確認して掲載します。
        </p>
      </div>
    </main>
  )
}