/**
 * Checks is modifier being pressed
 * return true if so
 *
 * @param {KeyboardEvent} event
 * @returns
 */
export const isModifierPressed = (event: KeyboardEvent): boolean => {
  return (
    event.altKey ||
    event.shiftKey ||
    event.ctrlKey ||
    event.metaKey
  )
}
