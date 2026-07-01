import {
  addMinutes,
  dayOfWeekSun0,
  overlapsRange,
  timeOnDate,
} from './datetime'

export type CalendarAvailabilityRuleRow = {
  id: number
  user_id: string
  calendar_id: number
  day_of_week: number
  start_time: string
  end_time: string
  effective_from: string | null
  effective_until: string | null
  created_at: string
}

export type CalendarAvailableSlot = { starts_at: string; ends_at: string }

export function computeDaySlots(
  date: Date,
  durationMinutes: number,
  stepMinutes: number,
  rules: CalendarAvailabilityRuleRow[],
  events: Array<{ starts_at: string; ends_at: string }>
): CalendarAvailableSlot[] {
  const targetDow = dayOfWeekSun0(date)
  const iso = date.toISOString().slice(0, 10)
  const dayRules = rules.filter((rule) => {
    if (Number(rule.day_of_week) !== targetDow) return false
    if (rule.effective_from && iso < rule.effective_from) return false
    if (rule.effective_until && iso > rule.effective_until) return false
    return true
  })

  const slots: CalendarAvailableSlot[] = []
  if (durationMinutes <= 0 || stepMinutes <= 0) return slots

  for (const rule of dayRules) {
    const start = timeOnDate(date, rule.start_time)
    const end = timeOnDate(date, rule.end_time)
    if (!start || !end) continue
    if (end <= start) continue

    for (
      let cursor = new Date(start);
      addMinutes(cursor, durationMinutes) <= end;
      cursor = addMinutes(cursor, stepMinutes)
    ) {
      const candidateStart = cursor.toISOString()
      const candidateEnd = addMinutes(cursor, durationMinutes).toISOString()
      const conflicts = events.some((event) =>
        overlapsRange(
          candidateStart,
          candidateEnd,
          event.starts_at,
          event.ends_at
        )
      )
      if (!conflicts)
        slots.push({ starts_at: candidateStart, ends_at: candidateEnd })
    }
  }

  return slots
}
