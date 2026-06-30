import type { EntityFieldInterface } from 'nucleify'

const dateTimePickerProps = {
  showTime: true,
  hourFormat: '24',
  dateFormat: 'yy-mm-dd',
} as const

export function useCalendarEventFields(): {
  fields: EntityFieldInterface[]
} {
  const fieldData: readonly [string, string, string][] = [
    ['title', 'Title', 'input-text'],
    ['starts_at', 'Starts', 'date-picker'],
    ['ends_at', 'Ends', 'date-picker'],
    ['location', 'Location', 'input-text'],
    ['description', 'Description', 'textarea'],
  ] as const

  const fields: EntityFieldInterface[] = fieldData.map(
    ([name, label, type]): EntityFieldInterface => {
      let props: Record<string, unknown> | undefined

      if (type === 'date-picker') {
        props = { ...dateTimePickerProps }
      } else if (name === 'title') {
        props = { placeholder: 'Meeting title' }
      } else if (name === 'location') {
        props = { placeholder: 'Optional location' }
      } else if (name === 'description') {
        props = { placeholder: 'Optional notes' }
      }

      return { name, label, type, props }
    }
  )

  return { fields }
}
