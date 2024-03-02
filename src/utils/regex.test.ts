import { validUrl } from '.'

it('should validate str', () => {
  expect(validUrl('http://foo')).toBeTruthy
  expect(validUrl('http://foo.bar')).toBeTruthy
  expect(validUrl('https://foo')).toBeTruthy
  expect(validUrl('https://foo.bar')).toBeTruthy
})

it('should reject str', () => {
  expect(validUrl('foo')).toBeFalsy
  expect(validUrl('foo.bar')).toBeFalsy
  expect(validUrl('http://')).toBeFalsy
})
