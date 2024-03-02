import { appendNumber } from './string'

it('should append number to string', () => {
  expect(appendNumber('foo', [])).toBe('foo')
  expect(appendNumber('foo', ['foo'])).toBe('foo (1)')
  expect(appendNumber('foo', ['foo', 'foo (1)'])).toBe('foo (2)')
  expect(appendNumber('foo (1)', ['foo', 'foo (1)'])).toBe('foo (2)')
  expect(appendNumber('foo (1)', ['foo', 'foo (1)', 'foo (2)'])).toBe('foo (3)')
  expect(appendNumber('foo (1)', ['foo (5)', 'foo', 'foo (1)'])).toBe('foo (6)')
})
