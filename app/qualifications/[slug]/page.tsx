import Link from "next/link"
import { notFound } from "next/navigation"
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd"
import QualificationMetricsSection from "@/components/QualificationMetricsSection"
import BasicIndicatorsSection from "@/components/qualification-detail/BasicIndicatorsSection"
import DifficultyBenchmarkSection from "@/components/qualification-detail/DifficultyBenchmarkSection"
import FitSection from "@/components/qualification-detail/FitSection"
import QualificationExamInfoSection from "@/components/qualification-detail/QualificationExamInfoSection"
import {
  getDifficultyBenchmarkByDeviation,
  getQualificationBySlug,
  getQualificationComparisonsByQualificationSlug,
  getQualificationMetricsBySlug,
  getQualificationResourceLinksBySlug,
  getQualificationQuizItemsBySlug,
  getQualifications,
  getQualificationExamSchedulesBySlug,
} from "@/lib/data"
import { formatSalaryRange } from "@/lib/format"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://open-shikaku.jp"

type Props = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

type SearchParamsRecord = Record<string, string | string[] | undefined>



function splitLines(text: string | undefined) {
  if (!text) return []
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}


function getSearchParamValue(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

function getSameCategoryQualifications<T extends {
  slug: string
  category_primary: string
  career_value_score: number | null | undefined
}>(items: T[], current: T) {
  return items
    .filter(
      (item) =>
        item.slug !== current.slug &&
        item.category_primary === current.category_primary
    )
    .sort((a, b) => (b.career_value_score ?? 0) - (a.career_value_score ?? 0))
    .slice(0, 8)
}

function getOtherQualificationSlug(
  comparison: { left_slug: string; right_slug: string },
  currentSlug: string
) {
  return comparison.left_slug === currentSlug
    ? comparison.right_slug
    : comparison.left_slug
}

function createQuizAnswerHref(
  slug: string,
  params: SearchParamsRecord,
  answerKey: string,
  answerValue: string,
  quizIndex: number
) {
  const nextParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    const normalized = getSearchParamValue(value)
    if (normalized) nextParams.set(key, normalized)
  })

  nextParams.set(answerKey, answerValue)

  return `/qualifications/${slug}?${nextParams.toString()}#quiz-${quizIndex + 1}`
}

function getQuizChoiceEntries(quiz: {
  question_type: string
  choice_1?: string
  choice_2?: string
  choice_3?: string
  choice_4?: string
}) {
  if (quiz.question_type === "ox") {
    return [
      { value: "○", label: quiz.choice_1 ?? "○" },
      { value: "×", label: quiz.choice_2 ?? "×" },
    ]
  }

  return [
    { value: "1", label: quiz.choice_1 ?? "" },
    { value: "2", label: quiz.choice_2 ?? "" },
    { value: "3", label: quiz.choice_3 ?? "" },
    { value: "4", label: quiz.choice_4 ?? "" },
  ].filter((choice) => choice.label)
}

