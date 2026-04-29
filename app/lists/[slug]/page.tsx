import Link from "next/link"
import { notFound } from "next/navigation"
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd"
import { getListPageBySlug, getListPages, getQualifications } from "@/lib/data"
import {
  formatHoursRange,
  formatPercent,
  formatYen,
} from "@/lib/format"
import { siteName, siteUrl } from "@/lib/site"
import type { Qualification } from "@/types/qualification"

type Props = {
  params: Promise<{ slug: string }>
}


function getMetricValue(q: Qualification, metric: string): number {
  const value = q[metric as keyof Qualification]

  if (typeof value === "number") return value
  return -1
}

function getMetricLabel(metric: string) {
  const map: Record<string, string> = {
    difficulty_deviation: "難易度偏差値",
    self_study_score: "独学適性",
    cost_performance_score: "コスパ",
    career_value_score: "キャリア価値",
    job_relevance_score: "業務関連性",
    salary_up_potential_score: "年収アップ期待",
    brand_recognition_score: "知名度",
    practicality_score: "実用性",
    pass_rate_latest: "合格率",
  }

  return map[metric] ?? metric
}

function getMetricDisplayValue(q: Qualification, metric: string) {
  const value = q[metric as keyof Qualification]

  if (value === null || value === undefined || value === "") return "-"

  if (metric === "pass_rate_latest" && typeof value === "number") {
    return `${value}%`
  }

  if (typeof value === "number") {
    return `${value}`
  }

  return String(value)
}

function applySecondaryFilter(items: Qualification[], filter: string) {
  if (!filter || filter === "publish_flag=TRUE") return items

  const containsMatch = filter.match(/^(\w+)\s+contains\s+(.+)$/)
  if (containsMatch) {
    const [, field, expected] = containsMatch
    return items.filter((q) =>
      String(q[field as keyof Qualification] ?? "").includes(expected)
    )
  }

  const inMatch = filter.match(/^(\w+)\s+in\s+(.+)$/)
  if (inMatch) {
    const [, field, expectedValues] = inMatch
    const values = expectedValues.split(",").map((value) => value.trim())

    return items.filter((q) =>
      values.includes(String(q[field as keyof Qualification] ?? ""))
    )
  }

  const equalsMatch = filter.match(/^(\w+)=(.+)$/)
  if (equalsMatch) {
    const [, field, expected] = equalsMatch

    return items.filter(
      (q) =>
        qValueToFilterString(q[field as keyof Qualification]) ===
        expected.trim()
    )
  }

  return items
}

function qValueToFilterString(value: Qualification[keyof Qualification]) {
  if (value === undefined || value === null) return undefined
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE"
  return String(value)
}

export async function generateStaticParams() {
  const pages = await getListPages()

  return pages.map((page) => ({
    slug: page.slug,
  }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const page = await getListPageBySlug(slug)

  if (!page) return {}

  return {
    title: `${page.title} | ${siteName}`,
    description: page.description,
  }
}

export default async function ListPage({ params }: Props) {
  const { slug } = await params

  const [page, qualifications] = await Promise.all([
    getListPageBySlug(slug),
    getQualifications(),
  ])

  if (!page) notFound()

  const filteredQualifications = applySecondaryFilter(
    qualifications,
    page.secondary_filter
  ).sort((a, b) => {
    const aValue = getMetricValue(a, page.primary_metric)
    const bValue = getMetricValue(b, page.primary_metric)
    return bValue - aValue
  })

  return (
    <main className="bg-white">
      <BreadcrumbJsonLd
        items={[
          { name: "ホーム", item: siteUrl },
          { name: page.title, item: `${siteUrl}/lists/${page.slug}` },
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
            <li className="text-neutral-950">{page.title}</li>
          </ol>
        </nav>

        <header className="border-b border-neutral-200/70 pb-8">
          <div className="text-sm text-neutral-500">資格一覧</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-950">
            {page.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600">
            {page.description}
          </p>
        </header>

        <section className="grid grid-cols-2 gap-3 py-8 md:grid-cols-4">
          <div className="rounded-lg border border-neutral-200/70 p-4">
            <div className="text-[11px] text-neutral-500">掲載資格数</div>
            <div className="mt-1 text-xl font-semibold text-neutral-950">
              {filteredQualifications.length}
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200/70 p-4">
            <div className="text-[11px] text-neutral-500">並び替え指標</div>
            <div className="mt-1 text-sm font-semibold leading-6 text-neutral-950">
              {getMetricLabel(page.primary_metric)}
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200/70 p-4">
            <div className="text-[11px] text-neutral-500">絞り込み条件</div>
            <div className="mt-1 text-sm font-semibold leading-6 text-neutral-950">
              {page.secondary_filter || "なし"}
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200/70 p-4">
            <div className="text-[11px] text-neutral-500">表示順</div>
            <div className="mt-1 text-sm font-semibold leading-6 text-neutral-950">
              高い順
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200/70 py-8">
          <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
            資格一覧
          </h2>

          {filteredQualifications.length === 0 ? (
            <div className="rounded-lg border border-neutral-200/70 p-6 text-sm text-neutral-600">
              該当する資格がありません。
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredQualifications.map((q, index) => (
                <Link
                  key={q.slug}
                  href={`/qualifications/${q.slug}`}
                  className="rounded-lg border border-neutral-200/70 p-5 transition hover:border-neutral-400"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-neutral-500">
                          #{index + 1}
                        </span>
                        <span className="rounded-full border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-500">
                          {q.category_primary}
                        </span>
                        {q.qualification_type && (
                          <span className="rounded-full border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-500">
                            {q.qualification_type}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-2 text-lg font-semibold tracking-tight text-neutral-950">
                        {q.name_short}
                      </h3>

                      {q.summary_short && (
                        <p className="mt-2 line-clamp-2 text-sm leading-7 text-neutral-600">
                          {q.summary_short}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm md:min-w-[360px] md:grid-cols-4">
                      <div className="rounded-md bg-neutral-50 p-3">
                        <div className="text-[11px] text-neutral-500">
                          {getMetricLabel(page.primary_metric)}
                        </div>
                        <div className="mt-1 font-semibold text-neutral-950">
                          {getMetricDisplayValue(q, page.primary_metric)}
                        </div>
                      </div>

                      <div className="rounded-md bg-neutral-50 p-3">
                        <div className="text-[11px] text-neutral-500">
                          合格率
                        </div>
                        <div className="mt-1 font-semibold text-neutral-950">
                          {formatPercent(q.pass_rate_latest)}
                        </div>
                      </div>

                      <div className="rounded-md bg-neutral-50 p-3">
                        <div className="text-[11px] text-neutral-500">
                          勉強時間
                        </div>
                        <div className="mt-1 font-semibold text-neutral-950">
                          {formatHoursRange(q.study_hours_min, q.study_hours_max)}
                        </div>
                      </div>

                      <div className="rounded-md bg-neutral-50 p-3">
                        <div className="text-[11px] text-neutral-500">
                          受験料
                        </div>
                        <div className="mt-1 font-semibold text-neutral-950">
                          {formatYen(q.exam_fee_tax_included)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
