import type {
  Qualification,
  QualificationExamSchedule,
} from "@/types/qualification"

type Props = {
  qualification: Qualification
  schedules: QualificationExamSchedule[]
}

function formatDate(value: string) {
  if (!value) return ""

  const date = new Date(`${value}T00:00:00+09:00`)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date)
}

function formatDateRange(start: string, end: string) {
  if (!start && !end) return "-"
  if (start && end && start === end) return formatDate(start)
  if (start && end) return `${formatDate(start)}〜${formatDate(end)}`
  if (start) return `${formatDate(start)}〜`
  return `〜${formatDate(end)}`
}

function textOrDash(value: string | null | undefined) {
  if (!value) return "-"
  return value
}

export default function QualificationExamInfoSection({
  qualification,
  schedules,
}: Props) {
  const nextSchedule = schedules[0]

  const hasMasterInfo = Boolean(
    qualification.passing_criteria_text ||
      qualification.application_period_summary ||
      qualification.exam_schedule_summary ||
      qualification.test_location_summary
  )

  if (!hasMasterInfo && schedules.length === 0) return null

  return (
    <section className="border-t border-neutral-200/70 py-8">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
          試験情報
        </h2>
        <p className="mt-2 text-sm leading-7 text-neutral-600">
          合格基準、申込期間、試験日程、受験地の目安をまとめています。
        </p>
      </div>

      {nextSchedule && (
        <div className="mb-5 rounded-lg border border-neutral-200/70 p-5">
          <div className="text-sm font-semibold text-neutral-950">
            次回・最新の試験日程
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-md bg-neutral-50 p-3">
              <div className="text-[11px] text-neutral-500">対象</div>
              <div className="mt-1 text-sm font-semibold leading-6 text-neutral-950">
                {nextSchedule.exam_period_label ||
                  nextSchedule.exam_year ||
                  "-"}
              </div>
            </div>

            <div className="rounded-md bg-neutral-50 p-3">
              <div className="text-[11px] text-neutral-500">申込期間</div>
              <div className="mt-1 text-sm font-semibold leading-6 text-neutral-950">
                {formatDateRange(
                  nextSchedule.application_start_date,
                  nextSchedule.application_end_date
                )}
              </div>
            </div>

            <div className="rounded-md bg-neutral-50 p-3">
              <div className="text-[11px] text-neutral-500">試験日程</div>
              <div className="mt-1 text-sm font-semibold leading-6 text-neutral-950">
                {formatDateRange(
                  nextSchedule.exam_start_date,
                  nextSchedule.exam_end_date
                )}
              </div>
            </div>

            <div className="rounded-md bg-neutral-50 p-3">
              <div className="text-[11px] text-neutral-500">合格発表</div>
              <div className="mt-1 text-sm font-semibold leading-6 text-neutral-950">
                {nextSchedule.result_date
                  ? formatDate(nextSchedule.result_date)
                  : "-"}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-md bg-neutral-50 p-3">
              <div className="text-[11px] text-neutral-500">受験地</div>
              <div className="mt-1 text-sm font-semibold leading-6 text-neutral-950">
                {textOrDash(nextSchedule.test_locations)}
              </div>
            </div>

            <div className="rounded-md bg-neutral-50 p-3">
              <div className="text-[11px] text-neutral-500">確認日</div>
              <div className="mt-1 text-sm font-semibold leading-6 text-neutral-950">
                {nextSchedule.checked_at
                  ? formatDate(nextSchedule.checked_at)
                  : "-"}
              </div>
            </div>
          </div>

          {nextSchedule.notes && (
            <p className="mt-4 text-xs leading-6 text-neutral-500">
              {nextSchedule.notes}
            </p>
          )}

          {nextSchedule.source_url && (
            <a
              href={nextSchedule.source_url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex text-sm text-neutral-600 underline hover:text-neutral-950"
            >
              公式の日程情報を見る
            </a>
          )}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-neutral-200/70 p-5">
          <div className="text-sm font-semibold text-neutral-950">
            合格基準
          </div>
          <p className="mt-3 text-sm leading-7 text-neutral-700">
            {textOrDash(qualification.passing_criteria_text)}
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200/70 p-5">
          <div className="text-sm font-semibold text-neutral-950">
            申込期間の目安
          </div>
          <p className="mt-3 text-sm leading-7 text-neutral-700">
            {textOrDash(qualification.application_period_summary)}
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200/70 p-5">
          <div className="text-sm font-semibold text-neutral-950">
            試験日程の目安
          </div>
          <p className="mt-3 text-sm leading-7 text-neutral-700">
            {textOrDash(qualification.exam_schedule_summary)}
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200/70 p-5">
          <div className="text-sm font-semibold text-neutral-950">受験地</div>
          <p className="mt-3 text-sm leading-7 text-neutral-700">
            {textOrDash(qualification.test_location_summary)}
          </p>
        </div>
      </div>

      {qualification.source_schedule_url && (
        <div className="mt-4">
          <a
            href={qualification.source_schedule_url}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-neutral-600 underline hover:text-neutral-950"
          >
            公式の試験情報を見る
          </a>
        </div>
      )}
    </section>
  )
}