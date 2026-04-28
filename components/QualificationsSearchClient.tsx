"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  formatPercent,
  formatHoursRange,
  formatYen,
  formatSalaryRange,
  numberValue,
} from "@/lib/format"

type QualificationSearchItem = {
  slug: string
  name_ja: string
  name_short: string
  category_primary: string
  qualification_type?: string
  issuing_body?: string
  summary_short?: string

  pass_rate_latest: number | null
  study_hours_min: number | null
  study_hours_max: number | null
  exam_fee_tax_included: number | null

  average_salary_min?: number | null
  average_salary_max?: number | null

  exclusive_work_flag: boolean
  exclusive_work_text?: string

  eligibility_text: string
  exam_format_text?: string

  difficulty_deviation?: number | null
  self_study_score: number | null
  cost_performance_score: number | null
  career_value_score: number | null
  job_relevance_score?: number | null
  salary_up_potential_score?: number | null
  brand_recognition_score?: number | null
  practicality_score?: number | null
}

type Props = {
  items: QualificationSearchItem[]
  initialKeyword?: string
}

type SortKey =
  | "difficulty_desc"
  | "difficulty_asc"
  | "self_study_desc"
  | "cost_performance_desc"
  | "career_value_desc"
  | "study_hours_asc"
  | "pass_rate_desc"
  | "salary_desc"
  | "exam_fee_asc"


function getStudyHoursAverage(item: QualificationSearchItem) {
  const min = item.study_hours_min
  const max = item.study_hours_max

  if (min === null || min === undefined) return null
  if (max === null || max === undefined) return min

  return (min + max) / 2
}

function getSalaryAverage(item: QualificationSearchItem) {
  const min = item.average_salary_min
  const max = item.average_salary_max

  if (min === null || min === undefined) return null
  if (max === null || max === undefined) return min

  return (min + max) / 2
}

function isNoEligibility(item: QualificationSearchItem) {
  return (
    item.eligibility_text.includes("制限なし") ||
    item.eligibility_text.includes("誰でも") ||
    item.eligibility_text.includes("なし")
  )
}

function isCbt(item: QualificationSearchItem) {
  return (
    item.exam_format_text?.toLowerCase().includes("cbt") ||
    item.exam_format_text?.includes("CBT")
  )
}

function difficultyBand(item: QualificationSearchItem) {
  const deviation = item.difficulty_deviation

  if (deviation === null || deviation === undefined) return "unknown"

  if (deviation >= 65) return "hard"
  if (deviation >= 55) return "middle"
  if (deviation >= 45) return "normal"
  return "easy"
}

function studyHoursBand(item: QualificationSearchItem) {
  const avg = getStudyHoursAverage(item)

  if (avg === null || avg === undefined) return "unknown"
  if (avg <= 100) return "short"
  if (avg <= 300) return "middle"
  return "long"
}

function sortItems(items: QualificationSearchItem[], sortKey: SortKey) {
  return [...items].sort((a, b) => {
    if (sortKey === "difficulty_desc") {
      return numberValue(b.difficulty_deviation) - numberValue(a.difficulty_deviation)
    }

    if (sortKey === "difficulty_asc") {
      return numberValue(a.difficulty_deviation, 9999) - numberValue(b.difficulty_deviation, 9999)
    }

    if (sortKey === "self_study_desc") {
      return numberValue(b.self_study_score) - numberValue(a.self_study_score)
    }

    if (sortKey === "cost_performance_desc") {
      return numberValue(b.cost_performance_score) - numberValue(a.cost_performance_score)
    }

    if (sortKey === "career_value_desc") {
      return numberValue(b.career_value_score) - numberValue(a.career_value_score)
    }

    if (sortKey === "study_hours_asc") {
      return numberValue(getStudyHoursAverage(a), 999999) - numberValue(getStudyHoursAverage(b), 999999)
    }

    if (sortKey === "pass_rate_desc") {
      return numberValue(b.pass_rate_latest) - numberValue(a.pass_rate_latest)
    }

    if (sortKey === "salary_desc") {
      return numberValue(getSalaryAverage(b)) - numberValue(getSalaryAverage(a))
    }

    if (sortKey === "exam_fee_asc") {
      return numberValue(a.exam_fee_tax_included, 999999) - numberValue(b.exam_fee_tax_included, 999999)
    }

    return 0
  })
}

