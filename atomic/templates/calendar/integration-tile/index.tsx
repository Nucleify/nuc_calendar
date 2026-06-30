'use client'

import React from 'react'

import {
  AdButton,
  AdIcon,
  AdParagraph,
  CALENDAR_INTEGRATION_ICONS,
  type CalendarIntegrationStatusInterface,
  t,
} from 'nucleify'

import './_index.scss'

interface NucCalendarIntegrationTileProps {
  integration: CalendarIntegrationStatusInterface
  onConnect?: (providerId: CalendarIntegrationStatusInterface['id']) => void
}

export const NucCalendarIntegrationTile: React.FC<
  NucCalendarIntegrationTileProps
> = ({ integration, onConnect }) => {
  const icon = CALENDAR_INTEGRATION_ICONS[integration.id] ?? 'mdi:calendar'
  const connectLabel = integration.connectable
    ? t('calendar-connect')
    : t('common-coming-soon')

  return (
    <article className="calendar-integration-tile">
      <div className="calendar-integration-tile-header">
        <div className="calendar-integration-tile-icon">
          <AdIcon icon={icon} size="1.5em" />
        </div>
        <AdParagraph
          text={integration.name}
          className="calendar-integration-tile-name"
        />
      </div>
      <AdParagraph
        text={integration.description}
        className="calendar-integration-tile-description"
      />
      <div className="calendar-integration-tile-footer">
        {integration.connected ? (
          <span className="calendar-integration-tile-badge">
            {t('calendar-connected')}
          </span>
        ) : null}
        <AdButton
          label={integration.connected ? t('calendar-manage') : connectLabel}
          adType={integration.connected ? 'secondary' : 'main'}
          disabled={!integration.connectable}
          onClick={() => onConnect?.(integration.id)}
        />
      </div>
    </article>
  )
}
