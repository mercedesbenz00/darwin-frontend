import { cloneDeep } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import {
  AnnotationClassPayload,
  DatasetItemCountsPayload,
  DatasetItemPayload,
  PagedApiResponse,
  ReviewStatus,
  StageAnnotationPayload,
  AttributePayload,
  DatasetItemTimeSummaryPayload,
  ApiResponse,
  DatasetPayload,
  V2DatasetItemPayload,
  V2DatasetItemTimeSummaryPayload
} from '@/store/types'
import {
  AssignStageParams,
  CopyStageAnnotationsParams,
  CreateStageAnnotationParams,
  createAnnotationClass as backendCreateAnnotationClass,
  DeleteStageAnnotationParams,
  DeleteStageAnnotationsParams,
  LoadStageAnnotationsParams,
  LoadWorkflowTemplateParams,
  SetStageAutoCompleteParams,
  SetStageReviewStatusParams,
  SkipStageParams,
  UnskipStageParams,
  CreateOrFetchAnnotationAttributeParams,
  LoadClassAnnotationAttributesParams,
  LoadDatasetAnnotationAttributesParams,
  LoadDatasetItemParams,
  UpdateDatasetParams
} from '@/utils/backend'
import { LoadDatasetItemsParams } from '@/utils/backend/loadDatasetItems'
import { UpdateStageAnnotationParams } from '@/utils/backend/updateStageAnnotation'
import { getRGBAColorHash, rgbaString } from '@/utils/color'
import { dateUtcNowSeconds } from '@/utils/time'

import TutorialError from './TutorialError'
import {
  advanceItem,
  archiveItem,
  clearPendingUpdate,
  pushPendingUpdate,
  regressItem,
  scheduleUpdate
} from './autoComplete'
import filterItems from './filterItems'
import state from './state'

/**
 * Loads the only dataset available in tutorial
 */
export const loadDataset = () => ({ data: cloneDeep(state.dataset) })

/**
 * Loads all the annotation types available in tutorial
 */
export const loadAnnotationClasses = () => ({
  data: { annotation_classes: cloneDeep(state.annotationClasses) }
})

/**
 * Loads all the annotation types available in tutorial
 */
export const loadAnnotationTypes = () => ({
  data: cloneDeep(state.annotationTypes)
})

/**
 * Retrieves single dataset item from the backend
 *
 * Due to auto-completion logic the actual backend does with dataset items,
 * there is a similar system in place for tutorial.
 *
 * Pending updates are maintained by autoComplete module and every time items
 * area loaded in tutorial, any pending items are applied.
 */
export const loadDatasetItem = (params: LoadDatasetItemParams) => {
  const item = state.items.find(i => i.dataset_id === params.datasetId && i.id === params.id)
  if (!item) { throw new TutorialError('Cannot match item.') }
  pushPendingUpdate(item, state)
  return { data: cloneDeep(item) }
}

/**
 * Ad-hoc generates and returns a blank time summary for any item
 */
export const loadDatasetItemTimeSummary = (item: DatasetItemPayload) => {
  const summary: DatasetItemTimeSummaryPayload = {
    current_workflow: { per_stage_per_user: [] },
    dataset_item_id: item.id,
    out_of_workflow: []
  }
  return { data: summary }
}

export const loadV2DatasetItemTimeSummary = (item: V2DatasetItemPayload) => {
  const summary: V2DatasetItemTimeSummaryPayload = {
    current_workflow: { per_stage_per_user: [] },
    dataset_item_id: item.id,
    out_of_workflow: []
  }
  return { data: summary }
}

/**
 * Retrieves list of dataset items from the backend
 *
 * Supports pagination, filtering and ordering.
 *
 * Due to auto-completion logic the actual backend does with dataset items,
 * there is a similar system in place for tutorial.
 *
 * Pending updates are maintained by autoComplete module and every time items
 * area loaded in tutorial, any pending items are applied.
 */
