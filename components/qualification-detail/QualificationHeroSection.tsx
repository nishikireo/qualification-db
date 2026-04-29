import {
  formatDateJa,
  formatDateRangeJa,
  formatHoursRange,
  formatPercent,
  formatYen,
} from "@/lib/format"
import type {
  DifficultyBenchmark,
  Qualification,
  QualificationExamSchedule,
} from "@/types/qualification"

type Props = {
  qualification: Qualification
  benchmark: DifficultyBenchmark | null
  nextSchedule: QualificationExamSchedule | undefined
}

export default function QualificationHeroSection({
  qualification,
  benchmark,
  nextSchedule,
}: Props) {
  return (
    <header className="border-b border-neutral-200/70 pb-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
        <span>{qualification.category_primary}</span>
        {qualification.qualification_type && (
          <>
            <span>/</span>
            <span>{qualification.qualification_type}</span>
          </>
        )}
        {qualification.last_verified_at && (
          <>
            <span>/</span>
            <span>最終確認日 {formatDateJa(qualification.last_verified_at)}</span>
          </>
        )}
      </div>

      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 md:text-4xl">
        {qualification.name_short}とは？難易度・合格率・勉強時間・試験日程
      </h1>

      <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600">
        {qualification.summary_short}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="rounded-lg border border-neutral-200/70 p-4">
          <div className="text-[11px] text-neutral-500">難易度</div>
          <div className="mt-1 text-xl font-semibold text-neutral-950">
            {qualification.difficulty_deviation ?? "-"}
          </div>
          {benchmark?.band_label && (
            <div className="mt-1 text-xs text-neutral-500">
              {benchmark.band_label}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-neutral-200/70 p-4">
          <div className="text-[11px] text-neutral-500">最新合格率</div>
          <div className="mt-1 text-xl font-semibold text-neutral-950">
            {formatPercent(qualification.pass_rate_latest)}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200/70 p-4">
          <div className="text-[11px] text-neutral-500">勉強時間</div>
          <div className="mt-1 text-xl font-semibold text-neutral-950">
            {formatHoursRange(
              qualification.study_hours_min,
              qualification.study_hours_max
            )}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200/70 p-4">
          <div className="text-[11px] text-neutral-500">受験料</div>
          <div className="mt-1 text-xl font-semibold text-neutral-950">
            {formatYen(qualification.exam_fee_tax_included)}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200/70 p-4">
          <div className="text-[11px] text-neutral-500">
            {nextSchedule ? "次回試験" : "試験回数"}
          </div>
          <div className="mt-1 text-sm font-semibold leading-6 text-neutral-950">
            {nextSchedule
              ? formatDateRangeJa(
                  nextSchedule.exam_start_date,
                  nextSchedule.exam_end_date
                )
              : qualification.exam_frequency_text || "-"}
          </div>
        </div>
      </div>
    </header>
  )
}
