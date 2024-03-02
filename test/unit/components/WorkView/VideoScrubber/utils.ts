import { buildAnnotation, buildV2Annotation } from 'test/unit/factories'
import { flask, tag } from 'test/unit/fixtures/annotation-class-payloads'

import { Editor } from '@/engine/editor'
import { Annotation, CreateAnnotationParams } from '@/engine/models'
import { Editor as EditorV2 } from '@/engineV2/editor'
import {
  Annotation as AnnotationV2,
  CreateAnnotationParams as CreateAnnotationParamsV2
} from '@/engineV2/models'

export const buildFlaskStageVideoAnnotation = (
  editor: Editor,
  params: Partial<CreateAnnotationParams> = {}
): Annotation => {
  const annotation = buildAnnotation(editor, {
    classId: flask.id,
    type: 'polygon',
    data: {
      frames: {
        0: {
          keyframe: true,
          polygon: { path: [{ x: 0, y: 0 }, { x: 10, y: 10 }] }
        }
      },
      sub_frames: {
        0: {
          keyframe: true,
          text: { text: 'Text1' }
        }
      },
      interpolated: false,
      segments: [[0, 30]]
    },
    ...params
  })
  annotation!.id = 'flask_annotation'
  return annotation!
}

export const buildV2FlaskStageVideoAnnotation = (
  editor: EditorV2,
  params: Partial<CreateAnnotationParamsV2> = {}
): AnnotationV2 => {
  const annotation = buildV2Annotation(editor, {
    classId: flask.id,
    type: 'polygon',
    data: {
      frames: {
        0: {
          keyframe: true,
          polygon: { path: [{ x: 0, y: 0 }, { x: 10, y: 10 }] }
        }
      },
      sub_frames: {
        0: {
          keyframe: true,
          text: { text: 'Text1' }
        }
      },
      interpolated: false,
      segments: [[0, 30]]
    },
    ...params
  })
  annotation!.id = 'flask_annotation'
  return annotation!
}

export const buildTagStageVideoAnnotation = (
  editor: Editor,
  params: Partial<CreateAnnotationParams> = {}
): Annotation => {
  const annotation = buildAnnotation(editor, {
    classId: tag.id,
    type: 'tag',
    data: {
      frames: {
        0: {
          keyframe: true,
          tag: {}
        }
      },
      interpolated: false,
      segments: [[0, 30]]
    },
    ...params
  })
  annotation!.id = 'tag_annotation'
  return annotation!
}

export const buildV2TagStageVideoAnnotation = (
  editor: EditorV2,
  params: Partial<CreateAnnotationParamsV2> = {}
): AnnotationV2 => {
  const annotation = buildV2Annotation(editor, {
    classId: tag.id,
    type: 'tag',
    data: {
      frames: {
        0: {
          keyframe: true,
          tag: {}
        }
      },
      interpolated: false,
      segments: [[0, 30]]
    },
    ...params
  })
  annotation!.id = 'tag_annotation'
  return annotation!
}
