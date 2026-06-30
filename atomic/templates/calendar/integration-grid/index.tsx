'use client'

import React from 'react'

import {
  AdParagraph,
  type CalendarIntegrationStatusInterface,
  NucCalendarIntegrationTile,
  t,
} from 'nucleify'

import './_index.scss'

interface NucCalendarIntegrationGridProps {
  integrations: CalendarIntegrationStatusInterface[]
  onConnect?: (providerId: CalendarIntegrationStatusInterface['id']) => void
}

export const NucCalendarIntegrationGrid: React.FC<
  NucCalendarIntegrationGridProps
> = ({ integrations, onConnect }) => {
  return (
    <section className="calendar-integration-grid">
      <header className="calendar-integration-grid-header">
        <h2 className="calendar-integration-grid-title">
          {t('calendar-integrations-title')}
        </h2>
        <AdParagraph
          text={t('calendar-integrations-subtitle')}
          className="calendar-integration-grid-subtitle"
        />
      </header>
      <div className="calendar-integration-grid-items">
        {integrations.map((integration) => (
          <NucCalendarIntegrationTile
            key={integration.id}
            integration={integration}
            onConnect={onConnect}
          />
        ))}
      </div>
    </section>
  )
}
