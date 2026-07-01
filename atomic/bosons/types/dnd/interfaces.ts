export type CalendarFloatingGhost = {
  x: number
  y: number
  width: number
  height: number
  title: string
  time: string
  color?: string | null
}

export type CalendarDragGhostBase = {
  title: string
  color?: string | null
  left: number
  width: number
}

export type CalendarDragSession = {
  mode: 'move' | 'resize'
  eventId: number
  durationMs: number
  grabOffsetMinutes: number
  initialStartsAt: string
  initialEndsAt: string
  originDayKey: string
  ghostBase: CalendarDragGhostBase
  targetDayKey: string
  targetStartsAt: string
  targetEndsAt: string
  floatingGhost: CalendarFloatingGhost
}

export type CalendarDragPointerState = {
  mode: 'move' | 'resize'
  id: number
  durationMs: number
  grabOffsetMinutes: number
  initialStartsAt: string
  initialEndsAt: string
  originDayKey: string
  grabOffsetX: number
  grabOffsetY: number
  blockWidthPx: number
  blockHeightPx: number
  blockOriginX: number
  blockOriginY: number
  ghostBase: CalendarDragGhostBase
}

export type BuildFloatingGhostOptions = {
  body?: HTMLElement | null
  targetStartsAt?: string
  targetEndsAt?: string
  targetDay?: Date
  dayStartHour?: number
  dayEndHour?: number
  hourHeight?: number
}
