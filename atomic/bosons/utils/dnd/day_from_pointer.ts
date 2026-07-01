import { dayGridBodyFromPointer, parseLocalDateKey } from 'nucleify'

export function dayFromPointer(event: PointerEvent, fallback: Date): Date {
  const body = dayGridBodyFromPointer(event)
  const key = body?.dataset?.day
  if (!key) return fallback
  const parsed = parseLocalDateKey(key)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed
}
