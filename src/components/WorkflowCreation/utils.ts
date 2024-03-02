/**
 * Toggles a class on the document body indicating we are currently dragging a 
 * stage in/onto the canvas.
 * 
 * Long term, we should drop this function and rely on something else.
 */
export const setGrabber = (dragging: boolean): void => {
  if (dragging) {
    document.body.classList.add('wf--dragging')
    return 
  }

  document.body.classList.remove('wf--dragging')
}
