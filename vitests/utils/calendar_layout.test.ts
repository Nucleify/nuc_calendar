import { describe, expect, it } from 'vitest'

import {
  layoutDayEvents,
  monthDayEventLimit,
} from '../../atomic/bosons/utils/calendar_layout'
import { eventsForDay } from '../../atomic/bosons/utils/calendar_range'

describe('calendar_layout', () => {
  const day = new Date('2026-06-10T12:00:00')

  it('positions overlapping events in separate columns', () => {
    const blocks = layoutDayEvents(
      [
        {
          id: 1,
          title: 'A',
          starts_at: '2026-06-10T09:00:00.000Z',
          ends_at: '2026-06-10T10:00:00.000Z',
        },
        {
          id: 2,
          title: 'B',
          starts_at: '2026-06-10T09:30:00.000Z',
          ends_at: '2026-06-10T10:30:00.000Z',
        },
      ],
      day,
      7,
      20
    )

    expect(blocks).toHaveLength(2)
    expect(blocks[0]?.left).not.toBe(blocks[1]?.left)
  })

  it('limits month chips and reports hidden count', () => {
    const events = Array.from({ length: 5 }, (_, index) => ({
      id: index + 1,
      title: `Event ${index + 1}`,
      starts_at: '2026-06-10T10:00:00.000Z',
      ends_at: '2026-06-10T11:00:00.000Z',
    }))

    const filtered = eventsForDay(events, day)
    const { visible, hiddenCount } = monthDayEventLimit(filtered, 3)

    expect(visible).toHaveLength(3)
    expect(hiddenCount).toBe(2)
  })
})
