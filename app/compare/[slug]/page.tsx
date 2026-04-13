import Link from "next/link"
import { notFound } from "next/navigation"
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd"
import { getQualifications, getRelations } from "@/lib/data"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"

type Props = {
  params: Promise<{ slug: string }>
}

function parseCompareSlug(slug: string) {
  const parts = slug.split("-vs-")
  if (parts.length !== 2) return null

  return {
    leftSlug: parts[0],
    rightSlug: parts[1],
  }
}

function splitLines(text: string | undefined) {
  if (!text) return []
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

export async function generateStaticParams() {
  const relations = await getRelations()

  return relations
    .filter((r) => r.publish_flag && r.relation_type === "compared_with")
    .map((r) => ({
      slug: `${r.qualification_slug}-vs-${r.related_slug}`,
    }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const parsed = parseCompareSlug(slug)
  if (!parsed) return {}

  const qualifications = await getQualifications()
  const left = qualifications.find((q) => q.slug === parsed.leftSlug)
  const right = qualifications.find((q) => q.slug === parsed.rightSlug)

  if (!left || !right) return {}

  return {
    title: `${left.name_short}と${right.name_short}の違いを比較 | 資格DB`,
    description: `${left.name_short}と${right.name_short}を、難易度、合格率、勉強時間、受験料、独学しやすさ、転職価値で比較します。`,
  }
}

export default async function ComparePage({ params }: Props) {
  const { slug } = await params
  const parsed = parseCompareSlug(slug)

  if (!parsed) notFound()

  const [qualifications, relations] = await Promise.all([
    getQualifications(),
    getRelations(),
  ])

  const relation = relations.find(
    (r) =>
      r.publish_flag &&
      r.relation_type === "compared_with" &&
      r.qualification_slug === parsed.leftSlug &&
      r.related_slug === parsed.rightSlug
  )

  if (!relation) notFound()

  const left = qualifications.find((q) => q.slug === parsed.leftSlug)
  const right = qualifications.find((q) => q.slug === parsed.rightSlug)

  if (!left || !right) notFound()

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <BreadcrumbJsonLd
        items={[
          { name: "ホーム", item: siteUrl },
          { name: "比較ページ", item: `${siteUrl}/compare/${slug}` },
          {
            name: `${left.name_short}と${right.name_short}の比較`,
            item: `${siteUrl}/compare/${slug}`,
          },
        ]}
      />

      <nav className="mb-6 text-sm text-neutral-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-neutral-950">
              ホーム
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/lists/difficulty" className="hover:text-neutral-950">
              資格一覧
            </Link>
          </li>
          <li>/</li>
          <li className="text-neutral-950">
            {left.name_short}と{right.name_short}の比較
          </li>
        </ol>
      </nav>

      <h1 className="mb-4 text-3xl font-bold">
        {left.name_short}と{right.name_short}の違いを比較
      </h1>

      <p className="mb-3 text-lg text-gray-700">
        {left.name_short}と{right.name_short}を、難易度、合格率、勉強時間、受験料、
        独学しやすさ、転職価値の観点で比較します。
      </p>

      {relation.relation_reason && (
        <p className="mb-8 text-sm text-gray-500">
          この比較ページの補足: {relation.relation_reason}
        </p>
      )}

      <section className="mb-10 overflow-x-auto">
        <h2 className="mb-4 text-2xl font-semibold">比較表</h2>

        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-3 pr-4 text-left">項目</th>
              <th className="py-3 pr-4 text-left">{left.name_short}</th>
              <th className="py-3 text-left">{right.name_short}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <th className="py-3 pr-4 text-left font-medium">カテゴリ</th>
              <td className="py-3 pr-4">{left.category_primary}</td>
              <td className="py-3">{right.category_primary}</td>
            </tr>

            <tr className="border-b">
              <th className="py-3 pr-4 text-left font-medium">種別</th>
              <td className="py-3 pr-4">{left.qualification_type}</td>
              <td className="py-3">{right.qualification_type}</td>
            </tr>

            <tr className="border-b">
              <th className="py-3 pr-4 text-left font-medium">難易度</th>
              <td className="py-3 pr-4">{left.difficulty_score ?? "-"} / 100</td>
              <td className="py-3">{right.difficulty_score ?? "-"} / 100</td>
            </tr>

            <tr className="border-b">
              <th className="py-3 pr-4 text-left font-medium">合格率</th>
              <td className="py-3 pr-4">{left.pass_rate_latest ?? "-"}%</td>
              <td className="py-3">{right.pass_rate_latest ?? "-"}%</td>
            </tr>

            <tr className="border-b">
              <th className="py-3 pr-4 text-left font-medium">勉強時間</th>
              <td className="py-3 pr-4">
                {left.study_hours_min ?? "-"}〜{left.study_hours_max ?? "-"}時間
              </td>
              <td className="py-3">
                {right.study_hours_min ?? "-"}〜{right.study_hours_max ?? "-"}時間
              </td>
            </tr>

            <tr className="border-b">
              <th className="py-3 pr-4 text-left font-medium">受験料</th>
              <td className="py-3 pr-4">
                {left.exam_fee_tax_included?.toLocaleString() ?? "-"}円
              </td>
              <td className="py-3">
                {right.exam_fee_tax_included?.toLocaleString() ?? "-"}円
              </td>
            </tr>

            <tr className="border-b">
              <th className="py-3 pr-4 text-left font-medium">独学適性</th>
              <td className="py-3 pr-4">{left.self_study_score ?? "-"} / 100</td>
              <td className="py-3">{right.self_study_score ?? "-"} / 100</td>
            </tr>

            <tr className="border-b">
              <th className="py-3 pr-4 text-left font-medium">転職価値</th>
              <td className="py-3 pr-4">{left.career_value_score ?? "-"} / 100</td>
              <td className="py-3">{right.career_value_score ?? "-"} / 100</td>
            </tr>

            <tr className="border-b">
              <th className="py-3 pr-4 text-left font-medium">独占業務</th>
              <td className="py-3 pr-4">{left.exclusive_work_flag ? "あり" : "なし"}</td>
              <td className="py-3">{right.exclusive_work_flag ? "あり" : "なし"}</td>
            </tr>

            <tr className="border-b">
              <th className="py-3 pr-4 text-left font-medium">試験回数</th>
              <td className="py-3 pr-4">{left.exam_frequency_text}</td>
              <td className="py-3">{right.exam_frequency_text}</td>
            </tr>

            <tr className="border-b">
              <th className="py-3 pr-4 text-left font-medium">受験資格</th>
              <td className="py-3 pr-4">{left.eligibility_text}</td>
              <td className="py-3">{right.eligibility_text}</td>
            </tr>

            <tr className="border-b">
              <th className="py-3 pr-4 text-left font-medium">試験形式</th>
              <td className="py-3 pr-4">{left.exam_format_text}</td>
              <td className="py-3">{right.exam_format_text}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mb-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl font-semibold">{left.name_short}が向いている人</h2>
          <ul className="list-disc space-y-2 pl-6">
            {splitLines(left.who_should_take).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-semibold">{right.name_short}が向いている人</h2>
          <ul className="list-disc space-y-2 pl-6">
            {splitLines(right.who_should_take).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl font-semibold">{left.name_short}の特徴</h2>
          <p className="leading-8 text-gray-800">{left.summary_short}</p>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-semibold">{right.name_short}の特徴</h2>
          <p className="leading-8 text-gray-800">{right.summary_short}</p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">どちらを先に取るか</h2>
        <p className="leading-8 text-gray-800">
          一般には、学習コスト、実務との結びつき、独学しやすさを見ながら選ぶのが基本です。
          難易度が低めで入りやすい資格から始める方法もあれば、
          独占業務や転職価値を優先して先に取得する考え方もあります。
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <a
          href={`/qualifications/${left.slug}`}
          className="rounded-2xl border p-5 hover:border-black"
        >
          <div className="text-sm text-gray-500">個別ページへ</div>
          <div className="mt-1 text-xl font-semibold">{left.name_short}</div>
        </a>

        <a
          href={`/qualifications/${right.slug}`}
          className="rounded-2xl border p-5 hover:border-black"
        >
          <div className="text-sm text-gray-500">個別ページへ</div>
          <div className="mt-1 text-xl font-semibold">{right.name_short}</div>
        </a>
      </section>
    </main>
  )
}