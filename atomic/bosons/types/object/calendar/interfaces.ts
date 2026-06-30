export interface NucCalendarObjectInterface {
  id: number
  user_id: string
  name: string
  slug?: string | null
  color: string
  timezone: string
  is_default: boolean
  is_visible: boolean
  sort_order: number
  created_at: string
  updated_at?: string
}