export const loadDatasetItems = (params: Omit<LoadDatasetItemsParams, 'page' | 'datasetId'>) => {
  const filtered = filterItems(state.items, params)

  filtered.forEach(item => pushPendingUpdate(item, state))

  let data: PagedApiResponse<DatasetItemPayload>
  if ('page' in params) {
    const metadata = { next: null, previous: '1' }
    data = { items: cloneDeep(filtered), metadata }
    return { data }
  }

  data = {
    items: cloneDeep(filtered),
    metadata: { next: null, previous: null }
  }
  return { data }
}

/**
 * Retrieves stats for dataset items from tutorial store
 */
export const loadDatasetItemCounts =
  (params: Omit<LoadDatasetItemsParams, 'page'>) => {
    const filtered = filterItems(state.items, params)
    const data: DatasetItemCountsPayload = {
      class_counts: [],
      commented_item_count: 0,
      item_count: filtered.length,
      unfiltered_item_count: state.items.length,
      status_counts: []
    }

    return { data }
  }

export const loadWorkflowTemplate = (params: LoadWorkflowTemplateParams) => {
  const match = state.workflowTemplates.find(t => t.id === params.id)
  if (!match) { throw new TutorialError('Tried to fetch invalid workflow template') }
  return { data: cloneDeep(match) }
}

/**
 * Load annotations for the specified stage
 */
export const loadStageAnnotations = (params: LoadStageAnnotationsParams) => {
  const data: StageAnnotationPayload[] =
    state.annotations.filter(a => a.workflow_stage_id === params.stageId)

  return { data: cloneDeep(data) }
}

/**
 * Create annotation from specified params
 */
export const createStageAnnotation = (params: CreateStageAnnotationParams) => {
  const matchedClass = state.annotationClasses.find(c => c.id === params.annotationClassId)
  if (!matchedClass) { throw new TutorialError('Cannot resolve annotation class.') }
  const shouldAddInstanceId =
    matchedClass.annotation_types.includes('attributes') &&
    matchedClass.annotation_types.includes('instance_id')

  const annotation: StageAnnotationPayload = {
    annotation_class_id: params.annotationClassId,
    annotation_group_id: null,
    actors: [],
    data: {
      ...params.data,
      ...(shouldAddInstanceId && { instance_id: { value: state.annotations.length } })
    },
    id: uuidv4(),
    z_index: params.zIndex || null,
    workflow_stage_id: params.stageId
  }

  state.annotations.push(annotation)
  return { data: cloneDeep(annotation) }
}

/**
 * Update stage annotation using specified params
 */
export const updateStageAnnotation = (params: UpdateStageAnnotationParams) => {
  const match = state.annotations.find(a => a.id === params.id)
  if (!match) { throw new TutorialError('Trying to update invalid annotation.') }

  const matchedClass = state.annotationClasses.find(c => c.id === match.annotation_class_id)
  if (!matchedClass) { throw new TutorialError('Cannot resolve annotation class.') }

  if (params.annotationClassId) { match.annotation_class_id = params.annotationClassId }
  if (params.data) {
    const shouldAddInstanceId = (
      matchedClass.annotation_types.includes('attributes') && !('instance_id' in params.data)
    )

    match.data = params.data
    if (shouldAddInstanceId) { match.data.instance_id = { value: match.z_index || -1 } }
  }
  if (params.zIndex) { match.z_index = params.zIndex }

  return { data: cloneDeep(match) }
}

/**
 * Delete stage annotation specified by id
 */
export const deleteStageAnnotation = (params: DeleteStageAnnotationParams) => {
  const index = state.annotations.findIndex(a => a.id === params.id)
  if (index === -1) { throw new TutorialError('Trying to delete invalid annotation.') }
  const match = state.annotations[index]

  state.annotations.splice(index, 1)

  return { data: cloneDeep(match) }
}

/**
 * Delete stage annotation specified by ids
 */
