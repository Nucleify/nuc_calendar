with users as (
  select id from auth.users order by created_at asc limit 20
),
owner as (
  select id as user_id from users limit 1
),
inserted_calendars as (
  insert into public.calendar_calendars (
    user_id, name, slug, color, timezone, is_default, is_visible, sort_order
  )
  select
    o.user_id,
    'Meetings',
    'meetings',
    '#3B82F6',
    'Europe/Warsaw',
    true,
    true,
    0
  from owner o
  on conflict do nothing
  returning id, user_id
),
default_calendar as (
  select c.id, c.user_id
  from public.calendar_calendars c
  join owner o on o.user_id = c.user_id
  where c.is_default = true
  order by c.id asc
  limit 1
),
generated as (
  select dc.id as calendar_id, dc.user_id, gs.i
  from generate_series(1, 80) as gs(i)
  cross join default_calendar dc
)
insert into public.calendar_events (
  user_id,
  calendar_id,
  reference,
  title,
  description,
  starts_at,
  ends_at,
  status,
  source,
  timezone
)
select
  g.user_id,
  g.calendar_id,
  f.reference,
  f.title,
  f.description,
  f.starts_at,
  f.ends_at,
  f.status,
  f.source,
  'Europe/Warsaw'
from generated g
cross join lateral public.factory_calendar_event(g.i) as f
on conflict (user_id, reference) do nothing;
