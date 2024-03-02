import { AnnotationHotkeysPayload } from './AnnotationHotkeysPayload'

export type DatasetPayload = {
  /* eslint-disable camelcase */
  active: boolean
  anyone_can_double_assign: boolean
  annotation_hotkeys: AnnotationHotkeysPayload
  annotators_can_create_tags: boolean
  annotators_can_instantiate_workflows: boolean
  archived_at: string | null
  archived: boolean
  default_workflow_template_id: number
  id: number
  inserted_at: string
  instructions?: string
  version: number
  name: string
  num_annotations?: number
  num_annotators?: number
  num_classes?: number
  num_images?: number
  num_videos?: number
  owner_id: number
  pdf_fit_page: boolean
  progress: number
  public: boolean
  reviewers_can_annotate: boolean
  slug: string
  team_id: number
  team_slug: string
  thumbnails: Array<string>
  updated_at: string
  work_prioritization: string
  work_size: number
  /* eslint-enable camelcase */
}