export const deleteStageAnnotations = (params: DeleteStageAnnotationsParams) => {
  const deletedAnnotations: StageAnnotationPayload[] = []
  const newAnnotations: StageAnnotationPayload[] = []

  state.annotations.forEach(annotation => {
    if (params.ids.includes(annotation.id)) {
      deletedAnnotations.push(annotation)
    } else {
      newAnnotations.push(annotation)
    }
  })

  state.annotations = newAnnotations

  return { data: deletedAnnotations }
}

/**
 * Copies stage annotations from one stage to another
 */
export const copyStageAnnotations = (params: CopyStageAnnotationsParams) => {
  const { fromStageId, toStageId } = params
  const fromAnnotations = state.annotations.filter(a => a.workflow_stage_id === fromStageId)
  const toAnnotations = cloneDeep(fromAnnotations)
    .map(a => ({ ...a, id: uuidv4(), workflow_stage_id: toStageId }))

  state.annotations = state.annotations.concat(toAnnotations)

  return { data: cloneDeep(toAnnotations) }
}

/**
 * Assign stage with specified stage id to specified user id
 */
export const assignStage = (params: AssignStageParams) => {
  for (const item of state.items) {
    if (!item.current_workflow) { continue }
    const stages = Object.values(item.current_workflow.stages).flat()
    const stage = stages.find(s => s.id === params.stageId)
    if (stage) {
      stage.assignee_id = params.userId
      return { data: cloneDeep(stage) }
    }
  }

  throw new TutorialError('Tried to assign invalid stage.')
}

/**
 * Initiate auto-completion of stage specified by id
 */
export const setStageAutoComplete = (params: SetStageAutoCompleteParams) => {
  for (const item of state.items) {
    if (!item.current_workflow) { continue }
    const stages = Object.values(item.current_workflow.stages).flat()
    const stage = stages.find(s => s.id === params.stageId)
    if (stage) {
      scheduleUpdate(item, advanceItem)
      stage.completes_at = dateUtcNowSeconds() + 30
      return { data: cloneDeep(stage) }
    }
  }

  throw new TutorialError('Tried to auto-complete invalid stage.')
}

/**
 * Initiate auto-completion of stage specified by id
 */
export const cancelStageAutoComplete = (params: SetStageAutoCompleteParams) => {
  for (const item of state.items) {
    if (!item.current_workflow) { continue }
    const stages = Object.values(item.current_workflow.stages).flat()
    const stage = stages.find(s => s.id === params.stageId)
    if (stage) {
      clearPendingUpdate(item)
      stage.completes_at = null
      return { data: cloneDeep(stage) }
    }
  }

  throw new TutorialError('Tried to cancel auto-complete of invalid stage.')
}

const REVIEW_STATUS_CALLBACK = {
  [ReviewStatus.Approved]: advanceItem,
  [ReviewStatus.Rejected]: regressItem,
  [ReviewStatus.Archived]: archiveItem
}

/**
 * Initiate auto-completion of stage specified by id
 */
export const setStageReviewStatus = (params: SetStageReviewStatusParams) => {
  for (const item of state.items) {
    if (!item.current_workflow) { continue }
    const stages = Object.values(item.current_workflow.stages).flat()
    const stage = stages.find(s => s.id === params.stageId)
    if (stage) {
      stage.completes_at = dateUtcNowSeconds() + 30
      stage.metadata.review_status = params.status
      if (!params.status) {
        clearPendingUpdate(item)
      } else {
        scheduleUpdate(item, REVIEW_STATUS_CALLBACK[params.status])
      }

      return { data: cloneDeep(stage) }
    }
  }

  throw new TutorialError('Tried to cancel auto-complete of invalid stage.')
}

/**
 * Mark stage as skipped
 */
