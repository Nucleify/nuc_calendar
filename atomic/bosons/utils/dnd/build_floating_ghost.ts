import type {
  BuildFloatingGhostOptions,
  CalendarDragPointerState,
  CalendarFloatingGhost,
} from 'nucleify'
import { eventMinutesInDayGrid, ghostLayoutPercent } from 'nucleify'

export function buildFloatingGhost(
  state: CalendarDragPointerState,
  event: PointerEvent,
  timeLabel: string,
  options?: BuildFloatingGhostOptions
): CalendarFloatingGhost {
  const {
    body,
    targetStartsAt,
    targetEndsAt,
    targetDay,
    dayStartHour,
    dayEndHour,
    hourHeight,
  } = options ?? {}

  if (
    body &&
    targetStartsAt &&
    targetEndsAt &&
    targetDay &&
    dayStartHour !== undefined &&
    dayEndHour !== undefined &&
    hourHeight !== undefined
  ) {
    const bodyRect = body.getBoundingClientRect()
    const leftPercent = state.ghostBase.left
    const widthPercent = state.ghostBase.width
    const heightPx =
      state.mode === 'resize'
        ? (ghostLayoutPercent(
            targetStartsAt,
            targetEndsAt,
            targetDay,
            dayStartHour,
            dayEndHour
          ).height /
            100) *
          bodyRect.height
        : state.blockHeightPx

    if (state.mode === 'resize') {
      return {
        x: state.blockOriginX,
        y: state.blockOriginY,
        width: state.blockWidthPx,
        height: heightPx,
        title: state.ghostBase.title,
        color: state.ghostBase.color,
        time: timeLabel,
      }
    }

    const startMinutes = eventMinutesInDayGrid(
      targetStartsAt,
      targetDay,
      dayStartHour
    )
    const topPx = (startMinutes / 60) * hourHeight

    return {
      x: bodyRect.left + (leftPercent / 100) * bodyRect.width,
      y: bodyRect.top + topPx,
      width: (widthPercent / 100) * bodyRect.width,
      height: heightPx,
      title: state.ghostBase.title,
      color: state.ghostBase.color,
      time: timeLabel,
    }
  }

  return {
    x: event.clientX - state.grabOffsetX,
    y: event.clientY - state.grabOffsetY,
    width: state.blockWidthPx,
    height: state.blockHeightPx,
    title: state.ghostBase.title,
    color: state.ghostBase.color,
    time: timeLabel,
  }
}
