import round from 'lodash/round'

import { ImagePoint } from '@/engineCommon/point'

import { TipShape  } from './consts'

/**
 * Translates given path of an amount specified by given point
 * @param point the translation amount
 * @param path the path to be translated
 */
export const translatePath = (point: ImagePoint, path: number[][]): number[][] => {
  return path.map(c => [c[0] + point.x, c[1] + point.y])
}

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

/**
 * Returns the minimum number of sides that well approximate a circle with given radius,
 * if the given shape is `round`, starting from 12.
 * If the given shape is `squared`, then return 4 no matter what.
 * @param shape the tip shape, either 'squared' or 'round'
 * @param radius the radius of circle to approximate
 * @param tolerance the difference between a polygon side and its underlying arc
 */
export const getSides = (shape: TipShape, radius: number, tolerance: number = 0.1): number => {
  if (shape === TipShape.Squared) { return 4 }
  // Start from a dodecagon
  let sides = 12
  while (isTipToBeRebuilt(radius, sides, tolerance)) {
    // The number of sides is always an even number
    // That is especially important to keep symmetry and simplify interpolation
    sides += 2
  }
  return sides
}

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
