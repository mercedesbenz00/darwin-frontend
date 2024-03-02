import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildWorkflowStagePayload
} from 'test/unit/factories'
import { triggerRootStub } from 'test/unit/testHelpers'

import DeleteAllVisibleAnnotations from '@/components/WorkView/LayerBar/AnnotationControl/DeleteAllVisibleAnnotations.vue'
import { StageType, WorkflowStagePayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>
let mocks: { $modal: { show: Function } }
let selectedStage: WorkflowStagePayload

beforeEach(() => {
  store = createTestStore()
  mocks = {
    $modal: { show: jest.fn() }
  }
})

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(DeleteAllVisibleAnnotations, { localVue, mocks, store })
  expect(wrapper).toMatchSnapshot()
})

describe('not complete stage', () => {
  beforeEach(() => {
    selectedStage = buildWorkflowStagePayload()
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', selectedStage)
  })

  itMatchesSnapshot()

  it('opens the modal and emits `close` when clicked', async () => {
    const wrapper = shallowMount(DeleteAllVisibleAnnotations, { localVue, mocks, store })
    await triggerRootStub(wrapper, 'click')
    expect(mocks.$modal.show).toBeCalled()
    expect(wrapper.emitted().close).toHaveLength(1)
  })
})

describe('complete stage', () => {
  beforeEach(() => {
    selectedStage = buildWorkflowStagePayload({ type: StageType.Complete })
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', selectedStage)
  })

  itMatchesSnapshot()

  it('never opens the modal when clicked', async () => {
    const wrapper = shallowMount(DeleteAllVisibleAnnotations, { localVue, mocks, store })
    await triggerRootStub(wrapper, 'click')
    expect(mocks.$modal.show).not.toBeCalled()
    expect(wrapper.emitted().close).toHaveLength(1)
  })
})

it('shows the "Delete all visible annotations" button if Workflows V1', () => {
  const wrapper = shallowMount(DeleteAllVisibleAnnotations, { localVue, mocks, store })
  expect(wrapper.find('.annotation-control-delete').exists()).toBeTruthy()
})
