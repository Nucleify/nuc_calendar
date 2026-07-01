'use client'

import React, { useMemo } from 'react'

import {
  AdParagraph,
  type CalendarLayoutBlock,
  formatEventTimeRange,
  type NucCalendarEventObjectInterface,
} from 'nucleify'

import './_index.scss'

interface NucCalendarEventBlockProps {
  event: NucCalendarEventObjectInterface
  layout?: CalendarLayoutBlock
  variant?: 'time' | 'month'
  showTime?: boolean
  className?: string
  onSelect?: (event: NucCalendarEventObjectInterface) => void
}

export const NucCalendarEventBlock: React.FC<NucCalendarEventBlockProps> = ({
  event,
  layout,
  variant = 'time',
  showTime = true,
  className,
  onSelect,
}) => {
  const blockStyle = useMemo(() => {
    if (!layout) return undefined
    const color = event.color || undefined
    return {
      top: `${layout.top}%`,
      left: `${layout.left}%`,
      width: `${layout.width}%`,
      height: `${layout.height}%`,
      ...(color ? { borderLeftColor: color } : {}),
    } as React.CSSProperties
  }, [event.color, layout])

  const chipStyle = useMemo(() => {
    const color = event.color || undefined
    return color
      ? ({ borderLeftColor: color } as React.CSSProperties)
      : undefined
  }, [event.color])

  const timeLabel = formatEventTimeRange(event.starts_at, event.ends_at)

  if (variant === 'month') {
    return (
      <button
        type="button"
        className="calendar-month-event-chip"
        style={chipStyle}
        onClick={() => onSelect?.(event)}
      >
        {event.title}
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`calendar-event-block${className ? ` ${className}` : ''}`}
      style={blockStyle}
      data-event-id={String(event.id ?? '')}
      onClick={() => onSelect?.(event)}
    >
      <div className="calendar-event-block-header">
        <AdParagraph
          text={event.title}
          className="calendar-event-block-title"
        />
        {showTime ? (
          <AdParagraph text={timeLabel} className="calendar-event-block-time" />
        ) : null}
      </div>
      <span className="calendar-event-block-resize-handle" />
    </button>
  )
}
