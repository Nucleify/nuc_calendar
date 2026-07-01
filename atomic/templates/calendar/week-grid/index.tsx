'use client'

import React, { useEffect, useMemo, useRef } from 'react'

import {
  CALENDAR_HOUR_HEIGHT,
  calendarScrollTopForNow,
  formatDayNumber,
  formatWeekdayLabel,
  isToday,
  NucCalendarDayGrid,
  type NucCalendarEventObjectInterface,
  weekDays,
} from 'nucleify'

import './_index.scss'

interface NucCalendarWeekGridProps {
  anchor: Date
  events: NucCalendarEventObjectInterface[]
  dayStartHour: number
  dayEndHour: number
  weekStartsOn?: number
  onSlotClick?: (day: Date, hour: number) => void
  onEventSelect?: (event: NucCalendarEventObjectInterface) => void
  onEventMove?: (payload: {
    id: number
    starts_at: string
    ends_at: string
  }) => void
  onEventResize?: (payload: {
    id: number
    starts_at: string
    ends_at: string
  }) => void
}

export const NucCalendarWeekGrid: React.FC<NucCalendarWeekGridProps> = ({
  anchor,
  events,
  dayStartHour,
  dayEndHour,
  weekStartsOn = 1,
  onSlotClick,
  onEventSelect,
  onEventMove,
  onEventResize,
}) => {
  const bodyRef = useRef<HTMLDivElement>(null)

  const days = useMemo(
    () => weekDays(anchor, weekStartsOn),
    [anchor, weekStartsOn]
  )

  const showsToday = useMemo(() => days.some((day) => isToday(day)), [days])

  useEffect(() => {
    if (!showsToday) return
    const scrollEl = bodyRef.current
    if (!scrollEl) return
    scrollEl.scrollTop = calendarScrollTopForNow(
      scrollEl,
      dayStartHour,
      dayEndHour,
      CALENDAR_HOUR_HEIGHT
    )
  }, [anchor, dayEndHour, dayStartHour, showsToday])

  return (
    <div className="calendar-week-grid">
      <div className="calendar-week-grid-header">
        <div className="calendar-week-grid-header-spacer" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="calendar-week-grid-day-header"
          >
            <p className="calendar-week-grid-weekday">
              {formatWeekdayLabel(day)}
            </p>
            <p
              className={`calendar-week-grid-day-number${isToday(day) ? ' calendar-week-grid-day-number-today' : ''}`}
            >
              {formatDayNumber(day)}
            </p>
          </div>
        ))}
      </div>
      <div ref={bodyRef} className="calendar-week-grid-body">
        <div className="calendar-week-grid-hours-column">
          <NucCalendarDayGrid
            day={days[0] ?? anchor}
            events={[]}
            dayStartHour={dayStartHour}
            dayEndHour={dayEndHour}
            showHours
            scrollable={false}
          />
        </div>
        {days.map((day) => (
          <div
            key={`col-${day.toISOString()}`}
            className="calendar-week-grid-day-column"
          >
            <NucCalendarDayGrid
              day={day}
              events={events}
              dayStartHour={dayStartHour}
              dayEndHour={dayEndHour}
              showHours={false}
              scrollable={false}
              onSlotClick={onSlotClick}
              onEventSelect={onEventSelect}
              onEventMove={onEventMove}
              onEventResize={onEventResize}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
