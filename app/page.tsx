import Link from "next/link"
import { getQualifications } from "@/lib/data"

export const metadata = {
  title: "オープン資格",
  description:
    "資格の難易度、合格率、勉強時間、受験料、独学しやすさ、転職価値をデータで比較する。",
}

function scoreLabel(value: number | null | undefined) {
  if (value === null || value === undefined) return "-"
  return `${value} / 100`
}

function feeLabel(value: number | null | undefined) {
  if (value === null || value === undefined) return "-"
  return `${value.toLocaleString()}円`
}

function hoursLabel(min: number | null | undefined, max: number | null | undefined) {
  if (min === null || min === undefined || max === null || max === undefined) return "-"
  return `${min}〜${max}時間`
}

export default async function HomePage() {
  const qualifications = await getQualifications()

  const featured = [...qualifications]
    .sort((a, b) => (b.career_value_score ?? 0) - (a.career_value_score ?? 0))
    .slice(0, 12)

  const listLinks = [
    { href: "/lists/difficulty", label: "難易度が高い資格一覧" },
    { href: "/lists/self-study", label: "独学しやすい資格一覧" },
    { href: "/lists/cost-performance", label: "コスパが高い資格一覧" },
    { href: "/lists/no-eligibility", label: "受験資格なしの資格一覧" },
    { href: "/lists/exclusive-work", label: "独占業務がある資格一覧" },
    { href: "/lists/real-estate", label: "不動産資格一覧" },
  ]

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
          </div>

          <div className="mx-auto mt-10 max-w-2xl">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="資格名で検索する　例: 宅建 / 簿記2級 / FP2級"
                className="h-12 flex-1 rounded-lg border border-neutral-200/70 bg-white px-4 text-sm text-neutral-950 outline-none placeholder:text-neutral-400 focus:border-neutral-400"
              />
              <button className="h-12 rounded-lg border border-neutral-900 bg-neutral-950 px-5 text-sm font-medium text-white hover:opacity-90">
                検索
              </button>
            </div>
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
            href="/lists/difficulty"
            className="text-sm text-neutral-600 hover:text-neutral-950"
          >
            一覧を見る
          </Link>
        </div>

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
                  <div className="text-[11px] text-neutral-500">難易度</div>
                  <div className="text-sm font-medium text-neutral-950">
                    {scoreLabel(q.difficulty_score)}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-neutral-200/70 pt-4 text-sm">
                <div>
                  <div className="text-[11px] text-neutral-500">合格率</div>
                  <div className="mt-1 text-neutral-900">
                    {q.pass_rate_latest !== null && q.pass_rate_latest !== undefined
                      ? `${q.pass_rate_latest}%`
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-neutral-500">勉強時間</div>
                  <div className="mt-1 text-neutral-900">
                    {hoursLabel(q.study_hours_min, q.study_hours_max)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-neutral-500">受験料</div>
                  <div className="mt-1 text-neutral-900">
                    {feeLabel(q.exam_fee_tax_included)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-neutral-500">転職価値</div>
                  <div className="mt-1 text-neutral-900">
                    {scoreLabel(q.career_value_score)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}