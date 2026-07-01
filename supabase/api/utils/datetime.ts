export function dayOfWeekSun0(date: Date): number {
  return date.getDay()
}

export function overlapsRange(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  const aS = new Date(aStart).getTime()
  const aE = new Date(aEnd).getTime()
  const bS = new Date(bStart).getTime()
  const bE = new Date(bEnd).getTime()
  return aS < bE && aE > bS
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000)
}

export function timeOnDate(date: Date, hhmmss: string): Date | null {
  const parts = hhmmss.split(':').map((p) => Number.parseInt(p, 10))
  const [h, m, s] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0]
  if (!Number.isFinite(h) || !Number.isFinite(m) || !Number.isFinite(s))
    return null
  const d = new Date(date)
  d.setHours(h, m, s, 0)
  return d
}
