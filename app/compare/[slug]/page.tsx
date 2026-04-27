import Link from "next/link"
import { notFound } from "next/navigation"
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd"
import StructuredData from "@/components/StructuredData"
import {
  getDifficultyBenchmarkByDeviation,
  getQualificationComparisonBySlug,
  getQualificationComparisons,
  getQualifications,
} from "@/lib/data"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://open-shikaku.jp"

type Props = {
  params: Promise<{ slug: string }>
}

function salaryLabel(min: number | null | undefined, max: number | null | undefined) {
  if (min === null || min === undefined || max === null || max === undefined) return "-"
  return `${min}〜${max}万円`
}

function hoursLabel(min: number | null | undefined, max: number | null | undefined) {
  if (min === null || min === undefined || max === null || max === undefined) return "-"
  return `${min}〜${max}時間`
}

function percentLabel(value: number | null | undefined) {
  if (value === null || value === undefined) return "-"
  return `${value}%`
}

function scoreLabel(value: number | null | undefined) {
  if (value === null || value === undefined) return "-"
  return `${value}`
}

function getDifficultyGapLabel(left: number | null | undefined, right: number | null | undefined) {
  if (left === null || left === undefined || right === null || right === undefined) return "-"

  const gap = right - left
  if (gap === 0) return "同程度"
  if (gap > 0) return `${Math.abs(gap)}ポイント${right > left ? "右が高い" : ""}`
  return `${Math.abs(gap)}ポイント左が高い`
}

function recommendedOrderLabel(
  value: string,
  left: { slug: string; name_short: string },
  right: { slug: string; name_short: string }
) {
  if (!value) return "目的による"

  const normalized = value.toUpperCase()
  const leftKey = left.slug.replaceAll("-", "_").toUpperCase()
  const rightKey = right.slug.replaceAll("-", "_").toUpperCase()

  if (normalized === "DEPENDS") return "目的による"
  if (normalized === "EITHER") return "どちらからでも可"
  if (normalized.includes(leftKey)) return `${left.name_short}を先に取る`
  if (normalized.includes(rightKey)) return `${right.name_short}を先に取る`

  return "目的による"
}

function intentLabel(value: string) {
  const map: Record<string, string> = {
    difficulty_comparison: "難易度比較",
    conversion: "換算目安",
    learning_path: "学習ステップ",
    overlap: "範囲の重複",
    career_choice: "キャリア選択",
    same_series: "上位・下位比較",
    same_field: "同領域比較",
  }

  return map[value] ?? value
}

function titleByIntent(
  intent: string,
  leftName: string,
  rightName: string
) {
  if (intent === "conversion") {
    return `${leftName}は${rightName}に換算するとどれくらい？`
  }

  if (intent === "overlap") {
    return `${leftName}と${rightName}はどっちが難しい？範囲の重複も比較`
  }

  if (intent === "same_series") {
    return `${leftName}と${rightName}の難易度差・追加学習時間を比較`
  }

  if (intent === "learning_path") {
    return `${leftName}と${rightName}はどちらを先に取るべき？`
  }

  if (intent === "difficulty_comparison") {
    return `${leftName}と${rightName}はどっちが難しい？`
  }

  return `${leftName}と${rightName}はどっちを取るべき？`
}

