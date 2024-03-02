import { BadgeType } from '@/components/Common/Badge'
import { Annotation } from '@/engineV2/models'
import { View } from '@/engineV2/views'
import {
  AnnotationActorPayload,
  AnnotationClassPayload,
  InputTag,
  UserPayload
} from '@/store/types'
import { parseRGBA } from '@/utils'
import { getAutoAnnotationClassColor } from '@/utilsV2'

/** Convert an annotation to a renderable tag item */
export const toTagItem = (annotation: Annotation): InputTag => {
  const { annotationClass } = annotation
  if (!annotationClass) { throw new Error('Invalid tag annotation. No class availalbe') }

  const color = getAutoAnnotationClassColor(annotationClass.name)

  const tagItem: InputTag = {
    id: annotation.id,
    text: annotationClass.name,
    style: `background: ${color || 'inherit'};`
  }

  if (annotation.isVideoAnnotation()) {
    tagItem.segments = annotation.data.segments
  }

  return tagItem
}

/** Convert a tag item to badge item */
export const inputTagsToBadges = (tags: InputTag[]): BadgeType[] => {
  return tags.map(({ id, text }) => {
    return {
      id,
      label: text,
      color: parseRGBA(getAutoAnnotationClassColor(text))
    }
  })
}

export const initializeTag = (
  user: UserPayload | null,
  view: View,
  annotationClass: AnnotationClassPayload,
  videoAnnotationDuration = 30
): Annotation | null => {
  if (!user || Number.isNaN(Number(user.id))) {
    throw new Error('[TagApplier.vue]: unrecognized team member')
  }

  const actorPayload: AnnotationActorPayload = {
    role: 'annotator',
    user_id: Number(user.id)
  }

  const { isProcessedAsVideo } = view.fileManager
  if (!isProcessedAsVideo) {
    return view.annotationManager.initializeAnnotation({
      type: 'tag',
      actors: [actorPayload],
      classId: annotationClass ? annotationClass.id : undefined,
      data: { tag: { } }
    })
  }

  const { currentFrameIndex, firstFrameIndex, totalFrames } = view

  const startFrame: number = currentFrameIndex

  const endFrame: number = Math.min(
    firstFrameIndex + totalFrames,
    startFrame + videoAnnotationDuration
  )

  return view.annotationManager.initializeAnnotation({
    type: 'tag',
    classId: annotationClass ? annotationClass.id : undefined,
    actors: [actorPayload],
    data: {
      frames: { [startFrame]: { tag: { }, keyframe: true } },
      segments: [[startFrame, endFrame]],
      interpolated: false
    }
  })
}
