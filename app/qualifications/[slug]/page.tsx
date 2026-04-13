import Link from "next/link"
import { notFound } from "next/navigation"
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd"
import {
  getComparedQualifications,
  getQualificationBySlug,
  getQualifications,
  getQualificationMetricsBySlug,
  getQualificationPastLinksBySlug,
  getQualificationQuizItemsBySlug,
} from "@/lib/data"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://openshikaku.jp"

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "-"
  return value.toLocaleString()
}

function splitLines(text: string | undefined) {
  if (!text) return []
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

function subjectLabel(subject: string) {
  const map: Record<string, string> = {
    overall: "総合",
    theory: "学科",
    practical: "実技",
  }

  return map[subject] ?? subject
}

function examTypeLabel(examType: string) {
  const map: Record<string, string> = {
    paper: "紙試験",
    cbt: "CBT",
    unified: "統一試験",
  }

  return map[examType] ?? examType
}

function getSearchParamValue(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
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
    title: `${q.name_short}の難易度・合格率・勉強時間・受験料 | オープン資格`,
    description: `${q.name_short}の難易度、合格率、勉強時間、受験料、独学しやすさ、転職価値をデータで整理しています。`,
  }
}

export default async function QualificationPage({ params, searchParams }: Props) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const q = await getQualificationBySlug(slug)
  if (!q) notFound()

  const [compared, metrics, pastLinks, quizItems, allQualifications] = await Promise.all([
    getComparedQualifications(slug),
    getQualificationMetricsBySlug(slug),
    getQualificationPastLinksBySlug(slug),
    getQualificationQuizItemsBySlug(slug),
    getQualifications(),
  ])

  const sameCategoryQualifications = allQualifications
    .filter(
      (item) =>
        item.slug !== q.slug &&
        item.category_primary === q.category_primary
    )
    .sort((a, b) => (b.career_value_score ?? 0) - (a.career_value_score ?? 0))
    .slice(0, 8)

  return (
    <main className="bg-white">
      <BreadcrumbJsonLd
        items={[
          { name: "ホーム", item: siteUrl },
          { name: "資格一覧", item: `${siteUrl}/lists/difficulty` },
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
              <Link href="/lists/difficulty" className="hover:text-neutral-950">
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
            {q.name_short}の難易度・合格率・勉強時間・受験料まとめ
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600">
            {q.summary_short}
          </p>
        </header>

        <section className="grid grid-cols-2 gap-3 py-8 md:grid-cols-4">
          <div className="rounded-lg border border-neutral-200/70 p-4">
            <div className="text-[11px] text-neutral-500">難易度</div>
            <div className="mt-1 text-lg font-medium text-neutral-950">
              {q.difficulty_score ?? "-"} / 100
            </div>
          </div>
          <div className="rounded-lg border border-neutral-200/70 p-4">
            <div className="text-[11px] text-neutral-500">合格率</div>
            <div className="mt-1 text-lg font-medium text-neutral-950">
              {q.pass_rate_latest ?? "-"}%
            </div>
          </div>
          <div className="rounded-lg border border-neutral-200/70 p-4">
            <div className="text-[11px] text-neutral-500">勉強時間</div>
            <div className="mt-1 text-lg font-medium text-neutral-950">
              {q.study_hours_min ?? "-"}〜{q.study_hours_max ?? "-"}
            </div>
          </div>
          <div className="rounded-lg border border-neutral-200/70 p-4">
            <div className="text-[11px] text-neutral-500">受験料</div>
            <div className="mt-1 text-lg font-medium text-neutral-950">
              {q.exam_fee_tax_included?.toLocaleString() ?? "-"}円
            </div>
          </div>
        </section>

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
                <tr>
                  <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                    試験形式
                  </th>
                  <td className="px-4 py-3 text-neutral-900">{q.exam_format_text}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {metrics.length > 0 && (
          <section className="border-t border-neutral-200/70 py-8">
            <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
              年度別データ
            </h2>
            <div className="overflow-x-auto rounded-lg border border-neutral-200/70">
              <table className="w-full min-w-[920px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-200/70 bg-neutral-50">
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">年度</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">期間</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">試験種別</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">科目</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">申込者数</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">受験者数</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">合格者数</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">合格率</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">受験料</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">出典</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m, index) => (
                    <tr
                      key={`${m.qualification_slug}-${m.metric_year}-${m.metric_period_label}-${m.metric_subject}-${index}`}
                      className="border-b border-neutral-200/70 last:border-b-0"
                    >
                      <td className="px-4 py-3 text-neutral-900">{m.metric_year ?? "-"}</td>
                      <td className="px-4 py-3 text-neutral-900">{m.metric_period_label || "-"}</td>
                      <td className="px-4 py-3 text-neutral-900">{examTypeLabel(m.metric_exam_type)}</td>
                      <td className="px-4 py-3 text-neutral-900">{subjectLabel(m.metric_subject)}</td>
                      <td className="px-4 py-3 text-neutral-900">{formatNumber(m.applicants_count)}</td>
                      <td className="px-4 py-3 text-neutral-900">{formatNumber(m.examinees_count)}</td>
                      <td className="px-4 py-3 text-neutral-900">{formatNumber(m.passers_count)}</td>
                      <td className="px-4 py-3 text-neutral-900">
                        {m.pass_rate !== null && m.pass_rate !== undefined ? `${m.pass_rate}%` : "-"}
                      </td>
                      <td className="px-4 py-3 text-neutral-900">
                        {m.exam_fee_tax_included !== null && m.exam_fee_tax_included !== undefined
                          ? `${m.exam_fee_tax_included.toLocaleString()}円`
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {m.source_result_url ? (
                          <a
                            href={m.source_result_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-neutral-700 underline hover:text-neutral-950"
                          >
                            結果
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="border-t border-neutral-200/70 py-8">
          <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
            {q.name_short}の難易度
          </h2>
          <p className="text-sm leading-8 text-neutral-700">{q.difficulty_reason_text}</p>
        </section>

        <section className="border-t border-neutral-200/70 py-8">
          <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
            向いている人
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-neutral-700">
            {splitLines(q.who_should_take).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <section className="border-t border-neutral-200/70 py-8">
          <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
            向いていない人
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-neutral-700">
            {splitLines(q.who_should_not_take).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        {quizItems.length > 0 && (
          <section className="border-t border-neutral-200/70 py-8">
            <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
              例題
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
                    key={`${quiz.qualification_slug}-${index}`}
                    className="rounded-lg border border-neutral-200/70 p-5"
                  >
                    <div className="text-[11px] text-neutral-500">問題 {index + 1}</div>
                    <p className="mt-2 text-sm font-medium leading-7 text-neutral-950">
                      {quiz.question_text}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {choices.map((choice) => {
                        const nextParams = new URLSearchParams()
                        Object.entries(resolvedSearchParams).forEach(([key, value]) => {
                          const normalized = getSearchParamValue(value)
                          if (normalized) nextParams.set(key, normalized)
                        })
                        nextParams.set(answerKey, choice.value)

                        const isSelected = selectedAnswer === choice.value

                        return (
                          <Link
                            key={choice.value}
                            href={`/qualifications/${q.slug}?${nextParams.toString()}`}
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
                          <span className="font-medium">判定:</span> {isCorrect ? "正解" : "不正解"}
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

        {pastLinks.length > 0 && (
          <section className="border-t border-neutral-200/70 py-8">
            <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
              公式過去問リンク
            </h2>
            <div className="rounded-lg border border-neutral-200/70">
              <ul className="divide-y divide-neutral-200/70">
                {pastLinks.map((link) => (
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

        <section className="border-t border-neutral-200/70 py-8">
          <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
            比較されやすい資格
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {compared.map((item) => (
              <Link
                key={item.slug}
                href={`/compare/${q.slug}-vs-${item.slug}`}
                className="rounded-lg border border-neutral-200/70 p-4 text-sm text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-950"
              >
                {q.name_short}と{item.name_short}を比較する
              </Link>
            ))}
          </div>
        </section>

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