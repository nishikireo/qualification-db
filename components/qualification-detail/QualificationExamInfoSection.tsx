import {
  formatDateJa,
  formatDateRangeJa,
  formatSalaryRange,
  formatYen,
  textOrDash,
} from "@/lib/format"
import type {
  Qualification,
  QualificationExamSchedule,
} from "@/types/qualification"

type Props = {
  qualification: Qualification
  schedules: QualificationExamSchedule[]
}

export default function QualificationExamInfoSection({
  qualification,
  schedules,
}: Props) {
  const nextSchedule = schedules[0]

  const hasExamInfo = Boolean(
    qualification.name_ja ||
      qualification.issuing_body ||
      qualification.qualification_type ||
      qualification.exam_frequency_text ||
      qualification.eligibility_text ||
      qualification.exam_format_text ||
      qualification.exam_fee_tax_included != null ||
      qualification.passing_criteria_text ||
      qualification.application_period_summary ||
      qualification.exam_schedule_summary ||
      qualification.test_location_summary
  )

  if (!hasExamInfo && schedules.length === 0) return null

  return (
    <section className="border-t border-neutral-200/70 py-8">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
          試験概要
        </h2>
        <p className="mt-2 text-sm leading-7 text-neutral-600">
          受験資格、試験形式、合格基準、日程、受験料、主催団体をまとめています。
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
                {nextSchedule.exam_period_label || nextSchedule.exam_year || "-"}
              </div>
            </div>

            <div className="rounded-md bg-neutral-50 p-3">
              <div className="text-[11px] text-neutral-500">申込期間</div>
              <div className="mt-1 text-sm font-semibold leading-6 text-neutral-950">
                {formatDateRangeJa(
                  nextSchedule.application_start_date,
                  nextSchedule.application_end_date
                )}
              </div>
            </div>

            <div className="rounded-md bg-neutral-50 p-3">
              <div className="text-[11px] text-neutral-500">試験日程</div>
              <div className="mt-1 text-sm font-semibold leading-6 text-neutral-950">
                {formatDateRangeJa(
                  nextSchedule.exam_start_date,
                  nextSchedule.exam_end_date
                )}
              </div>
            </div>

            <div className="rounded-md bg-neutral-50 p-3">
              <div className="text-[11px] text-neutral-500">合格発表</div>
              <div className="mt-1 text-sm font-semibold leading-6 text-neutral-950">
                {nextSchedule.result_date
                  ? formatDateJa(nextSchedule.result_date)
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
                  ? formatDateJa(nextSchedule.checked_at)
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

      <div className="mb-5 overflow-x-auto rounded-lg border border-neutral-200/70">
        <table className="w-full border-collapse text-sm">
          <tbody>
            <tr className="border-b border-neutral-200/70">
              <th className="w-40 bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                正式名称
              </th>
              <td className="px-4 py-3 text-neutral-900">{qualification.name_ja}</td>
            </tr>

            <tr className="border-b border-neutral-200/70">
              <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                主催
              </th>
              <td className="px-4 py-3 text-neutral-900">{qualification.issuing_body}</td>
            </tr>

            <tr className="border-b border-neutral-200/70">
              <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                種別
              </th>
              <td className="px-4 py-3 text-neutral-900">{qualification.qualification_type}</td>
            </tr>

            <tr className="border-b border-neutral-200/70">
              <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                試験回数
              </th>
              <td className="px-4 py-3 text-neutral-900">{qualification.exam_frequency_text}</td>
            </tr>

            <tr className="border-b border-neutral-200/70">
              <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                受験資格
              </th>
              <td className="px-4 py-3 text-neutral-900">{qualification.eligibility_text}</td>
            </tr>

            <tr className="border-b border-neutral-200/70">
              <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                試験形式
              </th>
              <td className="px-4 py-3 text-neutral-900">{qualification.exam_format_text}</td>
            </tr>

            <tr className="border-b border-neutral-200/70">
              <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                受験料
              </th>
              <td className="px-4 py-3 text-neutral-900">
                {formatYen(qualification.exam_fee_tax_included)}
              </td>
            </tr>

            <tr>
              <th className="bg-neutral-50 px-4 py-3 text-left font-medium text-neutral-600">
                平均年収
              </th>
              <td className="px-4 py-3 text-neutral-900">
                {formatSalaryRange(
                  qualification.average_salary_min,
                  qualification.average_salary_max
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-neutral-200/70 p-5">
          <div className="text-sm font-semibold text-neutral-950">合格基準</div>
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

      {(qualification.official_site_url ||
        qualification.official_exam_guide_url ||
        qualification.source_schedule_url ||
        qualification.source_eligibility_url ||
        qualification.source_fee_url ||
        qualification.source_average_salary_url) && (
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {qualification.official_site_url && (
            <a
              href={qualification.official_site_url}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-600 underline hover:text-neutral-950"
            >
              公式サイト
            </a>
          )}
          {qualification.official_exam_guide_url && (
            <a
              href={qualification.official_exam_guide_url}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-600 underline hover:text-neutral-950"
            >
              公式の試験案内
            </a>
          )}
          {qualification.source_schedule_url && (
            <a
              href={qualification.source_schedule_url}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-600 underline hover:text-neutral-950"
            >
              日程の出典
            </a>
          )}
          {qualification.source_eligibility_url && (
            <a
              href={qualification.source_eligibility_url}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-600 underline hover:text-neutral-950"
            >
              受験資格の出典
            </a>
          )}
          {qualification.source_fee_url && (
            <a
              href={qualification.source_fee_url}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-600 underline hover:text-neutral-950"
            >
              受験料の出典
            </a>
          )}
          {qualification.source_average_salary_url && (
            <a
              href={qualification.source_average_salary_url}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-600 underline hover:text-neutral-950"
            >
              年収情報の出典
            </a>
          )}
        </div>
      )}
    </section>
  )
}
