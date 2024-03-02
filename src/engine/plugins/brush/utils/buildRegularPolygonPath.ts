import round from 'lodash/round'

/**
 * Builds regular polygon path, with given radius and number of sides
 * @param radius the radius of the outscribed circumference
 * @param sides the number of sides of the polygon
 */
export const buildRegularPolygonPath = (radius: number, sides: number): number[][] => {
  const step = 2 * Math.PI / sides
  const path: number[][] = []
  for (let angle = 0; angle < 2 * Math.PI; angle += step) {
    // + 0 simply converts -0 values into +0 ones, which are much easier to
    // expect in tests and in general
    path.push([
      round(radius * Math.cos(angle), 2) + 0,
      round(radius * Math.sin(angle), 2) + 0
    ])
  }
  return path
}
