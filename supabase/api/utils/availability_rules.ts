import type { Json } from 'nuc_server'

import type { CalendarAvailabilityRuleRow } from './availability_slots'
import { trimString } from '../calendar_helpers'

export type ParsedAvailabilityRule = Omit<
  CalendarAvailabilityRuleRow,
  'id' | 'created_at'
>

export function parseAvailabilityPutBody(
  raw: Json | null,
  userId: string
):
  | { calendar_id: number; rules: ParsedAvailabilityRule[] }
  | { error: string } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    return { error: 'Invalid body' }

  const record = raw as Record<string, unknown>
  const calendarId = Number(record.calendar_id)
  if (!calendarId || Number.isNaN(calendarId))
    return { error: 'calendar_id is required' }

  const rules = Array.isArray(record.rules) ? record.rules : null
  if (!rules) return { error: 'rules[] is required' }

  const mapped = rules
    .map((rule): ParsedAvailabilityRule | null => {
      if (!rule || typeof rule !== 'object' || Array.isArray(rule)) return null
      const r = rule as Record<string, unknown>
      const day_of_week = Number(r.day_of_week)
      const start_time = trimString(r.start_time)
      const end_time = trimString(r.end_time)
      const effective_from = trimString(r.effective_from) || null
      const effective_until = trimString(r.effective_until) || null
      if (!Number.isFinite(day_of_week) || day_of_week < 0 || day_of_week > 6)
        return null
      if (!start_time || !end_time) return null
      return {
        user_id: userId,
        calendar_id: calendarId,
        day_of_week,
        start_time,
        end_time,
        effective_from,
        effective_until,
      }
    })
    .filter(Boolean) as ParsedAvailabilityRule[]

  return { calendar_id: calendarId, rules: mapped }
}
