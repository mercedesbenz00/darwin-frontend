export enum MouseButton {
  LEFT = 0,
  MIDDLE = 1,
  RIGHT = 2
}

/**
 * Determines if the mouse event is fired with the middle mouse button
 */
export const isMiddleMouseButton = (event: MouseEvent): boolean =>
  event.button === MouseButton.MIDDLE

/**
 * Determines if the mouse event is fired with the left mouse button
 */
export const isLeftMouseButton = (event: MouseEvent): boolean =>
  event.button === MouseButton.LEFT
