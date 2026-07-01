export function minutesFromPointerInBody(
  event: PointerEvent,
  bodyEl: HTMLElement,
  hourHeight: number
): number {
  const rect = bodyEl.getBoundingClientRect()
  const y = event.clientY - rect.top
  return (y / hourHeight) * 60
}
