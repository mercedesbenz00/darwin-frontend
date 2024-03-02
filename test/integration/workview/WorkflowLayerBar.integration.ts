import MockAdapter from 'axios-mock-adapter'
import flushPromises from 'flush-promises'

import { login } from 'test/integration/fixtures'
import { createLocalVue, mount } from 'test/integration/testHelpers'
import { createMockTheme } from 'test/unit/components/mocks'
import { initializeStore } from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildAnnotationTypePayload,
  buildDatasetVideoPayload,
  buildLoadedFrame,
  buildLoadedVideo
} from 'test/unit/factories'
import { buildStageAnnotationPayload } from 'test/unit/factories/buildStageAnnotationPayload'
import { initializeARWorkflow } from 'test/unit/factories/helpers'

import WorkflowLayerBar from '@/components/WorkView/LayerBar/WorkflowLayerBar/WorkflowLayerBar.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { AnnotationClassPayload, ReviewStagePayload } from '@/store/types'
import { client } from '@/utils/api'

jest.mock('@/engineV2/workers/FramesLoaderWorker')

const axiosMock = new MockAdapter(client)

const localVue = createLocalVue()
let store: ReturnType<typeof initializeStore>
let propsData: {
  editor: Editor
}

const mocks = {
  // part of the lazy-load plugin
  $Lazyload: {
    $off: jest.fn(),
    $on: jest.fn(),
    $once: jest.fn()
  },
  // $theme heavily relies on DOM measurements, so easier to stub
  $theme: createMockTheme()
}

let reviewStage: ReviewStagePayload
let annotationClasses: AnnotationClassPayload[]

beforeEach(async () => {
  store = initializeStore()

  propsData = {
    editor: new Editor(new ItemManager(store), store)
  }

  const item = initializeARWorkflow({ id: 1 })

  reviewStage = item.current_workflow!.stages[2][0] as ReviewStagePayload
  reviewStage.template_metadata.readonly = false

  item.current_workflow!.current_workflow_stage_template_id =
    reviewStage.workflow_stage_template_id

  axiosMock.onGet(/annotation_types/)
    .reply(200, [
      buildAnnotationTypePayload({ id: 1, name: 'polygon', granularity: 'main' }),
      buildAnnotationTypePayload({ id: 2, name: 'bounding_box', granularity: 'main' }),
      buildAnnotationTypePayload({ id: 3, name: 'text', granularity: 'sub' }),
      buildAnnotationTypePayload({ id: 4, name: 'inference', granularity: 'sub' })
    ])

  // eslint-disable-next-line camelcase
  const { selected_team } = await login(store, axiosMock)
  selected_team.slug = 'v7_slug'

  annotationClasses = [
    buildAnnotationClassPayload({
      id: 1,
      metadata: { _color: 'rgba(5,10,15,1.0)' },
      team_id: selected_team.id,
      description: '',
      images: [],
      name: 'Foo',
      inserted_at: new Date().toISOString(),
      annotation_types: ['bounding_box'],
      datasets: [{ id: item.id }]
    }),
    buildAnnotationClassPayload({
      id: 2,
      metadata: { _color: 'rgba(10,15,20,1.0)' },
      team_id: selected_team.id,
      description: '',
      images: [],
      name: 'Bar',
      inserted_at: new Date().toISOString(),
      annotation_types: ['polygon'],
      datasets: [{ id: item.id }]
    }),
    buildAnnotationClassPayload({
      id: 3,
      metadata: { _color: 'rgba(15,20,25,1.0)' },
      team_id: selected_team.id,
      description: '',
      images: [],
      name: 'Baz',
      inserted_at: new Date().toISOString(),
      annotation_types: ['bounding_box'],
      datasets: [{ id: item.id }]
    })
  ]

  axiosMock.onGet(`teams/${selected_team.slug}/annotation_classes`)
    .reply(200, { annotation_classes: annotationClasses })

  await store.dispatch('aclass/loadAnnotationTypes')
  await store.dispatch('aclass/loadTeamAnnotationClasses', { teamSlug: selected_team.slug })

  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', reviewStage)

  const annotations = [
    {
      ...buildStageAnnotationPayload({
        id: 'first',
        workflow_stage_id: reviewStage.id,
        z_index: 2,
        annotation_class_id: annotationClasses[0].id
      }),
      data: {
        inference: {
          confidence: 0.5,
          model: {
            id: 'fake-model',
            name: 'Fake Model',
            type: 'instance_segmentation'
          }
        }
      }
    },
    buildStageAnnotationPayload({
      id: 'second',
      workflow_stage_id: reviewStage.id,
      z_index: 1,
      annotation_class_id: annotationClasses[1].id
    }),
    buildStageAnnotationPayload({
      id: 'third',
      workflow_stage_id: reviewStage.id,
      z_index: 3,
      annotation_class_id: annotationClasses[1].id
    })
  ]

  store.commit('workview/SET_STAGE_ANNOTATIONS', { stage: reviewStage, annotations })
})

