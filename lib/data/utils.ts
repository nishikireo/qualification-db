export function toBool(v: string) {
  return v === "TRUE" || v === "true" || v === "1"
}

export function toNum(v: string) {
  if (!v) return null

  const n = Number(v)
  return Number.isNaN(n) ? null : n
}