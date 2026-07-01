import type { ApiContext } from 'nuc_server'

export async function ensureDefaultCalendar(
  ctx: ApiContext,
  userId: string
): Promise<{ id: number } | { error: string }> {
  const { data: existing, error: listError } = await ctx.supabase
    .from('calendar_calendars')
    .select('id')
    .eq('user_id', userId)
    .eq('is_default', true)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (listError) return { error: listError.message }
  if (existing?.id) return { id: Number(existing.id) }

  const { data, error } = await ctx.supabase
    .from('calendar_calendars')
    .insert({
      user_id: userId,
      name: 'Meetings',
      slug: 'meetings',
      color: '#3B82F6',
      timezone: 'Europe/Warsaw',
      is_default: true,
      is_visible: true,
      sort_order: 0,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  return { id: Number(data.id) }
}

export async function countUserEvents(
  ctx: ApiContext,
  userId: string
): Promise<number> {
  const { count } = await ctx.supabase
    .from('calendar_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
  return count ?? 0
}