afterEach(() => {
  axiosMock.reset()
})

it('matches snapshot', async () => {
  const wrapper = mount(WorkflowLayerBar, { localVue, mocks, store, propsData })

  await flushPromises()

  expect(wrapper).toMatchSnapshot()
})

describe('video layerbar render', () => {
  beforeEach(() => {
    const item = initializeARWorkflow({
      id: 1,
      dataset_image: null,
      dataset_video_id: 1,
      dataset_video: buildDatasetVideoPayload({
        id: 1,
        annotate_as_video: true,
        total_frames: 5,
        original_filename: 'test.pdf',
        metadata: { type: 'pdf' }
      })
    })

    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)

    propsData.editor.activeView.loadedVideo = buildLoadedVideo({
      frames: {
        0: buildLoadedFrame({ seq: 1 }),
        1: buildLoadedFrame({ seq: 2 }),
        2: buildLoadedFrame({ seq: 3 }),
        3: buildLoadedFrame({ seq: 4 }),
        4: buildLoadedFrame({ seq: 5 })
      }
    })
  })

  describe('single frame annotations', () => {
    beforeEach(() => {
      const annotations = [
        buildStageAnnotationPayload({
          id: '1',
          workflow_stage_id: reviewStage.id,
          z_index: 1,
          annotation_class_id: annotationClasses[1].id,
          data: {
            frames: {
              0: {
                polygon: { path: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }] },
                auto_annotate: {
                  bbox: { x1: 0, y1: 0, x2: 10, y2: 10 },
                  clicks: [],
                  model: 'foo'
                },
                text: { text: 'text1' },
                keyframe: true
              }
            },
            segments: [[0, 1]],
            sub_frames: {},
            interpolated: false,
            interpolate_algorithm: undefined
          }
        }),
        buildStageAnnotationPayload({
          id: '2',
          workflow_stage_id: reviewStage.id,
          z_index: 2,
          annotation_class_id: annotationClasses[1].id,
          data: {
            frames: {
              0: {
                polygon: { path: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }] },
                auto_annotate: {
                  bbox: { x1: 0, y1: 0, x2: 10, y2: 10 },
                  clicks: [],
                  model: 'foo'
                },
                keyframe: true
              }
            },
            segments: [[1, 2]],
            sub_frames: {},
            interpolated: false,
            interpolate_algorithm: undefined
          }
        }),
        buildStageAnnotationPayload({
          id: '3',
          workflow_stage_id: reviewStage.id,
          z_index: 3,
          annotation_class_id: annotationClasses[1].id,
          data: {
            frames: {
              0: {
                polygon: { path: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }] },
                auto_annotate: {
                  bbox: { x1: 0, y1: 0, x2: 10, y2: 10 },
                  clicks: [],
                  model: 'foo'
                },
                keyframe: true
              }
            },
            segments: [[2, 3]],
            sub_frames: {},
            interpolated: false,
            interpolate_algorithm: undefined
          }
        })
      ]

      store.commit('workview/SET_STAGE_ANNOTATIONS', { stage: reviewStage, annotations })
    })

    it('should render annotations related to the current frame', () => {
      propsData.editor.activeView.jumpToFrame(1)

      const wrapper = mount(WorkflowLayerBar, { localVue, mocks, store, propsData })

      const items = wrapper.findAll('.layerbar-item')
      expect(items.length).toBe(1)
      expect(items.at(0).attributes('id')).toBe('layer__2')
    })
  })
})