export async function generateStaticParams() {
  const comparisons = await getQualificationComparisons()

  return comparisons.map((item) => ({
    slug: item.comparison_slug,
  }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const comparison = await getQualificationComparisonBySlug(slug)
  if (!comparison) return {}

  const qualifications = await getQualifications()
  const left = qualifications.find((q) => q.slug === comparison.left_slug)
  const right = qualifications.find((q) => q.slug === comparison.right_slug)

  if (!left || !right) return {}

  return {
    title: `${titleByIntent(
      comparison.search_intent_type,
      left.name_short,
      right.name_short
    )} | オープン資格`,
    description: `${left.name_short}と${right.name_short}を、難易度偏差値、勉強時間、知識範囲の重複、追加学習時間、どちらを先に取るべきかで比較します。`,
  }
}

export default async function ComparePage({ params }: Props) {
  const { slug } = await params

  const [comparison, qualifications] = await Promise.all([
    getQualificationComparisonBySlug(slug),
    getQualifications(),
  ])

  if (!comparison) notFound()

  const left = qualifications.find((q) => q.slug === comparison.left_slug)
  const right = qualifications.find((q) => q.slug === comparison.right_slug)

  if (!left || !right) notFound()

  const [leftBenchmark, rightBenchmark] = await Promise.all([
    getDifficultyBenchmarkByDeviation(left.difficulty_deviation),
    getDifficultyBenchmarkByDeviation(right.difficulty_deviation),
  ])

  const faqs = [
    {
      question: comparison.faq_1_question,
      answer: comparison.faq_1_answer,
    },
    {
      question: comparison.faq_2_question,
      answer: comparison.faq_2_answer,
    },
    {
      question: comparison.faq_3_question,
      answer: comparison.faq_3_answer,
    },
    {
      question: comparison.faq_4_question,
      answer: comparison.faq_4_answer,
    },
    {
      question: comparison.faq_5_question,
      answer: comparison.faq_5_answer,
    },
  ].filter((faq) => faq.question && faq.answer)

  const faqJsonLd =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null

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

      {faqJsonLd && <StructuredData data={faqJsonLd} />}

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
          <div className="text-sm text-neutral-500">
            {intentLabel(comparison.search_intent_type)}
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-950">
            {titleByIntent(comparison.search_intent_type, left.name_short, right.name_short)}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600">
            {left.name_short}と{right.name_short}を、難易度偏差値、勉強時間、
            知識範囲の重複、追加学習時間、どちらを先に取るべきかで比較します。
          </p>
        </header>

        <section className="py-8">
          <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
            結論
          </h2>
          <div className="rounded-lg border border-neutral-200/70 p-5">
            <p className="text-sm leading-8 text-neutral-700">
              {comparison.decision_summary}
            </p>
          </div>
        </section>

        <section className="border-t border-neutral-200/70 py-8">
          <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
            まず押さえるべき比較ポイント
          </h2>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-neutral-200/70 p-4">
              <div className="text-[11px] text-neutral-500">知識重複率</div>
              <div className="mt-1 text-xl font-semibold text-neutral-950">
                {percentLabel(comparison.knowledge_overlap_rate)}
              </div>
            </div>

            <div className="rounded-lg border border-neutral-200/70 p-4">
              <div className="text-[11px] text-neutral-500">
                {left.name_short} → {right.name_short}
              </div>
              <div className="mt-1 text-xl font-semibold text-neutral-950">
                {hoursLabel(
                  comparison.left_to_right_hours_min,
                  comparison.left_to_right_hours_max
                )}
              </div>
            </div>

            <div className="rounded-lg border border-neutral-200/70 p-4">
              <div className="text-[11px] text-neutral-500">
                {right.name_short} → {left.name_short}
              </div>
              <div className="mt-1 text-xl font-semibold text-neutral-950">
                {hoursLabel(
                  comparison.right_to_left_hours_min,
                  comparison.right_to_left_hours_max
                )}
              </div>
            </div>

            <div className="rounded-lg border border-neutral-200/70 p-4">
              <div className="text-[11px] text-neutral-500">おすすめ順</div>
              <div className="mt-1 text-sm font-semibold leading-6 text-neutral-950">
                {recommendedOrderLabel(comparison.recommended_order, left, right)}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200/70 py-8">
          <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
            難易度・勉強時間の比較
          </h2>

          <div className="overflow-x-auto rounded-lg border border-neutral-200/70">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-200/70 bg-neutral-50">
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">
                    項目
                  </th>
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
                    難易度偏差値
                  </th>
                  <td className="px-4 py-3 text-neutral-900">
                    {scoreLabel(left.difficulty_deviation)}
                  </td>
                  <td className="px-4 py-3 text-neutral-900">
                    {scoreLabel(right.difficulty_deviation)}
                  </td>
                </tr>

                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    難易度帯
                  </th>
                  <td className="px-4 py-3 text-neutral-900">
                    {leftBenchmark?.band_label ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-neutral-900">
                    {rightBenchmark?.band_label ?? "-"}
                  </td>
                </tr>

                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    大学群の目安
                  </th>
                  <td className="px-4 py-3 text-neutral-900">
                    {leftBenchmark?.university_group ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-neutral-900">
                    {rightBenchmark?.university_group ?? "-"}
                  </td>
                </tr>

                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    難易度差
                  </th>
                  <td className="px-4 py-3 text-neutral-900" colSpan={2}>
                    {getDifficultyGapLabel(
                      left.difficulty_deviation,
                      right.difficulty_deviation
                    )}
                  </td>
                </tr>

                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    通常の勉強時間
                  </th>
                  <td className="px-4 py-3 text-neutral-900">
                    {hoursLabel(left.study_hours_min, left.study_hours_max)}
                  </td>
                  <td className="px-4 py-3 text-neutral-900">
                    {hoursLabel(right.study_hours_min, right.study_hours_max)}
                  </td>
                </tr>

                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    合格率
                  </th>
                  <td className="px-4 py-3 text-neutral-900">
                    {percentLabel(left.pass_rate_latest)}
                  </td>
                  <td className="px-4 py-3 text-neutral-900">
                    {percentLabel(right.pass_rate_latest)}
                  </td>
                </tr>

                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    平均年収
                  </th>
                  <td className="px-4 py-3 text-neutral-900">
                    {salaryLabel(left.average_salary_min, left.average_salary_max)}
                  </td>
                  <td className="px-4 py-3 text-neutral-900">
                    {salaryLabel(right.average_salary_min, right.average_salary_max)}
                  </td>
                </tr>

                <tr>
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
              </tbody>
            </table>
          </div>

          {(leftBenchmark?.note || rightBenchmark?.note) && (
            <p className="mt-3 text-xs leading-6 text-neutral-500">
              {leftBenchmark?.note ?? rightBenchmark?.note}
            </p>
          )}
        </section>

        {comparison.conversion_summary && (
          <section className="border-t border-neutral-200/70 py-8">
            <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
              換算・置き換えの目安
            </h2>
            <div className="rounded-lg border border-neutral-200/70 p-5">
              <p className="text-sm leading-8 text-neutral-700">
                {comparison.conversion_summary}
              </p>
            </div>
          </section>
        )}

        <section className="border-t border-neutral-200/70 py-8">
          <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
            知識範囲はどれくらい被るか
          </h2>
          <div className="rounded-lg border border-neutral-200/70 p-5">
            <div className="text-[11px] text-neutral-500">知識重複率</div>
            <div className="mt-1 text-2xl font-semibold text-neutral-950">
              {percentLabel(comparison.knowledge_overlap_rate)}
            </div>
            <p className="mt-4 text-sm leading-8 text-neutral-700">
              {comparison.overlap_summary}
            </p>
          </div>
        </section>

        <section className="border-t border-neutral-200/70 py-8">
          <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
            すでに片方を持っている場合の追加学習時間
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-neutral-200/70 p-5">
              <h3 className="text-base font-semibold text-neutral-950">
                {left.name_short}取得者が{right.name_short}を目指す場合
              </h3>
              <div className="mt-3 text-2xl font-semibold text-neutral-950">
                {hoursLabel(
                  comparison.left_to_right_hours_min,
                  comparison.left_to_right_hours_max
                )}
              </div>
              <p className="mt-4 text-sm leading-8 text-neutral-700">
                {comparison.left_to_right_summary}
              </p>
            </div>

            <div className="rounded-lg border border-neutral-200/70 p-5">
              <h3 className="text-base font-semibold text-neutral-950">
                {right.name_short}取得者が{left.name_short}を目指す場合
              </h3>
              <div className="mt-3 text-2xl font-semibold text-neutral-950">
                {hoursLabel(
                  comparison.right_to_left_hours_min,
                  comparison.right_to_left_hours_max
                )}
              </div>
              <p className="mt-4 text-sm leading-8 text-neutral-700">
                {comparison.right_to_left_summary}
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200/70 py-8">
          <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
            どちらを先に取るべきか
          </h2>
          <div className="rounded-lg border border-neutral-200/70 p-5">
            <div className="text-[11px] text-neutral-500">おすすめ順</div>
            <div className="mt-1 text-base font-semibold text-neutral-950">
              {recommendedOrderLabel(comparison.recommended_order, left, right)}
            </div>
            <p className="mt-4 text-sm leading-8 text-neutral-700">
              {comparison.decision_summary}
            </p>
          </div>
        </section>

        {faqs.length > 0 && (
          <section className="border-t border-neutral-200/70 py-8">
            <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
              よくある質問
            </h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-lg border border-neutral-200/70 p-5"
                >
                  <h3 className="text-sm font-semibold text-neutral-950">
                    {faq.question}
                  </h3>
                  <p className="mt-3 text-sm leading-8 text-neutral-700">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {(comparison.evidence_note ||
          comparison.source_url_1 ||
          comparison.source_url_2 ||
          comparison.last_verified_at) && (
          <section className="border-t border-neutral-200/70 py-8">
            <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
              根拠・出典
            </h2>
            <div className="rounded-lg border border-neutral-200/70 p-5">
              {comparison.evidence_note && (
                <p className="text-sm leading-8 text-neutral-700">
                  {comparison.evidence_note}
                </p>
              )}

              {(comparison.source_url_1 || comparison.source_url_2) && (
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-700">
                  {comparison.source_url_1 && (
                    <li>
                      <a
                        href={comparison.source_url_1}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-neutral-950"
                      >
                        出典1
                      </a>
                    </li>
                  )}
                  {comparison.source_url_2 && (
                    <li>
                      <a
                        href={comparison.source_url_2}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-neutral-950"
                      >
                        出典2
                      </a>
                    </li>
                  )}
                </ul>
              )}

              {comparison.last_verified_at && (
                <p className="mt-4 text-xs text-neutral-500">
                  最終確認日: {comparison.last_verified_at}
                </p>
              )}
            </div>
          </section>
        )}

        <section className="border-t border-neutral-200/70 py-8">
          <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
            個別ページを見る
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Link
              href={`/qualifications/${left.slug}`}
              className="rounded-lg border border-neutral-200/70 p-4 text-sm text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-950"
            >
              <div className="text-[11px] text-neutral-500">個別ページへ</div>
              <div className="mt-1 font-medium text-neutral-950">
                {left.name_short}
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">
                {left.summary_short}
              </p>
            </Link>

            <Link
              href={`/qualifications/${right.slug}`}
              className="rounded-lg border border-neutral-200/70 p-4 text-sm text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-950"
            >
              <div className="text-[11px] text-neutral-500">個別ページへ</div>
              <div className="mt-1 font-medium text-neutral-950">
                {right.name_short}
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">
                {right.summary_short}
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}