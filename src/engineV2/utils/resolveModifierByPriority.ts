export const resolveModifierByPriority = (event: KeyboardEvent | MouseEvent | TouchEvent) => {
  if (event.shiftKey) { return 'shift' }
  if (event.altKey) { return 'alt' }
  if (event.ctrlKey) { return 'ctrl' }
}
