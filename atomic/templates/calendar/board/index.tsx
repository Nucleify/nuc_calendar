'use client'

import React, { useMemo } from 'react'

import {
  AdButton,
  AdParagraph,
  CALENDAR_VIEWS,
  type CalendarView,
  formatRangeLabel,
  NucCalendarDayGrid,
  type NucCalendarEventObjectInterface,
  NucCalendarMonthGrid,
  NucCalendarWeekGrid,
  t,
} from 'nucleify'

import './_index.scss'

interface NucCalendarBoardProps {
  view: CalendarView
  anchor: Date
  events: NucCalendarEventObjectInterface[]
  loading?: boolean
  dayStartHour: number
  dayEndHour: number
  weekStartsOn?: number
  integrationsOpen?: boolean
  onViewChange?: (view: CalendarView) => void
  onNavigate?: (direction: -1 | 1) => void
  onToday?: () => void
  onNewEvent?: () => void
  onOpenIntegrations?: () => void
  onSlotClick?: (day: Date, hour: number) => void
  onDayClick?: (day: Date) => void
  onEventSelect?: (event: NucCalendarEventObjectInterface) => void
}

export const NucCalendarBoard: React.FC<NucCalendarBoardProps> = ({
  view,
  anchor,
  events,
  loading = false,
  dayStartHour,
  dayEndHour,
  weekStartsOn = 1,
  integrationsOpen = false,
  onViewChange,
  onNavigate,
  onToday,
  onNewEvent,
  onOpenIntegrations,
  onSlotClick,
  onDayClick,
  onEventSelect,
}) => {
  const rangeLabel = useMemo(
    () => formatRangeLabel(view, anchor, weekStartsOn),
    [anchor, view, weekStartsOn]
  )

  const viewLabels = useMemo<Record<CalendarView, string>>(
    () => ({
      day: t('calendar-view-day'),
      week: t('calendar-view-week'),
      month: t('calendar-view-month'),
    }),
    []
  )

  return (
    <section
      className={`calendar-board${loading ? ' calendar-board-loading' : ''}`}
    >
      <div className="calendar-board-toolbar">
        <div className="calendar-board-toolbar-left">
          <AdButton
            icon="prime:chevron-left"
            adType="secondary"
            onClick={() => onNavigate?.(-1)}
          />
          <AdButton
            label={t('calendar-today')}
            adType="secondary"
            onClick={onToday}
          />
          <AdButton
            icon="prime:chevron-right"
            adType="secondary"
            onClick={() => onNavigate?.(1)}
          />
          <AdParagraph
            text={rangeLabel}
            className="calendar-board-range-label"
          />
        </div>
        <div className="calendar-board-toolbar-right">
          <div className="calendar-board-view-switch">
            {CALENDAR_VIEWS.map((item) => (
              <button
                key={item}
                type="button"
                className={`calendar-board-view-button${item === view ? ' calendar-board-view-button-active' : ''}`}
                onClick={() => onViewChange?.(item)}
              >
                {viewLabels[item]}
              </button>
            ))}
          </div>
          <AdButton
            icon="prime:cog"
            adType="secondary"
            aria-label={t('calendar-integrations')}
            className={
              integrationsOpen ? 'calendar-board-integrations-active' : ''
            }
            onClick={onOpenIntegrations}
          />
          <AdButton
            label={t('calendar-new-event')}
            icon="prime:plus"
            adType="main"
            onClick={onNewEvent}
          />
        </div>
      </div>
      <div className="calendar-board-content">
        {view === 'month' ? (
          <NucCalendarMonthGrid
            anchor={anchor}
            events={events}
            weekStartsOn={weekStartsOn}
            onDayClick={onDayClick}
            onEventSelect={onEventSelect}
          />
        ) : view === 'week' ? (
          <NucCalendarWeekGrid
            anchor={anchor}
            events={events}
            dayStartHour={dayStartHour}
            dayEndHour={dayEndHour}
            weekStartsOn={weekStartsOn}
            onSlotClick={onSlotClick}
            onEventSelect={onEventSelect}
          />
        ) : (
          <NucCalendarDayGrid
            day={anchor}
            events={events}
            dayStartHour={dayStartHour}
            dayEndHour={dayEndHour}
            onSlotClick={onSlotClick}
            onEventSelect={onEventSelect}
          />
        )}
      </div>
    </section>
  )
}
