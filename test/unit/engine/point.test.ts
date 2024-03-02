import {} from 'ts-jest'
import { Point } from '@/engineCommon/point'

test('Can create points', () => {
  const p1 = new Point({ x: 2, y: 4 })
  expect(p1.x).toBe(2)
  expect(p1.y).toBe(4)
})
test('Can add number to point', () => {
  const p1 = new Point({ x: 2, y: 4 })
  const p2 = p1.add(10)
  expect(p1.x).toBe(2)
  expect(p1.y).toBe(4)
  expect(p2.x).toBe(12)
  expect(p2.y).toBe(14)
})
test('Can sub number to point', () => {
  const p1 = new Point({ x: 2, y: 4 })
  const p2 = p1.sub(10)
  expect(p1.x).toBe(2)
  expect(p1.y).toBe(4)
  expect(p2.x).toBe(-8)
  expect(p2.y).toBe(-6)
})

test('Can div number to point', () => {
  const p1 = new Point({ x: 2, y: 4 })
  const p2 = p1.div(10)
  expect(p1.x).toBe(2)
  expect(p1.y).toBe(4)
  expect(p2.x).toBe(0.2)
  expect(p2.y).toBe(0.4)
})

test('Can mul number to point', () => {
  const p1 = new Point({ x: 2, y: 4 })
  const p2 = p1.mul(10)
  expect(p1.x).toBe(2)
  expect(p1.y).toBe(4)
  expect(p2.x).toBe(20)
  expect(p2.y).toBe(40)
})

test('Can add point to point', () => {
  const p1 = new Point({ x: 2, y: 4 })
  const p2 = p1.add(new Point({ x: 10, y: 100 }))
  expect(p1.x).toBe(2)
  expect(p1.y).toBe(4)
  expect(p2.x).toBe(12)
  expect(p2.y).toBe(104)
})
test('Can sub number to point', () => {
  const p1 = new Point({ x: 2, y: 4 })
  const p2 = p1.sub(new Point({ x: 10, y: 100 }))
  expect(p1.x).toBe(2)
  expect(p1.y).toBe(4)
  expect(p2.x).toBe(-8)
  expect(p2.y).toBe(-96)
})

test('Can div number to point', () => {
  const p1 = new Point({ x: 2, y: 4 })
  const p2 = p1.div(new Point({ x: 10, y: 100 }))
  expect(p1.x).toBe(2)
  expect(p1.y).toBe(4)
  expect(p2.x).toBe(0.2)
  expect(p2.y).toBe(0.04)
})

test('Can mul number to point', () => {
  const p1 = new Point({ x: 2, y: 4 })
  const p2 = p1.mul(new Point({ x: 10, y: 100 }))
  expect(p1.x).toBe(2)
  expect(p1.y).toBe(4)
  expect(p2.x).toBe(20)
  expect(p2.y).toBe(400)
})

test('Can div_ number to point', () => {
  const p1 = new Point({ x: 2, y: 4 })
  p1.div_(10)
  expect(p1.x).toBe(0.2)
  expect(p1.y).toBe(0.4)
})
