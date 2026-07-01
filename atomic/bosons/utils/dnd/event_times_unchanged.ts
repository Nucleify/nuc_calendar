export function eventTimesUnchanged(
  initialStartsAt: string,
  initialEndsAt: string,
  startsAt: string,
  endsAt: string
): boolean {
  return (
    new Date(initialStartsAt).getTime() === new Date(startsAt).getTime() &&
    new Date(initialEndsAt).getTime() === new Date(endsAt).getTime()
  )
}
