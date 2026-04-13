import Link from "next/link"
import { notFound } from "next/navigation"
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd"
import { getQualifications, getRelations } from "@/lib/data"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://openshikaku.jp"

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
    title: `${left.name_short}と${right.name_short}の違いを比較 | オープン資格`,
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
    <main className="bg-white">
      <BreadcrumbJsonLd
        items={[
          { name: "ホーム", item: siteUrl },
          { name: "資格一覧", item: `${siteUrl}/lists/difficulty` },
          {
            name: `${left.name_short}と${right.name_short}の比較`,
            item: `${siteUrl}/compare/${slug}`,
          },
        ]}
      />

      <div className="mx-auto max-w-5xl px-6 py-10">
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

        <header className="border-b border-neutral-200/70 pb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-950">
            {left.name_short}と{right.name_short}の違いを比較
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600">
            {left.name_short}と{right.name_short}を、難易度、合格率、勉強時間、受験料、
            独学しやすさ、転職価値の観点で比較します。
          </p>
          {relation.relation_reason && (
            <p className="mt-3 text-sm text-neutral-500">
              比較の観点: {relation.relation_reason}
            </p>
          )}
        </header>

        <section className="border-t border-transparent py-8">
          <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
            比較表
          </h2>
          <div className="overflow-x-auto rounded-lg border border-neutral-200/70">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-200/70 bg-neutral-50">
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">項目</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">
                    {left.name_short}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">
                    {right.name_short}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    カテゴリ
                  </th>
                  <td className="px-4 py-3 text-neutral-900">{left.category_primary}</td>
                  <td className="px-4 py-3 text-neutral-900">{right.category_primary}</td>
                </tr>
                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    種別
                  </th>
                  <td className="px-4 py-3 text-neutral-900">{left.qualification_type}</td>
                  <td className="px-4 py-3 text-neutral-900">{right.qualification_type}</td>
                </tr>
                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    難易度
                  </th>
                  <td className="px-4 py-3 text-neutral-900">{left.difficulty_score ?? "-"} / 100</td>
                  <td className="px-4 py-3 text-neutral-900">{right.difficulty_score ?? "-"} / 100</td>
                </tr>
                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    合格率
                  </th>
                  <td className="px-4 py-3 text-neutral-900">{left.pass_rate_latest ?? "-"}%</td>
                  <td className="px-4 py-3 text-neutral-900">{right.pass_rate_latest ?? "-"}%</td>
                </tr>
                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    勉強時間
                  </th>
                  <td className="px-4 py-3 text-neutral-900">
                    {left.study_hours_min ?? "-"}〜{left.study_hours_max ?? "-"}時間
                  </td>
                  <td className="px-4 py-3 text-neutral-900">
                    {right.study_hours_min ?? "-"}〜{right.study_hours_max ?? "-"}時間
                  </td>
                </tr>
                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    受験料
                  </th>
                  <td className="px-4 py-3 text-neutral-900">
                    {left.exam_fee_tax_included?.toLocaleString() ?? "-"}円
                  </td>
                  <td className="px-4 py-3 text-neutral-900">
                    {right.exam_fee_tax_included?.toLocaleString() ?? "-"}円
                  </td>
                </tr>
                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    独学適性
                  </th>
                  <td className="px-4 py-3 text-neutral-900">{left.self_study_score ?? "-"} / 100</td>
                  <td className="px-4 py-3 text-neutral-900">{right.self_study_score ?? "-"} / 100</td>
                </tr>
                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    転職価値
                  </th>
                  <td className="px-4 py-3 text-neutral-900">{left.career_value_score ?? "-"} / 100</td>
                  <td className="px-4 py-3 text-neutral-900">{right.career_value_score ?? "-"} / 100</td>
                </tr>
                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    独占業務
                  </th>
                  <td className="px-4 py-3 text-neutral-900">{left.exclusive_work_flag ? "あり" : "なし"}</td>
                  <td className="px-4 py-3 text-neutral-900">{right.exclusive_work_flag ? "あり" : "なし"}</td>
                </tr>
                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    試験回数
                  </th>
                  <td className="px-4 py-3 text-neutral-900">{left.exam_frequency_text}</td>
                  <td className="px-4 py-3 text-neutral-900">{right.exam_frequency_text}</td>
                </tr>
                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    受験資格
                  </th>
                  <td className="px-4 py-3 text-neutral-900">{left.eligibility_text}</td>
                  <td className="px-4 py-3 text-neutral-900">{right.eligibility_text}</td>
                </tr>
                <tr>
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    試験形式
                  </th>
                  <td className="px-4 py-3 text-neutral-900">{left.exam_format_text}</td>
                  <td className="px-4 py-3 text-neutral-900">{right.exam_format_text}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="border-t border-neutral-200/70 py-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-neutral-200/70 p-5">
              <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
                {left.name_short}が向いている人
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-neutral-700">
                {splitLines(left.who_should_take).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-neutral-200/70 p-5">
              <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
                {right.name_short}が向いている人
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-neutral-700">
                {splitLines(right.who_should_take).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200/70 py-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-neutral-200/70 p-5">
              <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
                {left.name_short}の特徴
              </h2>
              <p className="mt-4 text-sm leading-8 text-neutral-700">{left.summary_short}</p>
            </div>

            <div className="rounded-lg border border-neutral-200/70 p-5">
              <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
                {right.name_short}の特徴
              </h2>
              <p className="mt-4 text-sm leading-8 text-neutral-700">{right.summary_short}</p>
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200/70 py-8">
          <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
            どちらを先に取るか
          </h2>
          <p className="text-sm leading-8 text-neutral-700">
            一般には、学習コスト、実務との結びつき、独学しやすさを見ながら選ぶのが基本です。
            難易度が低めで入りやすい資格から始める方法もあれば、
            独占業務や転職価値を優先して先に取得する考え方もあります。
          </p>
        </section>

        <section className="border-t border-neutral-200/70 py-8">
          <div className="grid gap-3 md:grid-cols-2">
            <Link
              href={`/qualifications/${left.slug}`}
              className="rounded-lg border border-neutral-200/70 p-4 text-sm text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-950"
            >
              <div className="text-[11px] text-neutral-500">個別ページへ</div>
              <div className="mt-1 font-medium text-neutral-950">{left.name_short}</div>
            </Link>

            <Link
              href={`/qualifications/${right.slug}`}
              className="rounded-lg border border-neutral-200/70 p-4 text-sm text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-950"
            >
              <div className="text-[11px] text-neutral-500">個別ページへ</div>
              <div className="mt-1 font-medium text-neutral-950">{right.name_short}</div>
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}