export async function generateStaticParams() {
  const qualifications = await getQualifications()
  return qualifications.map((q) => ({ slug: q.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const q = await getQualificationBySlug(slug)
  if (!q) return {}

  return {
    title: `${q.name_short}の難易度・偏差値・合格率・勉強時間 | オープン資格`,
    description: `${q.name_short}の難易度偏差値、合格率、勉強時間、受験料、平均年収、独学しやすさ、転職価値をデータで整理しています。`,
  }
}

export default async function QualificationPage({ params, searchParams }: Props) {
  const { slug } = await params
  const resolvedSearchParams = (await searchParams) ?? {}
  const q = await getQualificationBySlug(slug)
  if (!q) notFound()
  
  const [
    comparisons,
    metrics,
    resourceLinks,
    quizItems,
    allQualifications,
    benchmark,
    examSchedules,
  ] = await Promise.all([
    getQualificationComparisonsByQualificationSlug(slug),
    getQualificationMetricsBySlug(slug),
    getQualificationResourceLinksBySlug(slug),
    getQualificationQuizItemsBySlug(slug),
    getQualifications(),
    getDifficultyBenchmarkByDeviation(q.difficulty_deviation),
    getQualificationExamSchedulesBySlug(slug),
  ])

  const sameCategoryQualifications = getSameCategoryQualifications(
    allQualifications,
    q
  )

  return (
    <main className="bg-white">
      <BreadcrumbJsonLd
        items={[
          { name: "ホーム", item: siteUrl },
          { name: "資格一覧", item: `${siteUrl}/qualifications` },
          { name: q.name_short, item: `${siteUrl}/qualifications/${q.slug}` },
        ]}
      />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <nav className="mb-6 text-sm text-neutral-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-neutral-950">
                ホーム
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/qualifications" className="hover:text-neutral-950">
                資格一覧
              </Link>
            </li>
            <li>/</li>
            <li className="text-neutral-950">{q.name_short}</li>
          </ol>
        </nav>

        <header className="border-b border-neutral-200/70 pb-8">
          <div className="text-sm text-neutral-500">{q.category_primary}</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-950">
            {q.name_short}の難易度・偏差値・合格率・勉強時間まとめ
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600">
            {q.summary_short}
          </p>
        </header>

        <BasicIndicatorsSection qualification={q} benchmark={benchmark} />

        <DifficultyBenchmarkSection qualification={q} benchmark={benchmark} />

        <section className="border-t border-neutral-200/70 py-8">
          <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
            基本情報
          </h2>
          <div className="overflow-x-auto rounded-lg border border-neutral-200/70">
            <table className="w-full border-collapse text-sm">
              <tbody>
                <tr className="border-b border-neutral-200/70">
                  <th className="w-40 bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    資格名
                  </th>
                  <td className="px-4 py-3 text-neutral-900">{q.name_ja}</td>
                </tr>

                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    カテゴリ
                  </th>
                  <td className="px-4 py-3 text-neutral-900">{q.category_primary}</td>
                </tr>

                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    種別
                  </th>
                  <td className="px-4 py-3 text-neutral-900">{q.qualification_type}</td>
                </tr>

                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    主催
                  </th>
                  <td className="px-4 py-3 text-neutral-900">{q.issuing_body}</td>
                </tr>

                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    試験回数
                  </th>
                  <td className="px-4 py-3 text-neutral-900">{q.exam_frequency_text}</td>
                </tr>

                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    受験資格
                  </th>
                  <td className="px-4 py-3 text-neutral-900">{q.eligibility_text}</td>
                </tr>

                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    試験形式
                  </th>
                  <td className="px-4 py-3 text-neutral-900">{q.exam_format_text}</td>
                </tr>

                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    難易度偏差値
                  </th>
                  <td className="px-4 py-3 text-neutral-900">
                    {q.difficulty_deviation ?? "-"}
                  </td>
                </tr>

                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    難易度帯
                  </th>
                  <td className="px-4 py-3 text-neutral-900">
                    {benchmark?.band_label ?? "-"}
                  </td>
                </tr>

                <tr className="border-b border-neutral-200/70">
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    大学群の目安
                  </th>
                  <td className="px-4 py-3 text-neutral-900">
                    {benchmark?.university_group ?? "-"}
                    {benchmark?.university_examples
                      ? `（${benchmark.university_examples}）`
                      : ""}
                  </td>
                </tr>

                <tr>
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    平均年収
                  </th>
                  <td className="px-4 py-3 text-neutral-900">
                    {formatSalaryRange(q.average_salary_min, q.average_salary_max)}
                    {q.average_salary_note ? `（${q.average_salary_note}）` : ""}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <QualificationExamInfoSection
          qualification={q}
          schedules={examSchedules}
        />
        <QualificationMetricsSection metrics={metrics} />


        <FitSection qualification={q} />

        {quizItems.length > 0 && (
          <section className="border-t border-neutral-200/70 py-8">
            <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
              試験問題のサンプル
            </h2>
            <div className="space-y-4">
              {quizItems.map((quiz, index) => {
                const answerKey = `quiz_${index + 1}`
                const selectedAnswer = getSearchParamValue(resolvedSearchParams[answerKey])
                const isAnswered = Boolean(selectedAnswer)
                const isCorrect = selectedAnswer === quiz.answer_value
                const choices = getQuizChoiceEntries(quiz)

                return (
                  <div
                    id={`quiz-${index + 1}`}
                    key={`${quiz.qualification_slug}-${index}`}
                    className="rounded-lg border border-neutral-200/70 p-5"
                  >
                    <div className="text-[11px] text-neutral-500">問題 {index + 1}</div>
                    <p className="mt-2 text-sm font-medium leading-7 text-neutral-950">
                      {quiz.question_text}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {choices.map((choice) => {
                        const isSelected = selectedAnswer === choice.value
                        const href = createQuizAnswerHref(
                          q.slug,
                          resolvedSearchParams,
                          answerKey,
                          choice.value,
                          index
                        )

                        return (
                          <Link
                            key={choice.value}
                            href={href}
                            scroll={false}
                            className={`rounded-md border px-3 py-2 text-sm transition ${
                              isSelected
                                ? "border-neutral-950 bg-neutral-950 text-white"
                                : "border-neutral-200/70 text-neutral-700 hover:border-neutral-400 hover:text-neutral-950"
                            }`}
                          >
                            {choice.label}
                          </Link>
                        )
                      })}
                    </div>

                    {isAnswered && (
                      <div className="mt-5 border-t border-neutral-200/70 pt-4 text-sm">
                        <p className={isCorrect ? "text-green-700" : "text-red-700"}>
                          <span className="font-medium">判定:</span>{" "}
                          {isCorrect ? "正解" : "不正解"}
                        </p>
                        <p className="mt-2 text-neutral-900">
                          <span className="font-medium">正解:</span> {quiz.answer_value}
                        </p>
                        <p className="mt-2 leading-7 text-neutral-600">
                          <span className="font-medium text-neutral-900">解説:</span>{" "}
                          {quiz.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {resourceLinks.length > 0 && (
          <section className="border-t border-neutral-200/70 py-8">
            <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
              公式リンク・参考資料
            </h2>
            <div className="rounded-lg border border-neutral-200/70">
              <ul className="divide-y divide-neutral-200/70">
                {resourceLinks.map((link) => (
                  <li key={`${link.qualification_slug}-${link.link_title}`} className="px-4 py-4">
                    <a
                      href={link.link_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-neutral-700 underline hover:text-neutral-950"
                    >
                      {link.link_title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {comparisons.length > 0 && (
          <section className="border-t border-neutral-200/70 py-8">
            <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
              比較されやすい資格
            </h2>

            <div className="grid gap-3 md:grid-cols-2">
              {comparisons.map((comparison) => {
                const otherSlug = getOtherQualificationSlug(comparison, q.slug)

                const other = allQualifications.find((item) => item.slug === otherSlug)

                if (!other) return null

                return (
                  <Link
                    key={comparison.comparison_slug}
                    href={`/compare/${comparison.comparison_slug}`}
                    className="rounded-lg border border-neutral-200/70 p-4 text-sm text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-950"
                  >
                    <div className="font-medium text-neutral-950">
                      {q.name_short}と{other.name_short}を比較する
                    </div>

                    {comparison.relation_reason && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">
                        {comparison.relation_reason}
                      </p>
                    )}
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {sameCategoryQualifications.length > 0 && (
          <section className="border-t border-neutral-200/70 py-8">
            <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
              同じカテゴリーの資格
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {sameCategoryQualifications.map((item) => (
                <Link
                  key={item.slug}
                  href={`/qualifications/${item.slug}`}
                  className="rounded-lg border border-neutral-200/70 p-4 text-sm text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-950"
                >
                  <div className="text-[11px] text-neutral-500">{item.category_primary}</div>
                  <div className="mt-1 font-medium text-neutral-950">{item.name_short}</div>
                  {item.summary_short && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">
                      {item.summary_short}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="border-t border-neutral-200/70 py-8">
          <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
            出典
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-neutral-700">
            {q.source_pass_rate_url && (
              <li>
                <a
                  href={q.source_pass_rate_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-neutral-950"
                >
                  合格率の出典
                </a>
              </li>
            )}
            {q.source_fee_url && (
              <li>
                <a
                  href={q.source_fee_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-neutral-950"
                >
                  受験料の出典
                </a>
              </li>
            )}
            {q.source_eligibility_url && (
              <li>
                <a
                  href={q.source_eligibility_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-neutral-950"
                >
                  受験資格の出典
                </a>
              </li>
            )}
          </ul>
          <p className="mt-4 text-sm text-neutral-500">最終確認日: {q.last_verified_at}</p>
        </section>
      </div>
    </main>
  )
}