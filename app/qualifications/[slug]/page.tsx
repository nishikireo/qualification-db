import Link from "next/link"
import { notFound } from "next/navigation"
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd"
import QualificationMetricsSection from "@/components/QualificationMetricsSection"
import StructuredData from "@/components/StructuredData"
import DifficultyBenchmarkSection from "@/components/qualification-detail/DifficultyBenchmarkSection"
import FitSection from "@/components/qualification-detail/FitSection"
import QualificationExamInfoSection from "@/components/qualification-detail/QualificationExamInfoSection"
import QualificationHeroSection from "@/components/qualification-detail/QualificationHeroSection"
import StudyPlanSection from "@/components/qualification-detail/StudyPlanSection"
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
import { siteName, siteUrl } from "@/lib/site"

type Props = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

type SearchParamsRecord = Record<string, string | string[] | undefined>

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
    title: `${q.name_short}とは？難易度・合格率・勉強時間・試験日程`,
    description: `${q.name_short}の難易度、合格率、勉強時間、受験料、試験日程、受験資格、向いている人を公式情報と公開データをもとに整理しています。`,
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
  const nextSchedule = examSchedules[0]
  const pageUrl = `${siteUrl}/qualifications/${q.slug}`
  const qualificationJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: `${q.name_short}とは？難易度・合格率・勉強時間・試験日程`,
    description: q.summary_short,
    dateModified: q.last_verified_at || undefined,
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: siteUrl,
    },
    about: {
      "@type": "EducationalOccupationalCredential",
      name: q.name_ja,
      alternateName: q.name_short,
      credentialCategory: q.qualification_type,
      recognizedBy: q.issuing_body
        ? {
            "@type": "Organization",
            name: q.issuing_body,
          }
        : undefined,
      url: q.official_site_url || undefined,
      sameAs: [
        q.official_site_url,
        q.official_exam_guide_url,
        q.source_schedule_url,
      ].filter(Boolean),
    },
  }

  return (
    <main className="bg-white">
      <BreadcrumbJsonLd
        items={[
          { name: "ホーム", item: siteUrl },
          { name: "資格一覧", item: `${siteUrl}/qualifications` },
          { name: q.name_short, item: `${siteUrl}/qualifications/${q.slug}` },
        ]}
      />
      <StructuredData data={qualificationJsonLd} />

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

        <QualificationHeroSection
          qualification={q}
          benchmark={benchmark}
          nextSchedule={nextSchedule}
        />

        <FitSection qualification={q} />

        <DifficultyBenchmarkSection qualification={q} benchmark={benchmark} />

        <QualificationExamInfoSection
          qualification={q}
          schedules={examSchedules}
        />

        <StudyPlanSection qualification={q} />

        <QualificationMetricsSection metrics={metrics} />

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
            {q.source_schedule_url && (
              <li>
                <a
                  href={q.source_schedule_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-neutral-950"
                >
                  試験日程の出典
                </a>
              </li>
            )}
            {q.source_average_salary_url && (
              <li>
                <a
                  href={q.source_average_salary_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-neutral-950"
                >
                  年収情報の出典
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
