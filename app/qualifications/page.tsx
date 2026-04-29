import Link from "next/link"
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd"
import QualificationsSearchClient from "@/components/QualificationsSearchClient"
import { getQualifications } from "@/lib/data"
import { siteName, siteUrl } from "@/lib/site"

type Props = {
  searchParams?: Promise<{
    keyword?: string
  }>
}

export const metadata = {
  title: `資格を探す｜難易度・勉強時間・合格率で検索 | ${siteName}`,
  description:
    "資格を難易度、勉強時間、合格率、カテゴリ、独学しやすさ、受験料、平均年収などで検索・比較できます。自分に合った資格探しに役立つ資格データベースです。",
}

export default async function QualificationsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams
  const initialKeyword = resolvedSearchParams?.keyword ?? ""

  const qualifications = await getQualifications()

  const items = qualifications.map((q) => ({
    slug: q.slug,
    name_ja: q.name_ja,
    name_short: q.name_short,
    category_primary: q.category_primary,
    qualification_type: q.qualification_type,
    issuing_body: q.issuing_body,
    summary_short: q.summary_short,

    pass_rate_latest: q.pass_rate_latest,
    study_hours_min: q.study_hours_min,
    study_hours_max: q.study_hours_max,
    exam_fee_tax_included: q.exam_fee_tax_included,

    average_salary_min: q.average_salary_min,
    average_salary_max: q.average_salary_max,

    exclusive_work_flag: q.exclusive_work_flag,
    exclusive_work_text: q.exclusive_work_text,

    eligibility_text: q.eligibility_text,
    exam_format_text: q.exam_format_text,

    difficulty_deviation: q.difficulty_deviation,
    self_study_score: q.self_study_score,
    cost_performance_score: q.cost_performance_score,
    career_value_score: q.career_value_score,
    job_relevance_score: q.job_relevance_score,
    salary_up_potential_score: q.salary_up_potential_score,
    brand_recognition_score: q.brand_recognition_score,
    practicality_score: q.practicality_score,
  }))

  return (
    <main className="bg-white">
      <BreadcrumbJsonLd
        items={[
          { name: "ホーム", item: siteUrl },
          { name: "資格を探す", item: `${siteUrl}/qualifications` },
        ]}
      />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <nav className="mb-6 text-sm text-neutral-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-neutral-950">
                ホーム
              </Link>
            </li>
            <li>/</li>
            <li className="text-neutral-950">資格を探す</li>
          </ol>
        </nav>

        <header className="border-b border-neutral-200/70 pb-8">
          <div className="text-sm text-neutral-500">資格検索</div>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-950">
            資格を探す
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600">
            資格を、カテゴリ、難易度、勉強時間、合格率、独学しやすさ、
            受験料、平均年収などで検索・比較できます。
          </p>
        </header>

        <QualificationsSearchClient
          items={items}
          initialKeyword={initialKeyword}
        />
      </div>
    </main>
  )
}
