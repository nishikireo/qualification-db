export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return "-"
  return `${value}%`
}

export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "-"
  return value.toLocaleString()
}

export function formatYen(value: number | null | undefined) {
  if (value === null || value === undefined) return "-"
  return `${value.toLocaleString()}円`
}

export function formatHoursRange(
  min: number | null | undefined,
  max: number | null | undefined
) {
  if (min === null || min === undefined || max === null || max === undefined) {
    return "-"
  }

  return `${min}〜${max}時間`
}

export function formatSalaryRange(
  min: number | null | undefined,
  max: number | null | undefined
) {
  if (min === null || min === undefined || max === null || max === undefined) {
    return "-"
  }

  return `${min}〜${max}万円`
}

export function formatScore(value: number | null | undefined) {
  if (value === null || value === undefined) return "-"
  return `${value} / 100`
}

export function formatDateJa(value: string | null | undefined) {
  if (!value) return ""

  const date = new Date(`${value}T00:00:00+09:00`)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date)
}

export function formatDateRangeJa(
  start: string | null | undefined,
  end: string | null | undefined
) {
  if (!start && !end) return "-"
  if (start && end && start === end) return formatDateJa(start)
  if (start && end) return `${formatDateJa(start)}〜${formatDateJa(end)}`
  if (start) return `${formatDateJa(start)}〜`
  return `〜${formatDateJa(end)}`
}

export function textOrDash(value: string | null | undefined) {
  if (!value) return "-"
  return value
}

export function numberValue(
  value: number | null | undefined,
  fallback = -1
) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return fallback
  }

  return value
}