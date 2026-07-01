'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

import {
  bookableHours,
  buildDragSessionUpdate,
  CALENDAR_HOUR_HEIGHT,
  type CalendarDragGhostBase,
  type CalendarDragPointerState,
  type CalendarFloatingGhost,
  calendarGridHeightPx,
  calendarScrollTopForNow,
  clampCalendarMinutes,
  clearDragSession,
  dayGridBodyFromPointer,
  eventMinutesInDayGrid,
  eventsForDay,
  eventTimesUnchanged,
  formatEventTimeRange,
  formatHourLabel,
  formatLocalDateKey,
  getDragSession,
  hourLabelStyle,
  hourOffsetPercent,
  hourSlotStyle,
  hoursInRange,
  isToday,
  layoutDayEvents,
  minutesFromPointerInBody,
  NucCalendarEventBlock,
  type NucCalendarEventObjectInterface,
  parseLocalDateKey,
  resolveDragTimes,
  setDragSession,
} from 'nucleify'

import { createPortal } from 'react-dom'

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
  onEventMove,
  onEventResize,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const [floatingGhost, setFloatingGhost] =
    useState<CalendarFloatingGhost | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  type LocalDragState = CalendarDragPointerState

  const dragStateRef = useRef<LocalDragState | null>(null)

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

  const publishDragPreview = (state: LocalDragState, event: PointerEvent) => {
    const body = dayGridBodyFromPointer(event)
    const session = buildDragSessionUpdate(
      state,
      event,
      body,
      day,
      dayStartHour,
      dayEndHour,
      hourHeight,
      getDragSession(),
      formatEventTimeRange
    )

    setFloatingGhost(session.floatingGhost)
    setDragSession(session)
  }

  const clearDragPreview = () => {
    clearDragSession()
    setFloatingGhost(null)
    setIsDragging(false)
  }

  const onBodyPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null
    if (!target) return

    const resize = target.closest('.calendar-event-block-resize-handle')
    const block = target.closest('.calendar-event-block') as HTMLElement | null
    if (!block || block.classList.contains('calendar-event-block-ghost')) return

    const rawId = block.getAttribute('data-event-id') || ''
    const id = Number(rawId)
    if (!id || Number.isNaN(id)) return

    const event = dayEvents.find((item) => Number(item.id) === id)
    if (!event) return

    e.preventDefault()

    const startsAt = String(event.starts_at || '')
    const endsAt = String(event.ends_at || '')
    const durationMs = new Date(endsAt).getTime() - new Date(startsAt).getTime()
    if (!durationMs || Number.isNaN(durationMs)) return

    const body = target.closest('.calendar-day-grid-body') as HTMLElement | null
    if (!body) return
    const pointerMinutes = clampCalendarMinutes(
      minutesFromPointerInBody(e.nativeEvent, body, hourHeight),
      dayStartHour,
      dayEndHour
    )
    const eventMinutes = eventMinutesInDayGrid(startsAt, day, dayStartHour)
    const grabOffsetMinutes = clampCalendarMinutes(
      pointerMinutes - eventMinutes,
      dayStartHour,
      dayEndHour
    )

    const blockRect = block.getBoundingClientRect()
    const grabOffsetX = e.clientX - blockRect.left
    const grabOffsetY = e.clientY - blockRect.top

    const blockLayout = layoutBlocks.find((item) => item.eventId === id)
    const ghostBase: CalendarDragGhostBase = {
      title: event.title,
      color: event.color,
      left: blockLayout?.left ?? 0,
      width: blockLayout?.width ?? 100,
    }

    const state: LocalDragState = {
      mode: resize ? 'resize' : 'move',
      id,
      initialStartsAt: startsAt,
      initialEndsAt: endsAt,
      durationMs,
      grabOffsetMinutes,
      grabOffsetX,
      grabOffsetY,
      blockWidthPx: blockRect.width,
      blockHeightPx: blockRect.height,
      blockOriginX: blockRect.left,
      blockOriginY: blockRect.top,
      originDayKey: formatLocalDateKey(day),
      ghostBase,
    }

    dragStateRef.current = state
    setIsDragging(true)
    publishDragPreview(state, e.nativeEvent)

    const onMove = (ev: PointerEvent) => {
      const active = dragStateRef.current
      if (!active) return
      ev.preventDefault()
      publishDragPreview(active, ev)
    }

    const onUp = (ev: PointerEvent) => {
      const active = dragStateRef.current
      if (!active) return
      ev.preventDefault()

      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)

      const sessionSnapshot = getDragSession()
      const body = dayGridBodyFromPointer(ev)
      const resolved =
        resolveDragTimes(
          active,
          ev,
          body,
          day,
          dayStartHour,
          dayEndHour,
          hourHeight
        ) ??
        (sessionSnapshot
          ? {
              startsAt: sessionSnapshot.targetStartsAt,
              endsAt: sessionSnapshot.targetEndsAt,
              targetDay: parseLocalDateKey(sessionSnapshot.targetDayKey),
            }
          : null)

      dragStateRef.current = null
      clearDragPreview()

      if (!resolved) return
      if (
        eventTimesUnchanged(
          active.initialStartsAt,
          active.initialEndsAt,
          resolved.startsAt,
          resolved.endsAt
        )
      ) {
        return
      }

      const payload = {
        id: active.id,
        starts_at: resolved.startsAt,
        ends_at: resolved.endsAt,
      }

      if (
        active.mode === 'move' ||
        active.originDayKey !== formatLocalDateKey(resolved.targetDay)
      ) {
        onEventMove?.(payload)
        return
      }

      onEventResize?.(payload)
    }

    const onCancel = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
      dragStateRef.current = null
      clearDragPreview()
    }

    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', onUp, { passive: false })
    window.addEventListener('pointercancel', onCancel, { passive: false })
  }

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
            ref={bodyRef}
            className="calendar-day-grid-body"
            style={{ height: `${gridHeight}px` }}
            data-day={formatLocalDateKey(day)}
            onPointerDown={onBodyPointerDown}
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
            {layoutBlocks.map((block) => {
              const activeDrag = dragStateRef.current
              return (
                <NucCalendarEventBlock
                  key={block.eventId}
                  event={block.event as NucCalendarEventObjectInterface}
                  layout={block}
                  className={
                    activeDrag?.id === block.eventId &&
                    activeDrag?.mode === 'resize'
                      ? 'calendar-event-block-source-resizing'
                      : undefined
                  }
                  onSelect={onEventSelect}
                />
              )
            })}
          </div>
        </div>
      </div>
      {isDragging && floatingGhost && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="calendar-event-block calendar-event-block-ghost calendar-event-block-floating"
              style={{
                left: `${floatingGhost.x}px`,
                top: `${floatingGhost.y}px`,
                width: `${floatingGhost.width}px`,
                height: `${floatingGhost.height}px`,
                ...(floatingGhost.color
                  ? { borderLeftColor: floatingGhost.color }
                  : {}),
              }}
            >
              <div className="calendar-event-block-header">
                <p className="calendar-event-block-title">
                  {floatingGhost.title}
                </p>
                <p className="calendar-event-block-time">
                  {floatingGhost.time}
                </p>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  )
}
