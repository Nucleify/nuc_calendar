import type { CalendarDragSession } from 'nucleify'

let dragSession: CalendarDragSession | null = null

export function getDragSession(): CalendarDragSession | null {
  return dragSession
}

export function setDragSession(session: CalendarDragSession | null): void {
  dragSession = session
}

export function clearDragSession(): void {
  dragSession = null
}
