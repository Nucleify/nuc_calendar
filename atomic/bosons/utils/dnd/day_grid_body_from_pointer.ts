export function dayGridBodyFromPointer(
  event: PointerEvent
): HTMLElement | null {
  const el = document.elementFromPoint(event.clientX, event.clientY)
  return el?.closest?.('.calendar-day-grid-body') as HTMLElement | null
}
