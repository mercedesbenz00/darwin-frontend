/**
 * Determines if the given number of sides well approximate a circle with given radius
 * @param radius the radius of circle to approximate
 * @param sides the number of sides of the proxy polygon
 * @param tolerance the difference between a polygon side and its underlying arc
 */
export const isTipToBeRebuilt = (
  radius: number,
  sides: number,
  tolerance: number = 0.1
): boolean => {
  // Length of the underlying arc of each side of the polygon
  const arc = 2 * radius * Math.PI / sides
  // Length of each side of the polygon
  const side = 2 * radius * Math.sin(Math.PI / sides)
  // The tip needs to be rebuild if the difference between a side and its underlying arc
  // is greater than the specified tolerance value
  return arc - side > tolerance
}
