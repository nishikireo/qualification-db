import type { DifficultyBenchmark, Qualification } from "@/types/qualification"

type Props = {
  qualification: Qualification
  benchmark: DifficultyBenchmark | null
}

export default function DifficultyBenchmarkSection({
  qualification,
  benchmark,
}: Props) {
  if (!benchmark) return null

  return (
    <section className="border-t border-neutral-200/70 py-8">
      <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
        {qualification.name_short}の難易度の目安
      </h2>

      <div className="rounded-lg border border-neutral-200/70 p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-[11px] text-neutral-500">資格難易度偏差値</div>
            <div className="mt-1 text-2xl font-semibold text-neutral-950">
              {qualification.difficulty_deviation ?? "-"}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-neutral-500">難易度帯</div>
            <div className="mt-1 text-base font-medium text-neutral-950">
              {benchmark.band_label}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-neutral-500">大学群の目安</div>
            <div className="mt-1 text-base font-medium text-neutral-950">
              {benchmark.university_group}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-neutral-500">大学例</div>
            <div className="mt-1 text-base font-medium text-neutral-950">
              {benchmark.university_examples}
            </div>
          </div>
        </div>

        {(qualification.difficulty_reason_text || benchmark.note) && (
          <div className="mt-5 border-t border-neutral-200/70 pt-4">
            {qualification.difficulty_reason_text && (
              <div>
                <div className="text-sm font-semibold text-neutral-950">
                  なぜこの難易度なのか
                </div>
                <p className="mt-3 text-sm leading-8 text-neutral-700">
                  {qualification.difficulty_reason_text}
                </p>
              </div>
            )}

            {benchmark.note && (
              <p className="mt-4 text-xs leading-6 text-neutral-500">
                {benchmark.note}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
