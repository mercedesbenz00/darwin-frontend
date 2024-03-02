import { createTestingPinia } from '@pinia/testing'
import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import { Transform } from 'panzoom'
import { PiniaVuePlugin } from 'pinia'
import Vue from 'vue'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildEdgePayload,
  buildV2WorkflowPayload,
  buildV2WorkflowStagePayload
} from 'test/unit/factories'

import StageSidebarTemplate from '@/components/Stages/StageSidebarTemplate/StageSidebarTemplate.vue'
import { StageType } from '@/store/types/StageType'
import { stageTheme } from '@/utils/workflowStageTheme'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(PiniaVuePlugin)

let wrapper: Wrapper<Vue>
let pinia: ReturnType<typeof createTestingPinia>

const propsData: { type: StageType, transform: Transform } = {
  type: StageType.Complete,
  transform: {
    scale: 1,
    x: 0,
    y: 0
  }
}

const workflow = buildV2WorkflowPayload({
  stages: [
    buildV2WorkflowStagePayload({
      type: StageType.Complete,
      edges: [buildEdgePayload({})]
    })
  ]
})

const mocks: { $route: { path: string, params: { workflowId: string } } } =
  { $route: { path: '/', params: { workflowId: workflow.id } } }

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  pinia = createTestingPinia()
  store = createTestStore()
  store.commit('v2Workflow/SET_WORKFLOW', { ...workflow, id: '1' })
  store.commit('v2Workflow/CLONE_WORKFLOW_TO_EDITED', '1')
  wrapper = shallowMount(StageSidebarTemplate, { localVue, pinia, propsData, store, mocks })
})

afterEach(() => {
  wrapper.destroy()
})

describe('Stage Sidebar Template UI', () => {
  it('should mount', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should display the correct title', async () => {
    await wrapper.setProps({
      type: 'review'
    })
    const buttonText = wrapper.find('.stage-wrapper').text()
    expect(buttonText).toBe(stageTheme.review.stageTitle)
  })

  it('should display no title when dragging', async () => {
    await wrapper.setProps({
      type: 'review'
    })
    const button = wrapper.find('.stage-wrapper')
    await button.trigger('mousedown')
    expect(button.text()).not.toBe(stageTheme.review.stageTitle)
  })

  it('should apply class when dragging', async () => {
    await wrapper.setProps({
      type: 'review'
    })
    const button = wrapper.find('.stage-wrapper')
    await button.trigger('mousedown')
    expect(button.attributes().class).toContain('stage-dragging')
  })

  it('should set class when dragging', async () => {
    await wrapper.setProps({
      type: 'review'
    })
    const button = wrapper.find('.stage-wrapper')

    expect(wrapper.find('button.stage-dragging').exists()).toBe(false)

    await button.trigger('mousedown')
    expect(wrapper.find('button.stage-dragging').exists()).toBe(true)
  })
})

describe('Stage Sidebar Template functionality', () => {
  it('should toggle isDragging on drag', async () => {
    await wrapper.setProps({
      type: 'review'
    })
    const button = wrapper.find('.stage-wrapper')
    expect(wrapper.find('button.stage-dragging').exists()).toBe(false)
    await button.trigger('mousedown')
    expect(wrapper.find('button.stage-dragging').exists()).toBe(true)
  })

  it('should emit onDragEnd on mouseup event', async () => {
    await wrapper.setProps({
      type: 'review'
    })
    const button = wrapper.find('.stage-wrapper')
    await button.trigger('mousedown')
    await Vue.nextTick()

    window.dispatchEvent(new Event('mouseup'))
  })

  it('should be disabled when stageLimit reached', () => {
    expect(wrapper.attributes().class).toContain('disabled')
  })
})
