import type { Qualification } from "@/types/qualification"
import { formatSalaryRange, formatScore } from "@/lib/format"

type Props = {
  qualification: Qualification
}

export default function FitSection({ qualification }: Props) {
  return (
    <section className="border-t border-neutral-200/70 py-8">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
          {qualification.name_short}を取るべき人
        </h2>
        <p className="mt-2 text-sm leading-7 text-neutral-600">
          学習負荷、独学しやすさ、仕事との関係、収入面の期待値から受験判断の材料を整理しています。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-neutral-200/70 bg-white p-5">
          <div className="text-sm font-semibold text-neutral-950">
            向いている人
          </div>

          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-neutral-600">
            {qualification.who_should_take || "準備中です。"}
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200/70 bg-white p-5">
          <div className="text-sm font-semibold text-neutral-950">
            向いていない人
          </div>

          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-neutral-600">
            {qualification.who_should_not_take || "準備中です。"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-neutral-200/70 p-4">
          <div className="text-[11px] text-neutral-500">独学しやすさ</div>
          <div className="mt-1 text-lg font-semibold text-neutral-950">
            {formatScore(qualification.self_study_score)}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200/70 p-4">
          <div className="text-[11px] text-neutral-500">転職価値</div>
          <div className="mt-1 text-lg font-semibold text-neutral-950">
            {formatScore(qualification.career_value_score)}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200/70 p-4">
          <div className="text-[11px] text-neutral-500">平均年収</div>
          <div className="mt-1 text-lg font-semibold text-neutral-950">
            {formatSalaryRange(
              qualification.average_salary_min,
              qualification.average_salary_max
            )}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200/70 p-4">
          <div className="text-[11px] text-neutral-500">独占業務</div>
          <div className="mt-1 text-lg font-semibold text-neutral-950">
            {qualification.exclusive_work_flag ? "あり" : "なし"}
          </div>
        </div>
      </div>

      {(qualification.exclusive_work_text ||
        qualification.renewal_text ||
        qualification.average_salary_note) && (
        <div className="mt-4 rounded-lg border border-neutral-200/70 p-5 text-sm leading-7 text-neutral-700">
          {qualification.exclusive_work_text && (
            <p>{qualification.exclusive_work_text}</p>
          )}
          {qualification.renewal_text && <p>{qualification.renewal_text}</p>}
          {qualification.average_salary_note && (
            <p>{qualification.average_salary_note}</p>
          )}
        </div>
      )}
    </section>
  )
}
