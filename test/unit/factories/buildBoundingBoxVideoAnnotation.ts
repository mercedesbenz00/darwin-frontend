import { scale } from 'test/unit/fixtures/annotation-class-payloads'

import { Editor } from '@/engine/editor'
import { CreateAnnotationParams } from '@/engine/models'

import { buildAnnotation } from './buildAnnotation'

export const buildBoundingBoxVideoAnnotation = (
  editor: Editor, params: Partial<CreateAnnotationParams> = {}
) => {
  const annotation = buildAnnotation(editor, {
    classId: scale.id,
    type: 'bounding_box',
    data: {
      frames: {
        0: {
          keyframe: true,
          bounding_box: { x: 10, y: 10, w: 100, h: 100 }
        }
      },
      interpolated: false,
      segments: [[0, 30]]
    },
    ...params
  })
  annotation!.id = 'bounding_box_annotation'
  return annotation!
}
