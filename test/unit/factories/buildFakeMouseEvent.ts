/**
 * build fake mouse event like mousedown, mousemove, mouseup, ...
 * The problem is that we cannot mock readonly variables like `offsetX`, `offsetY` with original MouseEvent constructor
 */
type FakeMouseEventInit = MouseEventInit & {
  offsetX?: number
  offsetY?: number
  pageX?: number
  pageY?: number
}

class FakeMouseEvent extends MouseEvent {
  offsetX: number;
  offsetY: number;
  pageX: number;
  pageY: number;

  constructor (type: string, values: FakeMouseEventInit) {
    const { offsetX, offsetY, pageX, pageY, ...mouseValues } = values
    super(type, mouseValues)

    this.offsetX = offsetX || 0
    this.offsetY = offsetY || 0
    this.pageX = pageX || 0
    this.pageY = pageY || 0
  }
}

export const getFakeMouseEvent = (type: string, values: FakeMouseEventInit = {}) => (
  new FakeMouseEvent(type, {
    bubbles: true,
    cancelable: true,
    ...values
  })
)
