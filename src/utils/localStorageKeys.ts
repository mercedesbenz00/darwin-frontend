import { DatasetPayload } from '@/store/types'

/**
 * Dataset-specific key used when determining whether to
 * automatically open instructions in workview.
 */
export const viewedInstructionsOnDataset = (dataset: DatasetPayload): string =>
  `viewed_instructions_on_dataset:${dataset.id}`

/**
 * Key used to store "view data as folders" setting on data tab
 */
export const WORKFLOW_FOLDER_ENABLED = 'workflowFolderEnabled'

/**
 * Returns key used to store the "toggle subannotations" layer bar setting in workview
 */
export const SHOULD_RENDER_SUB_ANNOTATIONS = 'shouldRenderSubAnnotations'

/**
 * Key used to store "default video annotation duration" in workview
 */
export const ANNOTATION_ITEM_DEFAULT_DURATION = 'annotationItemDefaultDuration'

/**
 * Key used to store 'hardwareConcurrency' in workview
 */
export const HARDWARE_CONCURRENCY = 'hardwareConcurrency'
