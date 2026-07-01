import {
  CALENDAR_EVENT_DURATION_MINUTES,
  CalendarEventDurationMinutes,
} from 'nucleify'

type TranslateFn = (key: string) => string

export function useCalendarEventDurationOptions(translate: TranslateFn): {
  label: string
  value: CalendarEventDurationMinutes
}[] {
  return CALENDAR_EVENT_DURATION_MINUTES.map((minutes) => ({
    label: translate(`calendar-duration-${minutes}`),
    value: minutes,
  }))
}
