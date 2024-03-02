import { DatasetPayload } from '@/store/types'

import { v7 } from './teams'

export const sfh: DatasetPayload = {
  active: true,
  annotation_hotkeys: {},
  annotators_can_create_tags: true,
  annotators_can_instantiate_workflows: true,
  anyone_can_double_assign: true,
  archived_at: null,
  archived: false,
  default_workflow_template_id: 5,
  id: 123,
  inserted_at: '2020-01-01T00:00:00',
  name: 'SFH',
  owner_id: 1,
  pdf_fit_page: true,
  progress: 0,
  public: false,
  reviewers_can_annotate: true,
  slug: 'sfh',
  team_id: v7.id,
  team_slug: v7.slug,
  thumbnails: [],
  updated_at: '2020-01-01T00:00:00',
  version: 1,
  work_prioritization: '1',
  work_size: 10
}
