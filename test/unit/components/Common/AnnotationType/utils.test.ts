import {
  annotationTypeNameValidator,
  SORTED_NON_META_TYPES,
} from '@/components/Common/AnnotationType/utils'

describe('annotationTypeNameValidator', () => {
  SORTED_NON_META_TYPES.forEach((type) =>
    it(`returns true if parameter is ${type}`, () => {
      expect(annotationTypeNameValidator(type)).toBeTruthy()
    })
  )

  it('returns false for random type', () => {
    expect(annotationTypeNameValidator('random')).toBeFalsy()
  })
})
