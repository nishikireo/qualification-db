import { formatHoursRange, formatPercent, formatSalaryRange, formatYen } from "@/lib/format"
import type { DifficultyBenchmark, Qualification } from "@/types/qualification"

type Props = {
  qualification: Qualification
  benchmark: DifficultyBenchmark | null
}

export default function BasicIndicatorsSection({
  qualification,
  benchmark,
}: Props) {
  return (
    <section className="py-8">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
          基本指標
        </h2>
        <p className="mt-2 text-sm leading-7 text-neutral-600">
          難易度偏差値、合格率、勉強時間、受験料、平均年収の目安をまとめています。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="rounded-lg border border-neutral-200/70 p-4">
          <div className="text-[11px] text-neutral-500">難易度偏差値</div>
          <div className="mt-1 text-lg font-medium text-neutral-950">
            {qualification.difficulty_deviation ?? "-"}
          </div>
          {benchmark?.band_label && (
            <div className="mt-1 text-xs text-neutral-500">
              {benchmark.band_label}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-neutral-200/70 p-4">
          <div className="text-[11px] text-neutral-500">合格率</div>
          <div className="mt-1 text-lg font-medium text-neutral-950">
            {formatPercent(qualification.pass_rate_latest)}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200/70 p-4">
          <div className="text-[11px] text-neutral-500">勉強時間</div>
          <div className="mt-1 text-lg font-medium text-neutral-950">
            {formatHoursRange(
              qualification.study_hours_min,
              qualification.study_hours_max
            )}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200/70 p-4">
          <div className="text-[11px] text-neutral-500">受験料</div>
          <div className="mt-1 text-lg font-medium text-neutral-950">
            {formatYen(qualification.exam_fee_tax_included)}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200/70 p-4">
          <div className="text-[11px] text-neutral-500">平均年収</div>
          <div className="mt-1 text-lg font-medium text-neutral-950">
            {formatSalaryRange(
              qualification.average_salary_min,
              qualification.average_salary_max
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
