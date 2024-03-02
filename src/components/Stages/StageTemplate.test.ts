import { createTestingPinia } from '@pinia/testing'
import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import { PiniaVuePlugin } from 'pinia'
import Vuex from 'vuex'

import {
  buildV2WorkflowPayload,
  buildV2WorkflowStagePayload
} from 'test/unit/factories'

import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'
import { StageType } from '@/store/types/StageType'
import { V2WorkflowStagePayload } from '@/store/types/V2WorkflowStagePayload'

import StageTemplate from './StageTemplate.vue'

let wrapper: Wrapper<Vue>
const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(PiniaVuePlugin)

const workflow = buildV2WorkflowPayload({
  stages: [
    buildV2WorkflowStagePayload({
      type: StageType.Annotate
    })
  ]
})

let propsData: { scale: number, stage: V2WorkflowStagePayload; selected: boolean }

let pinia: ReturnType<typeof createTestingPinia>
let scene: ReturnType<typeof useWorkflowSceneStore>
const store = new Vuex.Store({})

beforeEach(() => {
  pinia = createTestingPinia()
  scene = useWorkflowSceneStore()
  scene.setZoomScale(1.5)

  propsData = {
    scale: 1,
    stage: workflow.stages[0],
    selected: false
  }
  wrapper = shallowMount(StageTemplate, {
    pinia,
    propsData,
    localVue,
    store,
    stubs: {
      'stage-edge': true,
      'vue-draggable-resizable': true
    }
  })
})

afterEach(() => {
  wrapper.destroy()
})

describe('StageCanvasTemplate', () => {
  it('should mount', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should display the correct default title', () => {
    expect(wrapper.find('.stage__head__content__title').text()).toBe('Annotate')
  })

  it('should display the correct manual set title', async () => {
    await wrapper.setProps({
      stage: {
        ...workflow.stages[0],
        name: 'Stage Test'
      },
      selected: false
    })
    expect(wrapper.find('.stage__head__content__title').text()).toBe('Stage Test')
  })
})
