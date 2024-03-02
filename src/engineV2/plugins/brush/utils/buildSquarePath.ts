import round from 'lodash/round'

/**
 * Builds square path, with given radius and number of sides
 * @param radius the radius of the outscribed circumference
 */
export const buildSquarePath = (radius: number): number[][] => {
  const path: number[][] = []
  for (let angle = Math.PI / 4; angle < 2 * Math.PI; angle += (Math.PI / 2)) {
    // + 0 simply converts -0 values into +0 ones,
    // which are much easier to expect in tests and in general
    path.push([
      round(radius * Math.cos(angle), 2) + 0,
      round(radius * Math.sin(angle), 2) + 0
    ])
  }
  return path
}
