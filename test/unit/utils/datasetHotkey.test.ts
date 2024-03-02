import {
  buildAnnotationClassPayload,
  buildDatasetPayload
} from 'test/unit/factories'

import { getAnnotationClassHotkey, getDatasetHotkeys } from '@/utils/datasetHotkey'

describe('getAnnotationClassHotkey', () => {
  it('returns null when no matching hotkey', () => {
    expect(getAnnotationClassHotkey({ 1: 'select_class:1' }, 2)).toBeNull()
  })

  it('returns key when hotkey matches', () => {
    expect(getAnnotationClassHotkey({ 1: 'select_class:2' }, 2)).toBe('1')
  })
})

describe('getDatasetHotkeys', () => {
  const annotationClasses = [
    buildAnnotationClassPayload({ id: 1, annotation_types: ['bounding_box'] }),
    buildAnnotationClassPayload({ id: 2, annotation_types: ['bounding_box'] }),
    buildAnnotationClassPayload({ id: 3, annotation_types: ['tag'] })
  ]

  it('returns hotkey for all non-tag annotation classes', () => {
    const dataset = buildDatasetPayload({ annotation_hotkeys: { 1: 'select_class:1' } })
    expect(getDatasetHotkeys({ annotationClasses, dataset })).toEqual({
      1: 'select_class:1',
      2: 'select_class:2',
      3: 'select_class:3'
    })
  })
})
