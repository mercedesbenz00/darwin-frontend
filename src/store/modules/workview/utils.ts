import { omit, pick } from 'lodash'

import { AClassState } from '@/store/modules/aclass/state'
import {
  AnnotationClassPayload,
  AnnotationTypePayload,
  StageAnnotationPayload,
  isVideoAnnotationData
} from '@/store/types'
import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'
import { StageTimeState } from '@/store/types/StageTimeState'
import { WorkflowStagePayload } from '@/store/types/WorkflowStagePayload'

import { WorkviewState } from './state'
import { StageAnnotation } from './types'

export const matchAnnotation = (state: WorkviewState, id: string): StageAnnotation | null =>
  state.stageAnnotations.find(a => a.id === id) || null

export const loadStageAnnotationPayload =
  (data: StageAnnotationPayload): StageAnnotation =>
    ({ ...data, isSelected: false, isVisible: true, isHighlighted: false })

const areStageSiblings = (a: StageAnnotation, b: StageAnnotation): boolean =>
  a.workflow_stage_id === b.workflow_stage_id && a.id !== b.id

const deselectOtherStageAnnotations = (state: WorkviewState, data: StageAnnotation): void =>
  state.stageAnnotations
    .filter(a => areStageSiblings(a, data) && a.isSelected)
    .forEach(a => { a.isSelected = false })

export const deselectOtherAnnotations = (state: WorkviewState, data: StageAnnotation): void =>
  deselectOtherStageAnnotations(state, data)

const unhighlightOtherStageAnnotations = (state: WorkviewState, data: StageAnnotation): void =>
  state.stageAnnotations
    .filter(a => areStageSiblings(a, data) && a.isHighlighted)
    .forEach(a => { a.isHighlighted = false })

export const unhighlightOtherAnnotations = (state: WorkviewState, data: StageAnnotation): void =>
  unhighlightOtherStageAnnotations(state, data)

const shiftFollowersUp = (
  annotations: StageAnnotation[],
  annotation: StageAnnotation,
  newIndex: number
): StageAnnotation[] => {
  return [...annotations].map(a => {
    if (
      a.z_index !== null &&
      a.z_index <= newIndex &&
      a.id !== annotation.id
    ) {
      a.z_index -= 1
    }
    return a
  })
}

const shiftFollowersDown = (
  annotations: StageAnnotation[],
  annotation: StageAnnotation,
  newIndex: number
): StageAnnotation[] => {
  return [...annotations].map(a => {
    if (
      a.z_index !== null &&
      a.z_index >= newIndex &&
      a.id !== annotation.id
    ) {
      a.z_index += 1
    }

    return a
  })
}

/**
 * Shifts z-indices up or down after a single annotation's z-index has been moved.
 *
 * The shift direction depends on the direction of the move.
 *
 * If an annotation has been moved up, the z-index of affected annotations shifts down.
 * If an annotation has been moved down, the z-index of affected annotations shifts up.
 */
export const shiftZIndices = (
  annotations: StageAnnotation[],
  annotation: StageAnnotation,
  oldIndex: number
): StageAnnotation[] => {
  const newIndex = annotation.z_index

  if (newIndex === null) { return [...annotations] }

  if (oldIndex > newIndex) {
    return shiftFollowersDown([...annotations], annotation, newIndex)
  } else if (oldIndex < newIndex) {
    return shiftFollowersUp([...annotations], annotation, newIndex)
  }

  return [...annotations]
}

/**
 * Should be used as the single sorting method for annotations.
 *
 * If the sort order needs to be changed, we should go with either extending the method with
 * a sort direction argument, or reversing the result.
 *
 * Sorts in descending order, nulls last
 *
 * NOTE: should be merged with `compareByZIndexCamelcase`
 */
export const compareByZIndex = (
  /* eslint-disable camelcase */
  a: { z_index: number | null },
  b: { z_index: number | null }
  /* eslint-enable camelcase */
): number => {
  if (a.z_index === b.z_index) {
    return 0
  } else if (a.z_index === null) {
    return -1
  } else if (b.z_index === null) {
    return 1
  } else {
    return a.z_index < b.z_index ? 1 : -1
  }
}