export const skipStage = (params: SkipStageParams) => {
  for (const item of state.items) {
    if (!item.current_workflow) { continue }
    const stages = Object.values(item.current_workflow.stages).flat()
    const stage = stages.find(s => s.id === params.stageId)
    if (stage) {
      stage.completes_at = dateUtcNowSeconds() + 30
      stage.skipped = true
      stage.skipped_reason = params.reason
      scheduleUpdate(item, advanceItem)
      return { data: cloneDeep(stage) }
    }
  }

  throw new TutorialError('Tried to auto-complete invalid stage.')
}

/**
 * Unskip previously skipped stage
 */
export const unskipStage = (params: UnskipStageParams) => {
  for (const item of state.items) {
    if (!item.current_workflow) { continue }
    const stages = Object.values(item.current_workflow.stages).flat()
    const stage = stages.find(s => s.id === params.stageId)
    if (stage) {
      stage.completes_at = null
      stage.skipped = false
      stage.skipped_reason = null
      clearPendingUpdate(item)
      return { data: cloneDeep(stage) }
    }
  }

  throw new TutorialError('Tried to auto-complete invalid stage.')
}

/**
 * Get color (as rgba string) from a string
 */
const getColor = (name: string): string => rgbaString(getRGBAColorHash(name))

/**
 * Create an annotation class
 */
export const createAnnotationClass = (
  params: Parameters<typeof backendCreateAnnotationClass>[0]
) => {
  const classes = state.annotationClasses
  const nextId = classes ? classes.length + 1 : 1

  if (!params.name) { throw new TutorialError("Couldn't create annotation class. Missing name") }
  const { _color, ...otherMetadata } = params.metadata

  // TODO: Why is image url, description type set to always string?
  const newClass: AnnotationClassPayload = {
    annotation_types: state.annotationTypes
      .filter(t => params.annotation_type_ids.includes(t.id))
      .map(t => t.name),
    team_id: state.dataset.team_id,
    description: params.description || '',
    id: nextId,
    datasets: params.datasets,
    images: params.images,
    metadata: {
      _color: (!_color || _color === 'auto') ? getColor(params.name) : _color,
      ...otherMetadata
    },
    name: params.name,
    inserted_at: new Date().toISOString()
  }

  if (classes) {
    classes.push(newClass)
  } else {
    state.annotationClasses = [newClass]
  }

  return { data: cloneDeep(newClass) }
}

/**
 * Create or fetch an existing class annotation attribute
 */
export const createOrFetchAnnotationAttribute =
  (params: CreateOrFetchAnnotationAttributeParams) => {
    const match =
      state.annotationAttributes.find(a => a.name === params.name && a.class_id === params.classId)
    if (match) { return { data: cloneDeep(match) } }

    const newAttribute: AttributePayload = {
      class_id: params.classId,
      color: params.color,
      id: uuidv4(),
      name: params.name
    }

    state.annotationAttributes.push(newAttribute)

    return { data: cloneDeep(newAttribute) }
  }

/**
 * Loads annotation attributes associated to specified class
 */
export const loadClassAnnotationAttributes = (params: LoadClassAnnotationAttributesParams) => {
  const attributes = state.annotationAttributes.filter(a => a.class_id === params.classId)

  return { data: cloneDeep(attributes) }
}

/**
 * Loads annotation attributes associated to specified dataset
 */
export const loadDatasetAnnotationAttributes = (params: LoadDatasetAnnotationAttributesParams) => {
  const attributes = state.dataset.team_slug === params.teamSlug ? state.annotationAttributes : []
  return { data: cloneDeep(attributes) }
}

/**
 * Updates the dataset
 * NOTE: This is only designed to support `workview` tutorial mode
 * which only updates the annotation hotkeys.
 *
 * If other fields are required in the further development,
 * you need to update this function.
 */
export const updateDataset = (params: UpdateDatasetParams): ApiResponse<DatasetPayload> => {
  const { annotationHotkeys } = params

  if (annotationHotkeys !== undefined) {
    state.dataset.annotation_hotkeys = annotationHotkeys
  }

  return { data: cloneDeep(state.dataset) }
}
