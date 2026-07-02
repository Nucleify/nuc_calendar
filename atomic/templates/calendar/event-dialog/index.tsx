'use client'

import React, { useEffect, useMemo, useState } from 'react'

import {
  AdButton,
  AdDialog,
  type CalendarEventDraft,
  type ComponentType,
  getComponent,
  isSelectOrDatePicker,
  readCalendarEventFieldValue,
  t,
  useCalendarEventFields,
  writeCalendarEventFieldValue,
} from 'nucleify'

import './_index.scss'

interface NucCalendarEventDialogProps {
  visible: boolean
  draft: CalendarEventDraft
  mode: 'create' | 'edit'
  onClose?: () => void
  onSave?: (draft: CalendarEventDraft) => void
  onCancelEvent?: (id: number) => void
}

export const NucCalendarEventDialog: React.FC<NucCalendarEventDialogProps> = ({
  visible,
  draft: initialDraft,
  mode,
  onClose,
  onSave,
  onCancelEvent,
}) => {
  const { fields } = useCalendarEventFields(t)
  const [draft, setDraft] = useState<CalendarEventDraft>({ ...initialDraft })

  useEffect(() => {
    setDraft({ ...initialDraft })
  }, [initialDraft])

  const fieldComponents = useMemo(
    () =>
      fields.map((field) => ({
        field,
        Component: getComponent(
          field.type as ComponentType
        ) as React.ElementType,
      })),
    [fields]
  )

  return (
    <AdDialog
      visible={visible}
      modal
      className="calendar-event-dialog"
      onHide={() => {
        onClose?.()
      }}
      showHeader
      header={
        <span>
          {mode === 'edit' ? t('calendar-edit-event') : t('calendar-new-event')}
        </span>
      }
      footer={
        <div className="dialog-buttons-container">
          {mode === 'edit' && draft.id ? (
            <AdButton
              label={t('calendar-cancel-event')}
              severity="secondary"
              onClick={() => onCancelEvent?.(draft.id as number)}
            />
          ) : null}
          <AdButton
            label={t('common-close')}
            severity="secondary"
            onClick={onClose}
          />
          <AdButton
            label={t('common-save')}
            nuiType="main"
            onClick={() => onSave?.({ ...draft })}
          />
        </div>
      }
    >
      <form
        className="form-container"
        action="#"
        onSubmit={(event) => {
          event.preventDefault()
          onSave?.({ ...draft })
        }}
      >
        {fieldComponents.map(({ field, Component }) => {
          const isSelectLike = isSelectOrDatePicker(field.type)
          return (
            <div key={field.name} className="form-div">
              <label htmlFor={field.name}>{field.label}</label>
              <Component
                {...field.props}
                id={field.name}
                value={readCalendarEventFieldValue(draft, field.name)}
                onChange={(event: {
                  target?: { value: unknown }
                  value?: unknown
                }) => {
                  const value = event?.value ?? event?.target?.value
                  setDraft((current) =>
                    writeCalendarEventFieldValue(current, field.name, value)
                  )
                }}
                nuiType="main"
                {...(isSelectLike ? { panelClass: 'calendar' } : {})}
              />
            </div>
          )
        })}
      </form>
    </AdDialog>
  )
}
