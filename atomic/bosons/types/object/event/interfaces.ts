export interface NucCalendarEventObjectInterface {
  id: number
  user_id: string
  calendar_id: number
  uid: string
  reference: string
  title: string
  description?: string | null
  location?: string | null
  meeting_url?: string | null
  starts_at: string
  ends_at: string
  all_day: boolean
  timezone: string
  status: 'tentative' | 'confirmed' | 'cancelled'
  show_as: 'free' | 'busy' | 'tentative' | 'out_of_office'
  source: string
  contact_id?: number | null
  color?: string | null
  metadata?: Record<string, unknown>
  created_at: string
  updated_at?: string
}
