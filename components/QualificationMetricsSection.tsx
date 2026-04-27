import type { QualificationMetric } from "@/types/qualification"

type Props = {
  metrics: QualificationMetric[]
}

type ChartPoint = {
  label: string
  year: number
  passRate: number | null
  examineesCount: number | null
  passersCount: number | null
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "-"
  return value.toLocaleString()
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return "-"
  return `${value}%`
}

function formatYen(value: number | null | undefined) {
  if (value === null || value === undefined) return "-"
  return `${value.toLocaleString()}円`
}

function getMetricLabel(metric: QualificationMetric) {
  const parts = [
    metric.metric_period_label,
    metric.metric_subject && metric.metric_subject !== "overall"
      ? metric.metric_subject
      : "",
    metric.metric_exam_type && metric.metric_exam_type !== "paper"
      ? metric.metric_exam_type
      : "",
  ].filter(Boolean)

  return parts.join(" / ") || `${metric.metric_year ?? ""}`
}

function subjectLabel(value: string) {
  const map: Record<string, string> = {
    overall: "総合",
    theory: "学科",
    practical: "実技",
  }

  return map[value] ?? value
}

function examTypeLabel(value: string) {
  const map: Record<string, string> = {
    paper: "紙試験",
    cbt: "CBT",
    unified: "統一試験",
  }

  return map[value] ?? value
}

function getChartMetrics(metrics: QualificationMetric[]) {
  const published = metrics
    .filter((metric) => metric.pass_rate !== null)
    .filter((metric) => metric.metric_year !== null)

  const overall = published.filter((metric) => metric.metric_subject === "overall")
  const theory = published.filter((metric) => metric.metric_subject === "theory")
  const practical = published.filter((metric) => metric.metric_subject === "practical")

  const base =
    overall.length > 0
      ? overall
      : theory.length > 0
        ? theory
        : practical.length > 0
          ? practical
          : published

  return base
    .slice()
    .sort((a, b) => {
      const yearA = a.metric_year ?? 0
      const yearB = b.metric_year ?? 0
      if (yearA !== yearB) return yearA - yearB
      return getMetricLabel(a).localeCompare(getMetricLabel(b), "ja")
    })
    .map((metric) => ({
      label: metric.metric_period_label || `${metric.metric_year}`,
      year: metric.metric_year ?? 0,
      passRate: metric.pass_rate,
      examineesCount: metric.examinees_count,
      passersCount: metric.passers_count,
    }))
}

function getLatestMetric(metrics: QualificationMetric[]) {
  return metrics
    .slice()
    .sort((a, b) => {
      const yearA = a.metric_year ?? 0
      const yearB = b.metric_year ?? 0
      if (yearA !== yearB) return yearB - yearA
      return getMetricLabel(a).localeCompare(getMetricLabel(b), "ja")
    })[0]
}

function getAveragePassRate(metrics: QualificationMetric[]) {
  const values = metrics
    .map((metric) => metric.pass_rate)
    .filter((value): value is number => value !== null && value !== undefined)

  if (values.length === 0) return null

  const average = values.reduce((sum, value) => sum + value, 0) / values.length
  return Math.round(average * 10) / 10
}

