import { isTipToBeRebuilt } from './isTipToBeRebuilt'

/**
 * Returns the minimum number of sides that well approximate a circle with given radius,
 * if the given shape is `round`, starting from 12.
 * If the given shape is `squared`, then return 4 no matter what.
 * @param shape the tip shape, either 'squared' or 'round'
 * @param radius the radius of circle to approximate
 * @param tolerance the difference between a polygon side and its underlying arc
 */
export const getSides = (shape: string, radius: number, tolerance: number = 0.1): number => {
  if (shape === 'squared') { return 4 }
  // Start from a dodecagon
  let sides = 12
  while (isTipToBeRebuilt(radius, sides, tolerance)) {
    // The number of sides is always an even number
    // That is especially important to keep symmetry and simplify interpolation
    sides += 2
  }
  return sides
}