/**
 * Should be used as the single sorting method for annotations.
 *
 * If the sort order needs to be changed, we should go with either extending the method with
 * a sort direction argument, or reversing the result.
 *
 * Sorts in descending order, nulls last
 *
 * NOTE: should be merged with `compareByZIndex`
 */
export const compareByZIndexCamelcase = (
  a: { zIndex: number | null },
  b: { zIndex: number | null }
): number => {
  if (a.zIndex === b.zIndex) {
    return 0
  } else if (a.zIndex === null) {
    return -1
  } else if (b.zIndex === null) {
    return 1
  } else {
    return a.zIndex < b.zIndex ? 1 : -1
  }
}

const WORKFLOW_STATUSES = [
  DatasetItemStatus.new,
  DatasetItemStatus.annotate,
  DatasetItemStatus.review,
  DatasetItemStatus.complete
]

const ANNOTATOR_STATUSES = [
  DatasetItemStatus.annotate,
  DatasetItemStatus.review
]

export const sanitizeStatusFilter = (
  isAdmin: boolean,
  statuses?: DatasetItemStatus[]
): DatasetItemStatus[] => {
  const allowedStatuses = isAdmin ? WORKFLOW_STATUSES : ANNOTATOR_STATUSES
  const filteredStatuses = (statuses || []).filter(s => allowedStatuses.includes(s))
  return filteredStatuses.length === 0 ? [...allowedStatuses] : filteredStatuses
}

export const getSortedAnnotationsByStage = (
  annotations: StageAnnotation[],
  stage: WorkflowStagePayload | null,
  wf2: boolean = false
): StageAnnotation[] => {
  // In WF2.0, the annotations are not associated to a specific stage.
  // Instead, we will have a concept called annotation snapshots.
  // That means we do not filter by stage id.
  const baseAnnotations = wf2
    ? [...annotations]
    : stage
      ? annotations.filter(a => a.workflow_stage_id === stage.id)
      : []

  return baseAnnotations.sort(compareByZIndex)
}

export const getTimeState = (
  state: WorkviewState,
  instance: WorkflowStagePayload
): StageTimeState => {
  const item = state.datasetItems.find(i => i.current_workflow_id === instance.workflow_id)
  if (!item?.current_workflow) { return StageTimeState.Uknown }

  const currentStageNumber = item.current_workflow.current_stage_number
  return currentStageNumber === instance.number
    ? StageTimeState.Current
    : currentStageNumber < instance.number
      ? StageTimeState.Future
      : StageTimeState.Past
}

const isTag = (a: AnnotationClassPayload): boolean => a.annotation_types.includes('tag')

export const tagClasses = (state: AClassState): AnnotationClassPayload[] =>
  state.classes.filter(c => isTag(c))

/**
 * Resolves new format annotation data from old annotation data
 */
export const resolveNewAnnotationData = (
  annotation: StageAnnotationPayload,
  mainAnnotationTypes: AnnotationTypePayload[]
): StageAnnotationPayload => {
  const { data } = annotation

  // if this is already new annotation format, no need to transform
  if ('sub_frames' in data) {
    const annotationSubFrames = data.sub_frames || {}
    if (Object.keys(annotationSubFrames).length > 0) {
      return annotation
    }
  }

  // we only need to parse the video annotation data
  if (!isVideoAnnotationData(data)) { return annotation }

  const mainAnnotationTypeNames = mainAnnotationTypes.map(type => type.name)
  const subFrames: any = {}
  Object.keys(data.frames).forEach(frameIndex => {
    const frameData = data.frames[frameIndex]
    const subFrameData = omit(frameData, [...mainAnnotationTypeNames, 'auto_annotate'])
    const newFrameData = pick(frameData, [...mainAnnotationTypeNames, 'auto_annotate', 'keyframe'])

    data.frames[frameIndex] = newFrameData
    if (Object.keys(subFrameData).length > 1) {
      subFrames[frameIndex] = subFrameData
    }
  })
  data.sub_frames = subFrames

  return annotation
}
