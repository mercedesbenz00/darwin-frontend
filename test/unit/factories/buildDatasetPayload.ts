import { DatasetPayload } from '@/store/types'

type Params = Partial<DatasetPayload>

export const buildDatasetPayload = (params: Params = {}): DatasetPayload => ({
  active: true,
  annotation_hotkeys: {},
  annotators_can_create_tags: false,
  annotators_can_instantiate_workflows: false,
  anyone_can_double_assign: false,
  archived_at: null,
  archived: false,
  default_workflow_template_id: -1,
  id: 1,
  inserted_at: '2000-01-01T00:00:00',
  instructions: 'foo',
  name: 'Dataset',
  num_images: 0,
  num_videos: 0,
  owner_id: 1,
  pdf_fit_page: true,
  progress: 0,
  public: false,
  reviewers_can_annotate: false,
  slug: 'dataset',
  team_id: 1,
  team_slug: 'team',
  thumbnails: [],
  updated_at: '2000-01-01T00:00:00',
  version: 1,
  work_prioritization: 'inserted_at:asc',
  work_size: 10,
  ...params
})
