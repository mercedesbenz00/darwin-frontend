import { euclideanDistance } from './algebra'

type Brand<K, T> = K & { __brand: T }

export interface IPoint {
  x: number;
  y: number;
};

/**
 * Converts a number to a point
 * @example
 ```ts
fromScalar(5) === {x: 5, y: 5}
 ```
 */
export const fromScalar = (scalar: number): IPoint => {
  return { x: scalar, y: scalar }
}

/**
 * Point<T> represents a position `x,y` in T space.
 * E.g, T is used to differentiate between points in Canvas space and Image space.
 * @example
 * ```ts
 var p1 = new Point<"Canvas">({x: 10, y:2})
 var p2 = new Point<"Image">({x: 10, y:2})
 p1.add(p2) // typecheck error.
 ```
 */
export class Point<T> implements Brand<IPoint, T> {
  __brand!: T;
  public x: number;
  public y: number;

  constructor (point: IPoint) {
    this.x = point.x
    this.y = point.y
  }

  /**
   * Adds a point to the current instance and returns a new point
   * @param point Point or number to add, (`number -> {x: number, y:number}`))
   */
  public add (point: Brand<IPoint, T> | number): Point<T> {
    if (this.isPoint(point)) {
      return new Point({ x: this.x + point.x, y: this.y + point.y })
    } else {
      return this.add(fromScalar(point) as Point<T>)
    }
  }

  /**
   * Subtracts a point to the current instance and returns a new point
   * @param point Point or number to add, (`number -> {x: number, y:number}`))
   */
  public sub (point: Brand<IPoint, T> | number): Point<T> {
    if (this.isPoint(point)) {
      return new Point({ x: this.x - point.x, y: this.y - point.y })
    } else {
      return this.sub(fromScalar(point) as Point<T>)
    }
  }

  /**
   * Multiplies a point to the current instance and returns a new point
   * @param point Point or number to add, (`number -> {x: number, y:number}`))
   */
  public mul (point: Brand<IPoint, T> | number): Point<T> {
    if (this.isPoint(point)) {
      return new Point({ x: this.x * point.x, y: this.y * point.y })
    } else {
      return this.mul(fromScalar(point) as Point<T>)
    }
  }

  /**
   * Divides a point to the current instance and returns a new point
   * @param point Point or number to add, (`number -> {x: number, y:number}`))
   */
  public div (point: Brand<IPoint, T> | number): Point<T> {
    if (this.isPoint(point)) {
      return new Point({ x: this.x / point.x, y: this.y / point.y })
    } else {
      return this.div(fromScalar(point) as Point<T>)
    }
  }

  /**
   * Same as `add` but mutates the current instance.
   * @param point
   */
  public add_ (point: IPoint): void {
    this.x += point.x
    this.y += point.y
  }

  /**
   * Same as `auv` but mutates the current instance.
   * @param point
   */
  public sub_ (point: IPoint): void {
    this.x -= point.x
    this.y -= point.y
  }

  /**
   * Same as `div` but mutates the current instance.
   * @param point
   */
  public div_ (point: IPoint | number): void {
    if (this.isPoint(point)) {
      this.x /= point.x
      this.y /= point.y
    } else {
      this.x /= point
      this.y /= point
    }
  }

  /**
   * Same as `mul` but mutates the current instance.
   * @param point
   */
  public mul_ (point: IPoint): void {
    this.x *= point.x
    this.y *= point.y
  }

  private isPoint (p: IPoint | number): p is IPoint {
    return (<IPoint>p).x !== undefined
  }
}

export type CanvasPoint = Point<'Canvas'>
export type ImagePoint = Point<'Image'>
/**
 * EditablePoint is a point that can be selected and highlighted,
 * use for moving vertices in the workview.
 */
export class EditablePoint<T> extends Point<T> {
  public isHighlighted: boolean;
  public isSelected: boolean;

  constructor (point: IPoint) {
    super(point)
    this.isHighlighted = false
    this.isSelected = false
  }
}

export type EditableCanvasPoint = EditablePoint<'Canvas'>
export type EditableImagePoint = EditablePoint<'Image'>

/**
 * Checks if `point` resides inside or outside a polygon described by `path`
 */
export const pointInPath = (point: IPoint, path: IPoint[]): boolean => {
  let inside = false
  for (let i = 0, j = path.length - 1; i < path.length; j = i++) {
    const xi = path[i].x
    const yi = path[i].y
    const xj = path[j].x
    const yj = path[j].y
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)
    if (intersect) { inside = !inside }
  }
  return inside
}

export const pointIsVertexOfPath =
  <T>(point: Point<T>, path: (Point<T> | undefined)[], threshold: number): boolean => {
    for (const vertex of path) {
      if (!vertex) { return false }
      const distance = euclideanDistance(point, vertex)
      if (distance < threshold) {
        return true
      }
    }
    return false
  }

export const anchorCursor =
  <T>(currentPoint: Point<T>, point: Point<T>, nextPoint: Point<T>): Point<T> => {
  // Point is A, nextPoint is B, the cursor is C
  // Trying to find D on AB, so AB and CD are perpendicular
    const BA = nextPoint.sub(point)
    const t =
      ((currentPoint.x - point.x) * BA.x + (currentPoint.y - point.y) * BA.y) /
      ((BA.x * BA.x + BA.y * BA.y) + 0.00001)

    return new Point({ x: point.x + t * BA.x, y: point.y + t * BA.y })
  }

export const pointOnPath = <T>(point: Point<T>, path: Point<T>[], threshold: number): boolean => {
  for (let i = 0; i < path.length - 1; i++) {
    const head = path[i]
    const tail = path[i + 1]

    const pointOnLine = anchorCursor(point, head, tail)
    const distanceFromCursor = euclideanDistance(point, pointOnLine)

    const pointInSegment =
      point.x > Math.min(head.x, tail.x) - threshold &&
      point.y > Math.min(head.y, tail.y) - threshold &&
      point.x < Math.max(head.x, tail.x) + threshold &&
      point.y < Math.max(head.y, tail.y) + threshold

    if (pointInSegment && distanceFromCursor <= threshold) { return true }
  }
  return false
}
