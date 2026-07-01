import {
  CALENDAR_DRAG_SNAP_MINUTES,
  clampCalendarMinutes,
  snapCalendarMinutes,
} from 'nucleify'

export function snapEventMinutes(
  minutes: number,
  dayStartHour: number,
  dayEndHour: number,
  step = CALENDAR_DRAG_SNAP_MINUTES
): number {
  return snapCalendarMinutes(
    clampCalendarMinutes(minutes, dayStartHour, dayEndHour),
    step
  )
}
