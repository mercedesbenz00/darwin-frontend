import { tag } from 'test/unit/fixtures/annotation-class-payloads'

import {
  matchClassByName,
  tagBrightenedColor
} from '@/components/Common/TagApplier/utils'
import { AnnotationClassPayload } from '@/store/types'

describe('matchClassByName', () => {
  let classes: AnnotationClassPayload[]
  let text: string

  beforeEach(() => {
    classes = [tag]
    text = ''
  })

  it('should return matched annotation class', () => {
    text = tag.name
    expect(matchClassByName(classes, text)).toEqual(tag)
  })

  it('should return undefined when no match is found', () => {
    text = ''
    expect(matchClassByName(classes, text)).toBeUndefined()
  })
})

describe('tagBrightenedColor', () => {
  let color: string

  beforeEach(() => {
    color = 'rgba(0,0,0,1)'
  })

  it('should return lightened color', () => {
    expect(tagBrightenedColor(color)).toEqual('hsla(0,0%,70%,1)')
  })
})
