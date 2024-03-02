/* eslint-disable */
import {
  resolveNewAnnotationData
} from '@/store/modules/workview/utils'
import { buildAnnotationTypePayload, buildStageAnnotationPayload } from 'test/unit/factories'

const mainAnnotationTypes = [
  buildAnnotationTypePayload({ name: 'polygon' }),
  buildAnnotationTypePayload({ name: 'bounding_box' })
]

describe('resolveNewAnnotationData', () => {
  it('should return annotation converted to new format when original annotation does not have sub_frames field', () => {
    const annotation = buildStageAnnotationPayload({
      data: {
        frames: {
          0: {
            polygon: { path: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }] },
            auto_annotate: {
              bbox: { x1: 0, y1: 0, x2: 10, y2: 10 },
              clicks: [],
              model: 'foo'
            },
            text: { text: 'text1' },
            keyframe: true
          },
          5: {
            polygon: { path: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }] },
            auto_annotate: {
              bbox: { x1: 0, y1: 0, x2: 10, y2: 10 },
              clicks: [],
              model: 'bar'
            },
            text: { text: 'text2' },
            keyframe: true
          }
        },
        segments: [[0, 10]],
        interpolated: false,
        interpolate_algorithm: undefined
      }
    })

    const resolvedAnnotation = resolveNewAnnotationData(annotation, mainAnnotationTypes)
    expect(resolvedAnnotation.data).toEqual({
      frames: {
        0: {
          polygon: { path: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }] },
          auto_annotate: {
            bbox: { x1: 0, y1: 0, x2: 10, y2: 10 },
            clicks: [],
            model: 'foo'
          },
          keyframe: true
        },
        5: {
          polygon: { path: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }] },
          auto_annotate: {
            bbox: { x1: 0, y1: 0, x2: 10, y2: 10 },
            clicks: [],
            model: 'bar'
          },
          keyframe: true
        }
      },
      sub_frames: {
        0: {
          text: { text: 'text1' },
          keyframe: true
        },
        5: {
          text: { text: 'text2' },
          keyframe: true
        }
      },
      segments: [[0, 10]],
      interpolated: false,
      interpolate_algorithm: undefined
    })
  })

  it('should return annotation converted to new format when original annotation has sub_frames fields, but not any values', () => {
    const annotation = buildStageAnnotationPayload({
      data: {
        frames: {
          0: {
            polygon: { path: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }] },
            auto_annotate: {
              bbox: { x1: 0, y1: 0, x2: 10, y2: 10 },
              clicks: [],
              model: 'foo'
            },
            text: { text: 'text1' },
            keyframe: true
          },
          5: {
            polygon: { path: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }] },
            auto_annotate: {
              bbox: { x1: 0, y1: 0, x2: 10, y2: 10 },
              clicks: [],
              model: 'bar'
            },
            text: { text: 'text2' },
            keyframe: true
          }
        },
        segments: [[0, 10]],
        sub_frames: {},
        interpolated: false,
        interpolate_algorithm: undefined
      }
    })

    const resolvedAnnotation = resolveNewAnnotationData(annotation, mainAnnotationTypes)
    expect(resolvedAnnotation.data).toEqual({
      frames: {
        0: {
          polygon: { path: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }] },
          auto_annotate: {
            bbox: { x1: 0, y1: 0, x2: 10, y2: 10 },
            clicks: [],
            model: 'foo'
          },
          keyframe: true
        },
        5: {
          polygon: { path: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }] },
          auto_annotate: {
            bbox: { x1: 0, y1: 0, x2: 10, y2: 10 },
            clicks: [],
            model: 'bar'
          },
          keyframe: true
        }
      },
      sub_frames: {
        0: {
          text: { text: 'text1' },
          keyframe: true
        },
        5: {
          text: { text: 'text2' },
          keyframe: true
        }
      },
      segments: [[0, 10]],
      interpolated: false,
      interpolate_algorithm: undefined
    })
  })

  it('should return original one if it is image annotation', () => {
    const annotation = buildStageAnnotationPayload({})
    const resolvedAnnotation = resolveNewAnnotationData(annotation, mainAnnotationTypes)
    expect(resolvedAnnotation).toEqual(annotation)
  })
})
