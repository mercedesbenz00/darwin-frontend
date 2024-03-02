import { BadgeType } from '@/components/Common/Badge'
import { tagBrightenedColor } from '@/components/Common/TagApplier/utils'
import { Editor } from '@/engine/editor'
import { Annotation } from '@/engine/models'
import {
  AnnotationClassPayload,
  AnnotationActorPayload,
  InputTag,
  UserPayload
} from '@/store/types'
import { parseHSLA, hslaToRGBA, parseRGBA } from '@/utils'

/** Convert an annotation to a renderable tag item */
export const toTagItem = (annotation: Annotation, bg: boolean = true): InputTag => {
  const { annotationClass } = annotation
  if (!annotationClass) { throw new Error('Invalid tag annotation. No class availalbe') }

  const background = annotationClass.metadata._color
    ? tagBrightenedColor(annotationClass.metadata._color)
    : 'inherit'

  const tagItem: InputTag = {
    id: annotation.id,
    text: annotationClass.name,
    style: bg ? `background: ${background};` : undefined
  }

  if (annotation.isVideoAnnotation()) {
    tagItem.segments = annotation.data.segments
  }

  return tagItem
}

/** Convert a tag item to badge item */
export const inputTagsToBadges = (tags: InputTag[]): BadgeType[] => {
  return tags.map(({ id, text, style }) => {
    return {
      id,
      label: text,
      color: style ? hslaToRGBA(parseHSLA(style)) : undefined
    }
  })
}

export const initializeTag = (
  user: UserPayload | null,
  editor: Editor,
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

  const { activeView } = editor

  const { loadedVideo } = activeView
  if (!loadedVideo) {
    return editor.initializeAnnotation({
      type: 'tag',
      actors: [actorPayload],
      classId: annotationClass ? annotationClass.id : undefined,
      data: { tag: { } }
    })
  }

  const { currentFrameIndex, firstFrameIndex, totalFrames } = activeView

  const startFrame: number = currentFrameIndex

  const endFrame: number = Math.min(
    firstFrameIndex + totalFrames,
    startFrame + videoAnnotationDuration
  )

  return editor.initializeAnnotation({
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

export const classesToBadges = (classes: AnnotationClassPayload[]): BadgeType[] =>
  classes.map(({ name, metadata }) => ({
    label: name,
    color: parseRGBA(metadata._color)
  }))

export const filterAvailableBadges =
  (badges: BadgeType[], currentTags: InputTag[], keyword: string): BadgeType[] =>
    badges
      .filter((badge: BadgeType) => {
        return (
          !keyword || keyword === '' || badge.label.toLowerCase().includes(keyword.toLowerCase())
        )
      })
      .filter((badge: BadgeType) => {
        const used = (currentTags || []).map(({ text }) => text)
        return !used.includes(badge.label)
      })
