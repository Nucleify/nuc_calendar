'use client'

import React, { useEffect, useMemo, useState } from 'react'

import {
  AdButton,
  AdDialog,
  applyEventDuration,
  type CalendarEventDraft,
  type ComponentType,
  eventDurationMinutes,
  getComponent,
  isSelectOrDatePicker,
  readCalendarEventFieldValue,
  t,
  useCalendarEventDurationOptions,
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
  const durationOptions = useCalendarEventDurationOptions(t)
  const [draft, setDraft] = useState<CalendarEventDraft>({ ...initialDraft })
  const [durationMinutes, setDurationMinutes] = useState(() =>
    initialDraft.starts_at && initialDraft.ends_at
      ? eventDurationMinutes(initialDraft.starts_at, initialDraft.ends_at)
      : 30
  )

  useEffect(() => {
    setDraft({ ...initialDraft })
    if (initialDraft.starts_at && initialDraft.ends_at) {
      setDurationMinutes(
        eventDurationMinutes(initialDraft.starts_at, initialDraft.ends_at)
      )
    }
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

  const DatePicker = getComponent('date-picker') as React.ElementType
  const Select = getComponent('select') as React.ElementType

  function setStartDate(value: unknown): void {
    setDraft((current) => {
      const next = writeCalendarEventFieldValue(current, 'starts_at', value)
      return applyEventDuration(next, durationMinutes)
    })
  }

  function setDuration(value: unknown): void {
    const minutes = Number(value)
    if (!Number.isFinite(minutes)) return
    setDurationMinutes(minutes)
    setDraft((current) => applyEventDuration(current, minutes))
  }

  function saveDraft(): void {
    onSave?.(applyEventDuration({ ...draft }, durationMinutes))
  }

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
            onClick={saveDraft}
          />
        </div>
      }
    >
      <form
        className="form-container"
        action="#"
        onSubmit={(event) => {
          event.preventDefault()
          saveDraft()
        }}
      >
        {fieldComponents.map(({ field, Component }) => {
          if (field.name === 'starts_at') {
            return (
              <div key={field.name} className="form-div">
                <label htmlFor={field.name}>{field.label}</label>
                <div className="calendar-event-schedule-inputs">
                  <DatePicker
                    {...field.props}
                    id={field.name}
                    value={readCalendarEventFieldValue(draft, field.name)}
                    onChange={(event: {
                      target?: { value: unknown }
                      value?: unknown
                    }) => {
                      const value = event?.value ?? event?.target?.value
                      setStartDate(value)
                    }}
                    nuiType="main"
                    panelClass="calendar"
                  />
                  <Select
                    id="duration_minutes"
                    value={durationMinutes}
                    options={durationOptions}
                    optionLabel="label"
                    optionValue="value"
                    onChange={(event: {
                      target?: { value: unknown }
                      value?: unknown
                    }) => {
                      const value = event?.value ?? event?.target?.value
                      setDuration(value)
                    }}
                    nuiType="main"
                    panelClass="calendar"
                  />
                </div>
              </div>
            )
          }

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
