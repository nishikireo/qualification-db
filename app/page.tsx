import Link from "next/link"
import { getListPages, getQualifications } from "@/lib/data"
import HomeQualificationSearch from "@/components/HomeQualificationSearch"
import {
  formatHoursRange,
  formatNumber,
  formatPercent,
  formatSalaryRange,
  formatYen,
} from "@/lib/format"

export const metadata = {
  title: "オープン資格",
  description:
    "資格の難易度、合格率、勉強時間、受験料、独学しやすさ、転職価値をデータで比較する。",
  alternates: {
    canonical: "/",
  },
}

function getFeaturedQualifications<T extends { career_value_score: number | null | undefined }>(
  qualifications: T[]
) {
  return [...qualifications]
    .sort((a, b) => (b.career_value_score ?? 0) - (a.career_value_score ?? 0))
    .slice(0, 12)
}

export default async function HomePage() {
  const [qualifications, listPages] = await Promise.all([
    getQualifications(),
    getListPages(),
  ])

  const featured = getFeaturedQualifications(qualifications)
  const listLinks = listPages.map((page) => ({
    href: `/lists/${page.slug}`,
    label: page.title,
  }))

  return (
    <main className="bg-white">
      <section className="border-b border-neutral-200/70">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
              資格を、データで比較する。
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-neutral-600 md:text-base">
              難易度、合格率、勉強時間、受験料、独学しやすさ、転職価値を整理して、
              比較しやすい形で公開します。
            </p>

            <HomeQualificationSearch />
          </div>

          <div className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-2">
            {listLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md border border-neutral-200/70 px-3 py-2 text-sm text-neutral-700 hover:text-neutral-950"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
              注目の資格
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              比較されやすく、検索需要の高い資格を表示しています。
            </p>
          </div>
          <Link
            href="/qualifications"
            className="text-sm text-neutral-600 hover:text-neutral-950"
          >
            すべての資格を見る
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {featured.map((q) => (
              <Link
                key={q.slug}
                href={`/qualifications/${q.slug}`}
                className="block rounded-lg border border-neutral-200/70 bg-white p-5 transition hover:border-neutral-400"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs text-neutral-500">{q.category_primary}</div>
                    <h3 className="mt-1 text-lg font-semibold tracking-tight text-neutral-950">
                      {q.name_short}
                    </h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-600">
                      {q.summary_short}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-[11px] text-neutral-500">難易度偏差値</div>
                    <div className="text-sm font-medium text-neutral-950">
                      {formatNumber(q.difficulty_deviation)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-neutral-200/70 pt-4 text-sm">
                  <div>
                    <div className="text-[11px] text-neutral-500">合格率</div>
                    <div className="mt-1 text-neutral-900">
                      {formatPercent(q.pass_rate_latest)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-neutral-500">勉強時間</div>
                    <div className="mt-1 text-neutral-900">
                      {formatHoursRange(q.study_hours_min, q.study_hours_max)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-neutral-500">受験料</div>
                    <div className="mt-1 text-neutral-900">
                      {formatYen(q.exam_fee_tax_included)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-neutral-500">平均年収</div>
                    <div className="mt-1 text-neutral-900">
                      {formatSalaryRange(q.average_salary_min, q.average_salary_max)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-neutral-200/70 p-8 text-center">
            <p className="text-sm text-neutral-700">
              表示できる資格がまだありません。
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
