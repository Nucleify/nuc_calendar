export interface CalendarEventLike {
  id: number | string
  starts_at: string
  ends_at: string
  title: string
  color?: string | null
  source?: string
}

export interface CalendarLayoutBlock {
  eventId: number | string
  top: number
  height: number
  left: number
  width: number
  column: number
  event: CalendarEventLike
}

const MIN_BLOCK_HEIGHT_PERCENT = 3

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value))
}

function overlaps(a: CalendarEventLike, b: CalendarEventLike): boolean {
  const aStart = new Date(a.starts_at).getTime()
  const aEnd = new Date(a.ends_at).getTime()
  const bStart = new Date(b.starts_at).getTime()
  const bEnd = new Date(b.ends_at).getTime()
  return aStart < bEnd && aEnd > bStart
}

export function layoutDayEvents(
  events: CalendarEventLike[],
  day: Date,
  dayStartHour: number,
  dayEndHour: number
): CalendarLayoutBlock[] {
  const dayStart = new Date(day)
  dayStart.setHours(dayStartHour, 0, 0, 0)
  const dayEnd = new Date(day)
  dayEnd.setHours(dayEndHour, 0, 0, 0)
  const totalMs = Math.max(dayEnd.getTime() - dayStart.getTime(), 1)

  const sorted = [...events].sort(
    (left, right) =>
      new Date(left.starts_at).getTime() - new Date(right.starts_at).getTime()
  )

  const columns: CalendarEventLike[][] = []

  for (const event of sorted) {
    let placed = false
    for (const column of columns) {
      const last = column[column.length - 1]
      if (last && !overlaps(last, event)) {
        column.push(event)
        placed = true
        break
      }
    }
    if (!placed) columns.push([event])
  }

  const clusterMaxColumns = new Map<CalendarEventLike, number>()

  for (const event of sorted) {
    const overlapping = sorted.filter((candidate) => overlaps(candidate, event))
    clusterMaxColumns.set(
      event,
      Math.max(
        1,
        ...overlapping.map((candidate) => {
          const columnIndex = columns.findIndex((column) =>
            column.includes(candidate)
          )
          return columnIndex >= 0 ? columnIndex + 1 : 1
        })
      )
    )
  }

  const blocks: CalendarLayoutBlock[] = []

  for (let columnIndex = 0; columnIndex < columns.length; columnIndex += 1) {
    for (const event of columns[columnIndex] ?? []) {
      const eventStart = Math.max(
        new Date(event.starts_at).getTime(),
        dayStart.getTime()
      )
      const eventEnd = Math.min(
        new Date(event.ends_at).getTime(),
        dayEnd.getTime()
      )
      const top = clampPercent(
        ((eventStart - dayStart.getTime()) / totalMs) * 100
      )
      const height = clampPercent(
        Math.max(
          ((eventEnd - eventStart) / totalMs) * 100,
          MIN_BLOCK_HEIGHT_PERCENT
        )
      )
      const maxColumns = clusterMaxColumns.get(event) ?? columns.length
      const width = clampPercent(100 / maxColumns)
      const left = clampPercent(columnIndex * width)

      blocks.push({
        eventId: event.id,
        top,
        height,
        left,
        width,
        column: columnIndex,
        event,
      })
    }
  }

  return blocks
}

export function monthDayEventLimit<T extends CalendarEventLike>(
  events: T[],
  limit = 3
): { visible: T[]; hiddenCount: number } {
  const visible = events.slice(0, limit)
  const hiddenCount = Math.max(events.length - visible.length, 0)
  return { visible, hiddenCount }
}
