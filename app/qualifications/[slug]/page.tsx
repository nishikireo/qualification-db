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

export default async function QualificationPage({ params }: Props) {
  const { slug } = await params
  const q = await getQualificationBySlug(slug)
  if (!q) notFound()

  const [compared, metrics, pastLinks, quizItems] = await Promise.all([
    getComparedQualifications(slug),
    getQualificationMetricsBySlug(slug),
    getQualificationPastLinksBySlug(slug),
    getQualificationQuizItemsBySlug(slug),
  ])

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <BreadcrumbJsonLd
        items={[
          { name: "ホーム", item: siteUrl },
          { name: "資格一覧", item: `${siteUrl}/lists/difficulty` },
          { name: q.name_short, item: `${siteUrl}/qualifications/${q.slug}` },
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
          <li className="text-neutral-950">{q.name_short}</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-bold mb-4">
        {q.name_short}の難易度・合格率・勉強時間・受験料まとめ
      </h1>

      <p className="mb-8 text-lg">{q.summary_short}</p>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="rounded-2xl border p-4">
          <div className="text-sm">難易度</div>
          <div className="text-2xl font-bold">{q.difficulty_score ?? "-"} / 100</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm">合格率</div>
          <div className="text-2xl font-bold">{q.pass_rate_latest ?? "-"}%</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm">勉強時間</div>
          <div className="text-2xl font-bold">
            {q.study_hours_min ?? "-"}〜{q.study_hours_max ?? "-"}
          </div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm">受験料</div>
          <div className="text-2xl font-bold">
            {q.exam_fee_tax_included?.toLocaleString() ?? "-"}円
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">基本情報</h2>
        <table className="w-full border-collapse">
          <tbody>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">資格名</th>
              <td>{q.name_ja}</td>
            </tr>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">カテゴリ</th>
              <td>{q.category_primary}</td>
            </tr>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">種別</th>
              <td>{q.qualification_type}</td>
            </tr>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">主催</th>
              <td>{q.issuing_body}</td>
            </tr>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">試験回数</th>
              <td>{q.exam_frequency_text}</td>
            </tr>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">受験資格</th>
              <td>{q.eligibility_text}</td>
            </tr>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">試験形式</th>
              <td>{q.exam_format_text}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {metrics.length > 0 && (
        <section className="mb-10 overflow-x-auto">
          <h2 className="text-2xl font-semibold mb-4">年度別データ</h2>
          <table className="w-full min-w-[920px] border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4">年度</th>
                <th className="text-left py-2 pr-4">期間</th>
                <th className="text-left py-2 pr-4">試験種別</th>
                <th className="text-left py-2 pr-4">科目</th>
                <th className="text-left py-2 pr-4">申込者数</th>
                <th className="text-left py-2 pr-4">受験者数</th>
                <th className="text-left py-2 pr-4">合格者数</th>
                <th className="text-left py-2 pr-4">合格率</th>
                <th className="text-left py-2 pr-4">受験料</th>
                <th className="text-left py-2">出典</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, index) => (
                <tr key={`${m.qualification_slug}-${m.metric_year}-${m.metric_period_label}-${m.metric_subject}-${index}`} className="border-b">
                  <td className="py-2 pr-4">{m.metric_year ?? "-"}</td>
                  <td className="py-2 pr-4">{m.metric_period_label || "-"}</td>
                  <td className="py-2 pr-4">{examTypeLabel(m.metric_exam_type)}</td>
                  <td className="py-2 pr-4">{subjectLabel(m.metric_subject)}</td>
                  <td className="py-2 pr-4">{formatNumber(m.applicants_count)}</td>
                  <td className="py-2 pr-4">{formatNumber(m.examinees_count)}</td>
                  <td className="py-2 pr-4">{formatNumber(m.passers_count)}</td>
                  <td className="py-2 pr-4">
                    {m.pass_rate !== null && m.pass_rate !== undefined ? `${m.pass_rate}%` : "-"}
                  </td>
                  <td className="py-2 pr-4">
                    {m.exam_fee_tax_included !== null && m.exam_fee_tax_included !== undefined
                      ? `${m.exam_fee_tax_included.toLocaleString()}円`
                      : "-"}
                  </td>
                  <td className="py-2">
                    {m.source_result_url ? (
                      <a
                        href={m.source_result_url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
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
        </section>
      )}

      {pastLinks.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">公式過去問リンク</h2>
          <ul className="list-disc pl-6 space-y-2">
            {pastLinks.map((link) => (
              <li key={`${link.qualification_slug}-${link.link_title}`}>
                <a
                  href={link.link_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {link.link_title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {quizItems.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">例題</h2>
          <div className="space-y-8">
            {quizItems.map((quiz, index) => (
              <div key={`${quiz.qualification_slug}-${index}`} className="rounded-2xl border p-5">
                <div className="text-sm text-gray-500 mb-2">問題 {index + 1}</div>
                <p className="mb-4 font-medium">{quiz.question_text}</p>

                <ul className="space-y-2 mb-4">
                  {quiz.choice_1 && <li>1. {quiz.choice_1}</li>}
                  {quiz.choice_2 && <li>2. {quiz.choice_2}</li>}
                  {quiz.choice_3 && <li>3. {quiz.choice_3}</li>}
                  {quiz.choice_4 && <li>4. {quiz.choice_4}</li>}
                </ul>

                <div className="text-sm">
                  <p>
                    <span className="font-semibold">正解:</span> {quiz.answer_value}
                  </p>
                  <p className="mt-2 text-gray-700">
                    <span className="font-semibold">解説:</span> {quiz.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">{q.name_short}の難易度</h2>
        <p>{q.difficulty_reason_text}</p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">向いている人</h2>
        <ul className="list-disc pl-6 space-y-2">
          {splitLines(q.who_should_take).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">向いていない人</h2>
        <ul className="list-disc pl-6 space-y-2">
          {splitLines(q.who_should_not_take).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">比較されやすい資格</h2>
        <ul className="list-disc pl-6 space-y-2">
          {compared.map((item) => (
            <li key={item.slug}>{item.name_short}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">出典</h2>
        <ul className="list-disc pl-6 space-y-2">
          {q.source_pass_rate_url && (
            <li>
              <a href={q.source_pass_rate_url} target="_blank" rel="noreferrer" className="underline">
                合格率の出典
              </a>
            </li>
          )}
          {q.source_fee_url && (
            <li>
              <a href={q.source_fee_url} target="_blank" rel="noreferrer" className="underline">
                受験料の出典
              </a>
            </li>
          )}
          {q.source_eligibility_url && (
            <li>
              <a href={q.source_eligibility_url} target="_blank" rel="noreferrer" className="underline">
                受験資格の出典
              </a>
            </li>
          )}
        </ul>
        <p className="mt-4 text-sm text-gray-500">最終確認日: {q.last_verified_at}</p>
      </section>
    </main>
  )
}