import { trimString } from '../calendar_helpers'

export function isoDate(value: unknown): string {
  const raw = trimString(value)
  if (!raw) return ''
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export function parseIntParam(value: unknown, fallback: number): number {
  const raw = trimString(value)
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) ? n : fallback
}
