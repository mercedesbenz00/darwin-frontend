import { buildAnnotationClassPayload } from 'test/unit/factories'

import { AnnotationClass } from '@/engineCommon/AnnotationClass'

describe('AnnotationClass#color', () => {
  test('is parsed from metadata._color, as rgba string', () => {
    const payload = buildAnnotationClassPayload({ metadata: { _color: 'rgba(1,2,3,0.4)' } })
    const klass = new AnnotationClass(payload)
    expect(klass.color).toEqual({ r: 1, g: 2, b: 3, a: 0.4 })
  })

  test('is parsed from metadata._color, as rgb string', () => {
    const payload = buildAnnotationClassPayload({ metadata: { _color: 'rgb(1,2,3)' } })
    const klass = new AnnotationClass(payload)
    expect(klass.color).toEqual({ r: 1, g: 2, b: 3, a: 1.0 })
  })
})

describe('AnnotationClass#colorRGBAstring', () => {
  test('is taken from metadata._color, unchanged', () => {
    const payload1 = buildAnnotationClassPayload({ metadata: { _color: 'rgba(1,2,3,0.4)' } })
    const klass1 = new AnnotationClass(payload1)
    expect(klass1.colorRGBAstring).toEqual('rgba(1,2,3,0.4)')

    const payload2 = buildAnnotationClassPayload({ metadata: { _color: 'rgb(1,2,3)' } })
    const klass2 = new AnnotationClass(payload2)
    expect(klass2.colorRGBAstring).toEqual('rgba(1,2,3,1)')
  })
})

describe('AnnotationClass#displayName', () => {
  test('returns name field, if already capitalized', () => {
    const payload = buildAnnotationClassPayload({ name: 'Foo' })
    const klass = new AnnotationClass(payload)
    expect(klass.displayName).toEqual('Foo')
  })

  test('returns capitalized name field', () => {
    const payload = buildAnnotationClassPayload({ name: 'foo' })
    const klass = new AnnotationClass(payload)
    expect(klass.displayName).toEqual('foo')
  })

  test('capitalizes first char only', () => {
    const payload1 = buildAnnotationClassPayload({ name: 'Foo Bar' })
    const klass1 = new AnnotationClass(payload1)
    expect(klass1.displayName).toEqual('Foo Bar')

    const payload2 = buildAnnotationClassPayload({ name: 'foo bar' })
    const klass2 = new AnnotationClass(payload2)
    expect(klass2.displayName).toEqual('foo bar')
  })
})
