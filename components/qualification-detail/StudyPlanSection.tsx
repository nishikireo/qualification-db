import { formatHoursRange } from "@/lib/format"
import type { Qualification } from "@/types/qualification"

type Props = {
  qualification: Qualification
}

type Plan = {
  label: string
  weeks: number
}

function getStudyPlans(maxHours: number): Plan[] {
  if (maxHours <= 80) {
    return [
      { label: "短期集中", weeks: 4 },
      { label: "標準", weeks: 8 },
      { label: "余裕あり", weeks: 12 },
    ]
  }

  if (maxHours <= 200) {
    return [
      { label: "短期集中", weeks: 8 },
      { label: "標準", weeks: 12 },
      { label: "余裕あり", weeks: 24 },
    ]
  }

  if (maxHours <= 500) {
    return [
      { label: "短期集中", weeks: 12 },
      { label: "標準", weeks: 24 },
      { label: "余裕あり", weeks: 36 },
    ]
  }

  if (maxHours <= 1000) {
    return [
      { label: "短期集中", weeks: 24 },
      { label: "標準", weeks: 36 },
      { label: "余裕あり", weeks: 52 },
    ]
  }

  return [
    { label: "短期集中", weeks: 36 },
    { label: "標準", weeks: 52 },
    { label: "余裕あり", weeks: 78 },
  ]
}

function formatHoursPerDay(value: number) {
  const rounded = Math.ceil(value * 10) / 10
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1)
}

function formatWeeklyHours(
  min: number | null | undefined,
  max: number | null | undefined,
  weeks: number
) {
  if (min === null || min === undefined || max === null || max === undefined) {
    return "-"
  }

  return `週${Math.ceil(min / weeks)}〜${Math.ceil(max / weeks)}時間`
}

function formatWorkerAllocation(
  min: number | null | undefined,
  max: number | null | undefined,
  weeks: number
) {
  if (min === null || min === undefined || max === null || max === undefined) {
    return null
  }

  const weeklyMin = min / weeks
  const weeklyMax = max / weeks
  const weekdayMin = weeklyMin * 0.4 / 5
  const weekdayMax = weeklyMax * 0.4 / 5
  const holidayMin = weeklyMin * 0.6 / 2
  const holidayMax = weeklyMax * 0.6 / 2

  return {
    weekday: `${formatHoursPerDay(weekdayMin)}〜${formatHoursPerDay(weekdayMax)}時間/日`,
    holiday: `${formatHoursPerDay(holidayMin)}〜${formatHoursPerDay(holidayMax)}時間/日`,
  }
}

export default function StudyPlanSection({ qualification }: Props) {
  const hasStudyHours =
    qualification.study_hours_min !== null &&
    qualification.study_hours_min !== undefined &&
    qualification.study_hours_max !== null &&
    qualification.study_hours_max !== undefined

  if (!hasStudyHours) return null

  const plans = getStudyPlans(qualification.study_hours_max ?? 0)

  return (
    <section className="border-t border-neutral-200/70 py-8">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
          学習計画の目安
        </h2>
        <p className="mt-2 text-sm leading-7 text-neutral-600">
          必要勉強時間は{formatHoursRange(qualification.study_hours_min, qualification.study_hours_max)}が目安です。
          学習量に応じた準備期間と、週5日勤務を想定した平日・休日の配分を確認できます。
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {plans.map((plan) => (
          <StudyPlanCard
            key={plan.label}
            plan={plan}
            studyHoursMin={qualification.study_hours_min}
            studyHoursMax={qualification.study_hours_max}
          />
        ))}
      </div>

      <p className="mt-3 text-xs leading-6 text-neutral-500">
        平日・休日の配分は、週の学習時間の40%を平日5日、60%を休日2日に振り分けた目安です。
      </p>
    </section>
  )
}

function StudyPlanCard({
  plan,
  studyHoursMin,
  studyHoursMax,
}: {
  plan: Plan
  studyHoursMin: number | null
  studyHoursMax: number | null
}) {
  const allocation = formatWorkerAllocation(
    studyHoursMin,
    studyHoursMax,
    plan.weeks
  )

  return (
    <div className="rounded-lg border border-neutral-200/70 p-5">
      <div className="text-sm font-semibold text-neutral-950">
        {plan.label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-neutral-950">
        {formatWeeklyHours(studyHoursMin, studyHoursMax, plan.weeks)}
      </div>
      <div className="mt-2 text-xs text-neutral-500">
        {plan.weeks}週間で準備する場合
      </div>

      {allocation && (
        <div className="mt-4 grid gap-2 text-sm">
          <div className="rounded-md bg-neutral-50 p-3">
            <div className="text-[11px] text-neutral-500">平日</div>
            <div className="mt-1 font-semibold text-neutral-950">
              {allocation.weekday}
            </div>
          </div>
          <div className="rounded-md bg-neutral-50 p-3">
            <div className="text-[11px] text-neutral-500">休日</div>
            <div className="mt-1 font-semibold text-neutral-950">
              {allocation.holiday}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
