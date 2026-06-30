'use client'

import React, { useMemo } from 'react'

import {
  eventsForDay,
  formatDayNumber,
  formatWeekdayLabel,
  isSameMonth,
  isToday,
  monthDayEventLimit,
  monthGridDays,
  NucCalendarEventBlock,
  type NucCalendarEventObjectInterface,
  weekDays,
} from 'nucleify'

import './_index.scss'

interface NucCalendarMonthGridProps {
  anchor: Date
  events: NucCalendarEventObjectInterface[]
  weekStartsOn?: number
  onDayClick?: (day: Date) => void
  onEventSelect?: (event: NucCalendarEventObjectInterface) => void
}

export const NucCalendarMonthGrid: React.FC<NucCalendarMonthGridProps> = ({
  anchor,
  events,
  weekStartsOn = 1,
  onDayClick,
  onEventSelect,
}) => {
  const days = useMemo(
    () => monthGridDays(anchor, weekStartsOn),
    [anchor, weekStartsOn]
  )

  const weekdayLabels = useMemo(() => {
    const start = weekDays(anchor, weekStartsOn)[0] ?? anchor
    return weekDays(start, weekStartsOn).map((day) =>
      formatWeekdayLabel(day, 'en', 'short')
    )
  }, [anchor, weekStartsOn])

  const monthEvents = (day: Date) =>
    monthDayEventLimit(eventsForDay(events, day))

  return (
    <div className="calendar-month-grid">
      <div className="calendar-month-grid-weekdays">
        {weekdayLabels.map((weekday) => (
          <div key={weekday} className="calendar-month-grid-weekday">
            {weekday}
          </div>
        ))}
      </div>
      <div className="calendar-month-grid-cells">
        {days.map((day) => {
          const { visible, hiddenCount } = monthEvents(day)
          return (
            <div
              key={day.toISOString()}
              className={`calendar-month-grid-cell${!isSameMonth(day, anchor) ? ' calendar-month-grid-cell-outside' : ''}${isToday(day) ? ' calendar-month-grid-cell-today' : ''}`}
              onClick={() => onDayClick?.(day)}
            >
              <p className="calendar-month-grid-day-number">
                {formatDayNumber(day)}
              </p>
              {visible.map((event) => (
                <NucCalendarEventBlock
                  key={event.id}
                  variant="month"
                  event={event}
                  showTime={false}
                  onSelect={onEventSelect}
                />
              ))}
              {hiddenCount > 0 ? (
                <p className="calendar-month-grid-more">+{hiddenCount} more</p>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