export default function QualificationsSearchClient({
  items,
  initialKeyword = "",
}: Props) {
  const [keyword, setKeyword] = useState(initialKeyword)
  const [category, setCategory] = useState("all")
  const [difficulty, setDifficulty] = useState("all")
  const [studyHours, setStudyHours] = useState("all")
  const [onlyNoEligibility, setOnlyNoEligibility] = useState(false)
  const [onlyExclusiveWork, setOnlyExclusiveWork] = useState(false)
  const [onlyCbt, setOnlyCbt] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>("difficulty_desc")

  const categories = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.category_primary).filter(Boolean))).sort()
  }, [items])

  const filteredItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    const filtered = items.filter((item) => {
      const keywordMatched =
        !normalizedKeyword ||
        item.name_ja.toLowerCase().includes(normalizedKeyword) ||
        item.name_short.toLowerCase().includes(normalizedKeyword) ||
        item.slug.toLowerCase().includes(normalizedKeyword) ||
        item.category_primary.toLowerCase().includes(normalizedKeyword) ||
        item.summary_short?.toLowerCase().includes(normalizedKeyword)

      if (!keywordMatched) return false

      if (category !== "all" && item.category_primary !== category) {
        return false
      }

      if (difficulty !== "all" && difficultyBand(item) !== difficulty) {
        return false
      }

      if (studyHours !== "all" && studyHoursBand(item) !== studyHours) {
        return false
      }

      if (onlyNoEligibility && !isNoEligibility(item)) {
        return false
      }

      if (onlyExclusiveWork && !item.exclusive_work_flag) {
        return false
      }

      if (onlyCbt && !isCbt(item)) {
        return false
      }

      return true
    })

    return sortItems(filtered, sortKey)
  }, [
    items,
    keyword,
    category,
    difficulty,
    studyHours,
    onlyNoEligibility,
    onlyExclusiveWork,
    onlyCbt,
    sortKey,
  ])

  const resetFilters = () => {
    setKeyword("")
    setCategory("all")
    setDifficulty("all")
    setStudyHours("all")
    setOnlyNoEligibility(false)
    setOnlyExclusiveWork(false)
    setOnlyCbt(false)
    setSortKey("difficulty_desc")
  }

  return (
    <section className="py-8">
      <div className="rounded-lg border border-neutral-200/70 p-4 md:p-5">
        <div className="grid gap-4">
          <div>
            <label htmlFor="keyword" className="text-sm font-medium text-neutral-950">
              キーワード検索
            </label>
            <input
              id="keyword"
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="宅建、簿記2級、FP、IT、不動産..."
              className="mt-2 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-500"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <label htmlFor="category" className="text-sm font-medium text-neutral-950">
                カテゴリ
              </label>
              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-neutral-500"
              >
                <option value="all">すべて</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="difficulty" className="text-sm font-medium text-neutral-950">
                難易度
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
                className="mt-2 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-neutral-500"
              >
                <option value="all">すべて</option>
                <option value="easy">入門</option>
                <option value="normal">標準</option>
                <option value="middle">やや難関</option>
                <option value="hard">難関</option>
              </select>
            </div>

            <div>
              <label htmlFor="studyHours" className="text-sm font-medium text-neutral-950">
                勉強時間
              </label>
              <select
                id="studyHours"
                value={studyHours}
                onChange={(event) => setStudyHours(event.target.value)}
                className="mt-2 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-neutral-500"
              >
                <option value="all">すべて</option>
                <option value="short">〜100時間</option>
                <option value="middle">101〜300時間</option>
                <option value="long">301時間〜</option>
              </select>
            </div>

            <div>
              <label htmlFor="sortKey" className="text-sm font-medium text-neutral-950">
                並び替え
              </label>
              <select
                id="sortKey"
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as SortKey)}
                className="mt-2 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-neutral-500"
              >
                <option value="difficulty_desc">難易度が高い順</option>
                <option value="difficulty_asc">難易度が低い順</option>
                <option value="self_study_desc">独学しやすい順</option>
                <option value="cost_performance_desc">コスパが高い順</option>
                <option value="career_value_desc">キャリア価値が高い順</option>
                <option value="study_hours_asc">勉強時間が短い順</option>
                <option value="pass_rate_desc">合格率が高い順</option>
                <option value="salary_desc">平均年収が高い順</option>
                <option value="exam_fee_asc">受験料が安い順</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={onlyNoEligibility}
                onChange={(event) => setOnlyNoEligibility(event.target.checked)}
                className="h-4 w-4"
              />
              受験資格なし
            </label>

            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={onlyExclusiveWork}
                onChange={(event) => setOnlyExclusiveWork(event.target.checked)}
                className="h-4 w-4"
              />
              独占業務あり
            </label>

            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={onlyCbt}
                onChange={(event) => setOnlyCbt(event.target.checked)}
                className="h-4 w-4"
              />
              CBT対応
            </label>

            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-950"
            >
              条件をリセット
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 border-b border-neutral-200/70 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
            検索結果
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {filteredItems.length}件の資格が見つかりました。
          </p>
        </div>

        <div className="text-xs text-neutral-500">
          絞り込みはページ内で完結します。検索条件ごとのURLは生成しません。
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="mt-6 rounded-lg border border-neutral-200/70 p-6 text-sm text-neutral-600">
          条件に一致する資格がありません。条件を変更して再検索してください。
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {filteredItems.map((item, index) => (
            <Link
              key={item.slug}
              href={`/qualifications/${item.slug}`}
              className="rounded-lg border border-neutral-200/70 p-5 transition hover:border-neutral-400"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-neutral-500">#{index + 1}</span>

                    <span className="rounded-full border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-500">
                      {item.category_primary}
                    </span>

                    {item.qualification_type && (
                      <span className="rounded-full border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-500">
                        {item.qualification_type}
                      </span>
                    )}

                    {item.exclusive_work_flag && (
                      <span className="rounded-full border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-500">
                        独占業務あり
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-neutral-950">
                    {item.name_short}
                  </h3>

                  {item.summary_short && (
                    <p className="mt-2 line-clamp-2 text-sm leading-7 text-neutral-600">
                      {item.summary_short}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm md:w-[460px] md:shrink-0 md:grid-cols-5">
                  <div className="rounded-md bg-neutral-50 p-3">
                    <div className="text-[11px] text-neutral-500">偏差値</div>
                    <div className="mt-1 font-semibold text-neutral-950">
                      {item.difficulty_deviation ?? "-"}
                    </div>
                  </div>

                  <div className="rounded-md bg-neutral-50 p-3">
                    <div className="text-[11px] text-neutral-500">合格率</div>
                    <div className="mt-1 font-semibold text-neutral-950">
                      {formatPercent(item.pass_rate_latest)}
                    </div>
                  </div>

                  <div className="rounded-md bg-neutral-50 p-3">
                    <div className="text-[11px] text-neutral-500">勉強時間</div>
                    <div className="mt-1 font-semibold text-neutral-950">
                      {formatHoursRange(item.study_hours_min, item.study_hours_max)}
                    </div>
                  </div>

                  <div className="rounded-md bg-neutral-50 p-3">
                    <div className="text-[11px] text-neutral-500">受験料</div>
                    <div className="mt-1 font-semibold text-neutral-950">
                      {formatYen(item.exam_fee_tax_included)}
                    </div>
                  </div>

                  <div className="rounded-md bg-neutral-50 p-3">
                    <div className="text-[11px] text-neutral-500">年収目安</div>
                    <div className="mt-1 font-semibold text-neutral-950">
                      {formatSalaryRange(item.average_salary_min, item.average_salary_max)}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}