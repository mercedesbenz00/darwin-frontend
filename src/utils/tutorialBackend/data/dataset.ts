import { DatasetPayload } from '@/store/types'

const dataset: DatasetPayload = {
  active: true,
  annotation_hotkeys: {},
  anyone_can_double_assign: false,
  annotators_can_create_tags: true,
  annotators_can_instantiate_workflows: false,
  archived_at: null,
  archived: false,
  default_workflow_template_id: -1,
  id: 1,
  inserted_at: '2020-06-12T16:00:00',
  // eslint-disable-next-line max-len
  instructions: '<p>Welcome to this tutorial on annotation basics. There are instructions provided within each image guiding you through various functionalities within Darwin.</p><p><br></p><p>The video in the link below will guide you through the completion of this tutorial:</p><p><br></p><p><span class="fr-video fr-deletable fr-fvc fr-draggable fr-dvb" contenteditable="false" draggable="true"><iframe src="https://www.youtube.com/embed/v90norZUy58?&wmode=opaque&rel=0" frameborder="0" allowfullscreen="" class="fr-draggable" style="width: 500px; height: 281.25px;"></iframe></span><br><br></p>',
  name: 'Annotation Tutorial',
  num_annotations: 1000,
  num_classes: 10,
  num_images: 12,
  num_videos: 2,
  owner_id: 1,
  pdf_fit_page: true,
  progress: 0,
  public: false,
  reviewers_can_annotate: true,
  slug: 'annotation-tutorial',
  team_id: -1,
  team_slug: 'tutorial-team',
  thumbnails: [],
  updated_at: '2020-06-12T16:00:00',
  version: 1,
  work_size: 2,
  work_prioritization: 'inserted_at:asc'
}

export { dataset }
