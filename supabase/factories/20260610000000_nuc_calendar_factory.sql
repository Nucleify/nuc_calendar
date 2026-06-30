drop function if exists public.factory_calendar_event(integer);

create or replace function public.factory_calendar_event(i integer)
returns table(
  reference text,
  title text,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  status text,
  source text
)
language sql
as $$
  select
    format('CAL-%s', lpad(i::text, 5, '0')),
    (array[
      'Discovery call',
      'Project sync',
      'Client review',
      'Onboarding session',
      'Quarterly planning'
    ])[(i % 5) + 1],
    format('Generated calendar event %s', i),
    date_trunc('hour', now() + (((i % 28) - 14) || ' days')::interval)
      + (((i % 8) + 9) || ' hours')::interval,
    date_trunc('hour', now() + (((i % 28) - 14) || ' days')::interval)
      + (((i % 8) + 9) || ' hours')::interval
      + (((i % 3) + 1) * 30 || ' minutes')::interval,
    (array['confirmed', 'tentative', 'confirmed', 'confirmed'])[(i % 4) + 1],
    'manual';
$$;
