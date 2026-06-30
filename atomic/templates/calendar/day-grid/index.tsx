'use client'

import React, { useEffect, useMemo, useRef } from 'react'

import {
  bookableHours,
  CALENDAR_HOUR_HEIGHT,
  calendarGridHeightPx,
  calendarScrollTopForNow,
  eventsForDay,
  formatHourLabel,
  hourLabelStyle,
  hourOffsetPercent,
  hourSlotStyle,
  hoursInRange,
  isToday,
  layoutDayEvents,
  NucCalendarEventBlock,
  type NucCalendarEventObjectInterface,
} from 'nucleify'

import './_index.scss'

interface NucCalendarDayGridProps {
  day: Date
  events: NucCalendarEventObjectInterface[]
  dayStartHour: number
  dayEndHour: number
  hourHeight?: number
  showHours?: boolean
  scrollable?: boolean
  onSlotClick?: (day: Date, hour: number) => void
  onEventSelect?: (event: NucCalendarEventObjectInterface) => void
}

export const NucCalendarDayGrid: React.FC<NucCalendarDayGridProps> = ({
  day,
  events,
  dayStartHour,
  dayEndHour,
  hourHeight = CALENDAR_HOUR_HEIGHT,
  showHours = true,
  scrollable = true,
  onSlotClick,
  onEventSelect,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const hours = useMemo(
    () => hoursInRange(dayStartHour, dayEndHour),
    [dayEndHour, dayStartHour]
  )

  const slotHours = useMemo(
    () => bookableHours(dayStartHour, dayEndHour),
    [dayEndHour, dayStartHour]
  )

  const gridHeight = useMemo(
    () => calendarGridHeightPx(dayStartHour, dayEndHour, hourHeight),
    [dayEndHour, dayStartHour, hourHeight]
  )

  const dayEvents = useMemo(() => eventsForDay(events, day), [day, events])

  const layoutBlocks = useMemo(
    () => layoutDayEvents(dayEvents, day, dayStartHour, dayEndHour),
    [day, dayEndHour, dayEvents, dayStartHour]
  )

  const nowLineTop = useMemo(() => {
    if (!isToday(day)) return null
    const now = new Date()
    const hour = now.getHours() + now.getMinutes() / 60
    if (hour < dayStartHour || hour > dayEndHour) return null
    return hourOffsetPercent(hour, dayStartHour, dayEndHour)
  }, [day, dayEndHour, dayStartHour])

  useEffect(() => {
    if (!scrollable || nowLineTop === null) return
    const scrollEl = scrollRef.current
    if (!scrollEl) return
    scrollEl.scrollTop = calendarScrollTopForNow(
      scrollEl,
      dayStartHour,
      dayEndHour,
      hourHeight
    )
  }, [day, dayEndHour, dayStartHour, hourHeight, nowLineTop, scrollable])

  return (
    <div
      className={`calendar-day-grid${scrollable ? '' : ' calendar-day-grid-embedded'}`}
    >
      <div ref={scrollRef} className="calendar-day-grid-scroll">
        <div
          className="calendar-day-grid-track"
          style={{ height: `${gridHeight}px` }}
        >
          {showHours ? (
            <div
              className="calendar-day-grid-hours"
              style={{ height: `${gridHeight}px` }}
            >
              {hours.map((hour) => {
                const labelStyle = hourLabelStyle(
                  hour,
                  dayStartHour,
                  dayEndHour
                )
                return (
                  <span
                    key={hour}
                    className="calendar-day-grid-hour-label"
                    style={labelStyle}
                  >
                    {formatHourLabel(hour)}
                  </span>
                )
              })}
            </div>
          ) : null}
          <div
            className="calendar-day-grid-body"
            style={{ height: `${gridHeight}px` }}
          >
            {hours.map((hour) => (
              <div
                key={`line-${hour}`}
                className="calendar-day-grid-hour-line"
                style={{
                  top: `${hourOffsetPercent(hour, dayStartHour, dayEndHour)}%`,
                }}
              />
            ))}
            {slotHours.map((hour, index) => (
              <button
                key={`slot-${hour}`}
                type="button"
                className="calendar-day-grid-slot"
                style={hourSlotStyle(
                  hour,
                  index,
                  hours,
                  dayStartHour,
                  dayEndHour
                )}
                onClick={() => onSlotClick?.(day, hour)}
              />
            ))}
            {nowLineTop !== null ? (
              <div
                className="calendar-day-grid-now-line"
                style={{ top: `${nowLineTop}%` }}
              />
            ) : null}
            {layoutBlocks.map((block) => (
              <NucCalendarEventBlock
                key={block.eventId}
                event={block.event as NucCalendarEventObjectInterface}
                layout={block}
                onSelect={onEventSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