function PassRateLineChart({ points }: { points: ChartPoint[] }) {
  const validPoints = points.filter((point) => point.passRate !== null)

  if (validPoints.length < 2) {
    return (
      <div className="rounded-lg border border-neutral-200/70 p-5 text-sm text-neutral-600">
        グラフ表示に必要なデータが不足しています。
      </div>
    )
  }

  const width = 720
  const height = 260
  const paddingX = 42
  const paddingY = 34

  const rates = validPoints.map((point) => point.passRate ?? 0)
  const minRate = Math.max(0, Math.floor(Math.min(...rates) / 5) * 5)
  const maxRate = Math.ceil(Math.max(...rates) / 5) * 5 || 100
  const range = maxRate - minRate || 1

  const getX = (index: number) => {
    if (validPoints.length === 1) return width / 2
    return (
      paddingX +
      (index / (validPoints.length - 1)) * (width - paddingX * 2)
    )
  }

  const getY = (value: number) => {
    return (
      height -
      paddingY -
      ((value - minRate) / range) * (height - paddingY * 2)
    )
  }

  const polylinePoints = validPoints
    .map((point, index) => `${getX(index)},${getY(point.passRate ?? 0)}`)
    .join(" ")

  const yTicks = [minRate, Math.round((minRate + maxRate) / 2), maxRate]

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto rounded-lg border border-neutral-200/70 p-3 md:p-4">
      <div className="w-[680px] max-w-none shrink-0">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="合格率推移グラフ"
          className="h-auto w-full"
        >
          {yTicks.map((tick) => {
            const y = getY(tick)

            return (
              <g key={tick}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#e5e5e5"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-neutral-500 text-[11px]"
                >
                  {tick}%
                </text>
              </g>
            )
          })}

          <polyline
            points={polylinePoints}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-neutral-950"
          />

          {validPoints.map((point, index) => {
            const x = getX(index)
            const y = getY(point.passRate ?? 0)

            return (
              <g key={`${point.label}-${index}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  className="fill-white stroke-neutral-950"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  className="fill-neutral-700 text-[11px]"
                >
                  {point.passRate}%
                </text>
                <text
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-neutral-500 text-[10px]"
                >
                  {point.year}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

function ExamineesBarChart({ points }: { points: ChartPoint[] }) {
  const validPoints = points.filter((point) => point.examineesCount !== null)

  if (validPoints.length < 2) {
    return (
      <div className="rounded-lg border border-neutral-200/70 p-5 text-sm text-neutral-600">
        受験者数グラフに必要なデータが不足しています。
      </div>
    )
  }

  const width = 720
  const height = 260
  const paddingX = 42
  const paddingY = 34
  const maxValue = Math.max(
    ...validPoints.map((point) => point.examineesCount ?? 0)
  )

  const barAreaWidth = width - paddingX * 2
  const barWidth = Math.max(18, Math.min(42, barAreaWidth / validPoints.length - 12))

  const getX = (index: number) => {
    const step = barAreaWidth / validPoints.length
    return paddingX + step * index + step / 2 - barWidth / 2
  }

  const getBarHeight = (value: number) => {
    if (!maxValue) return 0
    return (value / maxValue) * (height - paddingY * 2)
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto rounded-lg border border-neutral-200/70 p-3 md:p-4">
      <div className="w-[680px] max-w-none shrink-0">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="受験者数推移グラフ"
          className="h-auto w-full"
        >
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#e5e5e5"
            strokeWidth="1"
          />

          {validPoints.map((point, index) => {
            const value = point.examineesCount ?? 0
            const barHeight = getBarHeight(value)
            const x = getX(index)
            const y = height - paddingY - barHeight

            return (
              <g key={`${point.label}-${index}`}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="2"
                  className="fill-neutral-900"
                />
                <text
                  x={x + barWidth / 2}
                  y={Math.max(14, y - 8)}
                  textAnchor="middle"
                  className="fill-neutral-600 text-[10px]"
                >
                  {formatNumber(value)}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-neutral-500 text-[10px]"
                >
                  {point.year}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

export default function QualificationMetricsSection({ metrics }: Props) {
  if (metrics.length === 0) {
    return (
      <section className="border-t border-neutral-200/70 py-8">
        <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
          年度別データ
        </h2>

        <div className="rounded-lg border border-neutral-200/70 p-6 text-sm text-neutral-600">
          年度別データは準備中です。
        </div>
      </section>
    )
  }

  const latestMetric = getLatestMetric(metrics)
  const averagePassRate = getAveragePassRate(metrics)
  const chartPoints = getChartMetrics(metrics)

  const sortedMetrics = metrics
    .slice()
    .sort((a, b) => {
      const yearA = a.metric_year ?? 0
      const yearB = b.metric_year ?? 0
      if (yearA !== yearB) return yearB - yearA
      return getMetricLabel(a).localeCompare(getMetricLabel(b), "ja")
    })
  const visibleMobileMetrics = sortedMetrics.slice(0, 5)
  const hiddenMobileMetrics = sortedMetrics.slice(5)

  return (
    <section className="border-t border-neutral-200/70 py-8">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
            年度別データ
          </h2>
          <p className="mt-2 text-sm leading-7 text-neutral-600">
            合格率、受験者数、合格者数の推移を確認できます。
          </p>
        </div>

        <p className="text-xs text-neutral-500">
          表示は公開データに基づく年度・試験回別の情報です。
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-neutral-200/70 p-4">
          <div className="text-[11px] text-neutral-500">最新合格率</div>
          <div className="mt-1 text-2xl font-semibold text-neutral-950">
            {formatPercent(latestMetric?.pass_rate)}
          </div>
          <div className="mt-2 text-xs leading-5 text-neutral-500">
            {latestMetric ? getMetricLabel(latestMetric) : "-"}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200/70 p-4">
          <div className="text-[11px] text-neutral-500">最新受験者数</div>
          <div className="mt-1 text-2xl font-semibold text-neutral-950">
            {formatNumber(latestMetric?.examinees_count)}
          </div>
          <div className="mt-2 text-xs text-neutral-500">人</div>
        </div>

        <div className="rounded-lg border border-neutral-200/70 p-4">
          <div className="text-[11px] text-neutral-500">最新合格者数</div>
          <div className="mt-1 text-2xl font-semibold text-neutral-950">
            {formatNumber(latestMetric?.passers_count)}
          </div>
          <div className="mt-2 text-xs text-neutral-500">人</div>
        </div>

        <div className="rounded-lg border border-neutral-200/70 p-4">
          <div className="text-[11px] text-neutral-500">平均合格率</div>
          <div className="mt-1 text-2xl font-semibold text-neutral-950">
            {formatPercent(averagePassRate)}
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            公開データ {metrics.length}件
          </div>
        </div>
      </div>

      <div className="mt-6 grid min-w-0 gap-5 lg:grid-cols-2">
        <div className="min-w-0">
          <h3 className="mb-3 text-sm font-semibold text-neutral-950">
            合格率推移
          </h3>
          <PassRateLineChart points={chartPoints} />
        </div>

        <div className="min-w-0">
          <h3 className="mb-3 text-sm font-semibold text-neutral-950">
            受験者数推移
          </h3>
          <ExamineesBarChart points={chartPoints} />
        </div>
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-sm font-semibold text-neutral-950">
          年度別データ表
        </h3>

        <div className="hidden overflow-x-auto rounded-lg border border-neutral-200/70 md:block">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-200/70 bg-neutral-50">
                <th className="px-4 py-3 text-left font-medium text-neutral-600">
                  年度
                </th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">
                  試験回
                </th>
                <th className="px-4 py-3 text-right font-medium text-neutral-600">
                  合格率
                </th>
                <th className="px-4 py-3 text-right font-medium text-neutral-600">
                  受験者数
                </th>
                <th className="px-4 py-3 text-right font-medium text-neutral-600">
                  合格者数
                </th>
                <th className="px-4 py-3 text-right font-medium text-neutral-600">
                  申込者数
                </th>
                <th className="px-4 py-3 text-right font-medium text-neutral-600">
                  受験料
                </th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">
                  詳細
                </th>
              </tr>
            </thead>

            <tbody>
              {sortedMetrics.map((metric, index) => (
                <tr
                  key={`${metric.metric_year}-${metric.metric_period_label}-${metric.metric_subject}-${index}`}
                  className="border-b border-neutral-200/70 last:border-b-0"
                >
                  <td className="px-4 py-3 text-neutral-900">
                    {metric.metric_year ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-neutral-900">
                    {metric.metric_period_label || "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-neutral-950">
                    {formatPercent(metric.pass_rate)}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-900">
                    {formatNumber(metric.examinees_count)}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-900">
                    {formatNumber(metric.passers_count)}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-900">
                    {formatNumber(metric.applicants_count)}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-900">
                    {formatYen(metric.exam_fee_tax_included)}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    <details>
                      <summary className="cursor-pointer text-sm text-neutral-600 hover:text-neutral-950">
                        詳細を見る
                      </summary>

                      <div className="mt-3 space-y-2 text-xs leading-6 text-neutral-600">
                        <div>試験方式: {examTypeLabel(metric.metric_exam_type)}</div>
                        <div>科目: {subjectLabel(metric.metric_subject)}</div>
                        <div>確認日: {metric.checked_at || "-"}</div>
                        {metric.notes && <div>備考: {metric.notes}</div>}

                        <div className="flex flex-wrap gap-3 pt-1">
                          {metric.source_result_url && (
                            <a
                              href={metric.source_result_url}
                              target="_blank"
                              rel="noreferrer"
                              className="underline hover:text-neutral-950"
                            >
                              試験結果
                            </a>
                          )}

                          {metric.source_fee_url && (
                            <a
                              href={metric.source_fee_url}
                              target="_blank"
                              rel="noreferrer"
                              className="underline hover:text-neutral-950"
                            >
                              受験料
                            </a>
                          )}
                        </div>
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 md:hidden">
          {visibleMobileMetrics.map((metric, index) => (
            <article
              key={`${metric.metric_year}-${metric.metric_period_label}-${metric.metric_subject}-${index}`}
              className="rounded-lg border border-neutral-200/70 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-neutral-500">
                    {metric.metric_year ?? "-"}
                  </div>
                  <h4 className="mt-1 text-sm font-semibold leading-6 text-neutral-950">
                    {metric.metric_period_label || "年度別データ"}
                  </h4>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-neutral-500">合格率</div>
                  <div className="text-2xl font-semibold text-neutral-950">
                    {formatPercent(metric.pass_rate)}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md bg-neutral-50 p-3">
                  <div className="text-[11px] text-neutral-500">受験者数</div>
                  <div className="mt-1 font-semibold text-neutral-950">
                    {formatNumber(metric.examinees_count)}
                  </div>
                </div>

                <div className="rounded-md bg-neutral-50 p-3">
                  <div className="text-[11px] text-neutral-500">合格者数</div>
                  <div className="mt-1 font-semibold text-neutral-950">
                    {formatNumber(metric.passers_count)}
                  </div>
                </div>

                <div className="rounded-md bg-neutral-50 p-3">
                  <div className="text-[11px] text-neutral-500">申込者数</div>
                  <div className="mt-1 font-semibold text-neutral-950">
                    {formatNumber(metric.applicants_count)}
                  </div>
                </div>

                <div className="rounded-md bg-neutral-50 p-3">
                  <div className="text-[11px] text-neutral-500">受験料</div>
                  <div className="mt-1 font-semibold text-neutral-950">
                    {formatYen(metric.exam_fee_tax_included)}
                  </div>
                </div>
              </div>

              <details className="mt-3 rounded-md bg-neutral-50 p-3">
                <summary className="cursor-pointer text-sm text-neutral-600">
                  詳細を見る
                </summary>

                <div className="mt-3 space-y-2 text-xs leading-6 text-neutral-600">
                  <div>試験方式: {examTypeLabel(metric.metric_exam_type)}</div>
                  <div>科目: {subjectLabel(metric.metric_subject)}</div>
                  <div>確認日: {metric.checked_at || "-"}</div>
                  {metric.notes && <div>備考: {metric.notes}</div>}

                  <div className="flex flex-wrap gap-3 pt-1">
                    {metric.source_result_url && (
                      <a
                        href={metric.source_result_url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-neutral-950"
                      >
                        試験結果
                      </a>
                    )}

                    {metric.source_fee_url && (
                      <a
                        href={metric.source_fee_url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-neutral-950"
                      >
                        受験料
                      </a>
                    )}
                  </div>
                </div>
              </details>
            </article>
          ))}
          {hiddenMobileMetrics.length > 0 && (
            <details className="rounded-lg border border-neutral-200/70 p-4">
              <summary className="cursor-pointer text-sm font-medium text-neutral-700">
                過去データをすべて見る（{hiddenMobileMetrics.length}件）
              </summary>

              <div className="mt-4 grid gap-3">
                {hiddenMobileMetrics.map((metric, index) => (
                  <article
                    key={`${metric.metric_year}-${metric.metric_period_label}-${metric.metric_subject}-hidden-${index}`}
                    className="rounded-lg border border-neutral-200/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-neutral-500">
                          {metric.metric_year ?? "-"}
                        </div>
                        <h4 className="mt-1 text-sm font-semibold leading-6 text-neutral-950">
                          {metric.metric_period_label || "年度別データ"}
                        </h4>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] text-neutral-500">合格率</div>
                        <div className="text-2xl font-semibold text-neutral-950">
                          {formatPercent(metric.pass_rate)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-md bg-neutral-50 p-3">
                        <div className="text-[11px] text-neutral-500">受験者数</div>
                        <div className="mt-1 font-semibold text-neutral-950">
                          {formatNumber(metric.examinees_count)}
                        </div>
                      </div>

                      <div className="rounded-md bg-neutral-50 p-3">
                        <div className="text-[11px] text-neutral-500">合格者数</div>
                        <div className="mt-1 font-semibold text-neutral-950">
                          {formatNumber(metric.passers_count)}
                        </div>
                      </div>
                    </div>

                    <details className="mt-3 rounded-md bg-neutral-50 p-3">
                      <summary className="cursor-pointer text-sm text-neutral-600">
                        詳細を見る
                      </summary>

                      <div className="mt-3 space-y-2 text-xs leading-6 text-neutral-600">
                        <div>申込者数: {formatNumber(metric.applicants_count)}</div>
                        <div>受験料: {formatYen(metric.exam_fee_tax_included)}</div>
                        <div>試験方式: {examTypeLabel(metric.metric_exam_type)}</div>
                        <div>科目: {subjectLabel(metric.metric_subject)}</div>
                        <div>確認日: {metric.checked_at || "-"}</div>
                        {metric.notes && <div>備考: {metric.notes}</div>}

                        <div className="flex flex-wrap gap-3 pt-1">
                          {metric.source_result_url && (
                            <a
                              href={metric.source_result_url}
                              target="_blank"
                              rel="noreferrer"
                              className="underline hover:text-neutral-950"
                            >
                              試験結果
                            </a>
                          )}

                          {metric.source_fee_url && (
                            <a
                              href={metric.source_fee_url}
                              target="_blank"
                              rel="noreferrer"
                              className="underline hover:text-neutral-950"
                            >
                              受験料
                            </a>
                          )}
                        </div>
                      </div>
                    </details>
                  </article>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </section>
  )
}