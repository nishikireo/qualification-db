import { formatHoursRange } from "@/lib/format"
import type { Qualification } from "@/types/qualification"

type Props = {
  qualification: Qualification
}

type Plan = {
  label: string
  weeks: number
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

export default function StudyPlanSection({ qualification }: Props) {
  const hasStudyHours =
    qualification.study_hours_min !== null &&
    qualification.study_hours_min !== undefined &&
    qualification.study_hours_max !== null &&
    qualification.study_hours_max !== undefined

  if (!hasStudyHours) return null

  const plans: Plan[] = [
    { label: "短期集中", weeks: 8 },
    { label: "標準", weeks: 12 },
    { label: "余裕あり", weeks: 24 },
  ]

  return (
    <section className="border-t border-neutral-200/70 py-8">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
          学習計画の目安
        </h2>
        <p className="mt-2 text-sm leading-7 text-neutral-600">
          必要勉強時間は{formatHoursRange(qualification.study_hours_min, qualification.study_hours_max)}が目安です。
          受験日から逆算して、週あたりの学習量を見積もれます。
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.label}
            className="rounded-lg border border-neutral-200/70 p-5"
          >
            <div className="text-sm font-semibold text-neutral-950">
              {plan.label}
            </div>
            <div className="mt-2 text-2xl font-semibold text-neutral-950">
              {formatWeeklyHours(
                qualification.study_hours_min,
                qualification.study_hours_max,
                plan.weeks
              )}
            </div>
            <div className="mt-2 text-xs text-neutral-500">
              {plan.weeks}週間で準備する場合
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
