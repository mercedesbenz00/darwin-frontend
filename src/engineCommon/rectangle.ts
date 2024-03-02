import { IPoint, Point } from '@/engineCommon/point'

export class RectangleEditablePoint<T> extends Point<T> {
  public isHighlighted: boolean;
  public isSelected: boolean;

  private onSet: (point: RectangleEditablePoint<T>) => void

  constructor (point: IPoint, onSet: (point: RectangleEditablePoint<T>) => void) {
    super(point)
    this.isHighlighted = false
    this.isSelected = false
    this.onSet = onSet
  }

  set (point: IPoint): void {
    this.x = point.x
    this.y = point.y
    this.onSet(this)
  }
}

export class Rectangle<T> {
  private x1: number
  private y1: number
  private x2: number
  private y2: number

  constructor ({ x: x1, y: y1 }: Point<T>, { x: x2, y: y2 }: Point<T>) {
    this.x1 = Math.min(x1, x2)
    this.y1 = Math.min(y1, y2)
    this.x2 = Math.max(x1, x2)
    this.y2 = Math.max(y1, y2)
  }

  get left (): number {
    return this.x1
  }

  get top (): number {
    return this.y1
  }

  get right (): number {
    return this.x2
  }

  get bottom (): number {
    return this.y2
  }

  get width (): number {
    return this.x2 - this.x1
  }

  get height (): number {
    return this.y2 - this.y1
  }

  get topLeft (): Point<T> {
    return new Point<T>({ x: this.left, y: this.top })
  }

  get topRight (): Point<T> {
    return new Point<T>({ x: this.right, y: this.top })
  }

  get bottomRight (): Point<T> {
    return new Point<T>({ x: this.right, y: this.bottom })
  }

  get bottomLeft (): Point<T> {
    return new Point<T>({ x: this.left, y: this.bottom })
  }

  get topLeftEditable (): RectangleEditablePoint<T> {
    return new RectangleEditablePoint<T>(
      { x: this.left, y: this.top },
      (point: RectangleEditablePoint<T>) => {
        this.x1 = point.x
        this.y1 = point.y
      })
  }

  get topRightEditable (): RectangleEditablePoint<T> {
    return new RectangleEditablePoint<T>(
      { x: this.right, y: this.top },
      (point: RectangleEditablePoint<T>) => {
        this.x2 = point.x
        this.y1 = point.y
      })
  }

  get bottomRightEditable (): RectangleEditablePoint<T> {
    return new RectangleEditablePoint<T>(
      { x: this.right, y: this.bottom },
      (point: RectangleEditablePoint<T>
      ) => {
        this.x2 = point.x
        this.y2 = point.y
      })
  }

  get bottomLeftEditable (): RectangleEditablePoint<T> {
    return new RectangleEditablePoint<T>(
      { x: this.left, y: this.bottom },
      (point: RectangleEditablePoint<T>
      ) => {
        this.x1 = point.x
        this.y2 = point.y
      })
  }

  public isValid (threshold: number = 0): boolean {
    return this.width > threshold && this.height > threshold
  }

  /**
   * Keeps the rectangle within the bounds of the input image
   */
  public clamp (image: { width: number, height: number }): void {
    const { width, height } = image
    this.x1 = Math.round(Math.max(0, this.x1))
    this.y1 = Math.round(Math.max(0, this.y1))
    this.x2 = Math.round(Math.min(this.x2, width))
    this.y2 = Math.round(Math.min(this.y2, height))
  }

  /**
   * Ensures that x1 is <= x2 and y1 <= y2
   */
  public normalize (): void {
    const { x1, x2, y1, y2 } = this
    this.x1 = Math.min(x1, x2)
    this.y1 = Math.min(y1, y2)
    this.x2 = Math.max(x1, x2)
    this.y2 = Math.max(y1, y2)
  }

  /**
   * Adds offset to the current rectangle
   */
  public add (offset: Point<T>): void {
    this.x1 += offset.x
    this.y1 += offset.y
    this.x2 += offset.x
    this.y2 += offset.y
  }
}
