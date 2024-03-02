import { Point } from '@/engineCommon/point'

export const createRoundedPath = (coords: Point<any>[], radius: number): string => {
  let path = ''
  const length = coords.length - 1
  for (let i = 0; i < length; i++) {
    const a = coords[i % coords.length]
    const b = coords[(i + 1) % coords.length]
    const t = Math.min(radius / Math.hypot(b.x - a.x, b.y - a.y), 0.5)

    if (i > 0) {path += `Q${a.x},${a.y} ${a.x * (1 - t) + b.x * t},${a.y * (1 - t) + b.y * t}`}

    if (i == 0) {
      path += `M${a.x},${a.y}`
    } else if (i == 0) {
      path += `M${a.x * (1 - t) + b.x * t},${a.y * (1 - t) + b.y * t}`
    }

    if (i == length - 1) {
      path += `L${b.x},${b.y}`
    } else if (i < length - 1) {
      path += `L${a.x * t + b.x * (1 - t)},${a.y * t + b.y * (1 - t)}`
    }
  }
  return path
}
