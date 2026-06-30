import type { EntityFieldInterface } from 'nucleify'

const dateTimePickerProps = {
  showTime: true,
  hourFormat: '24',
  dateFormat: 'yy-mm-dd',
} as const

type TranslateFn = (key: string) => string

export function useCalendarEventFields(translate: TranslateFn): {
  fields: EntityFieldInterface[]
} {
  const fieldData: readonly [string, string, string][] = [
    ['title', 'calendar-field-title', 'input-text'],
    ['starts_at', 'calendar-field-starts-at', 'date-picker'],
    ['ends_at', 'calendar-field-ends-at', 'date-picker'],
    ['location', 'calendar-field-location', 'input-text'],
    ['description', 'calendar-field-description', 'textarea'],
  ] as const

  const fields: EntityFieldInterface[] = fieldData.map(
    ([name, labelKey, type]): EntityFieldInterface => {
      let props: Record<string, unknown> | undefined

      if (type === 'date-picker') {
        props = { ...dateTimePickerProps }
      } else if (name === 'title') {
        props = { placeholder: translate('calendar-field-title-placeholder') }
      } else if (name === 'location') {
        props = {
          placeholder: translate('calendar-field-location-placeholder'),
        }
      } else if (name === 'description') {
        props = {
          placeholder: translate('calendar-field-description-placeholder'),
        }
      }

      return { name, label: translate(labelKey), type, props }
    }
  )

  return { fields }
}
