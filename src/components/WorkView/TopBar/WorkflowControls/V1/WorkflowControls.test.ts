import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VTooltip from 'v-tooltip'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetItemPayload,
  buildDatasetPayload,
  buildUserPayload,
  buildWorkflowStagePayload
} from 'test/unit/factories'
import {
  initializeARTemplate,
  initializeARWorkflow,
  initializeBlindWorkflow
} from 'test/unit/factories/helpers'

import {
  DatasetItemStatus,
  StageType,
  UserPayload,
  WorkflowStagePayload
} from '@/store/types'
import { ErrorCodes } from '@/utils/error/errors'

import { WorkflowControls } from '.'

const localVue = createLocalVue()
localVue.use(VTooltip, { defaultHtml: true })
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

let mocks: {
  $can: () => boolean
  $route: { query: { image: string } }
  $router: { push: jest.Mock }
}

const sfh = buildDatasetPayload({ id: 5 })
const template = initializeARTemplate(sfh)

let user: UserPayload

const nextItem = buildDatasetItemPayload({ seq: 9999 })

beforeEach(() => {
  mocks = {
    $can: (): boolean => true,
    $route: { query: { image: '1' } },
    $router: { push: jest.fn() }
  }
  store = createTestStore()
  store.commit('workview/SET_DATASET', sfh)
  store.commit('workview/PUSH_WORKFLOW_TEMPLATE', template)
  user = buildUserPayload({ id: 99 })
  store.commit('user/SET_PROFILE', user)
})

// test factory functions

// once the data is setup, most tests execute in about the same way, so we re
// reuse factory functions to make it easier to read them

const itMatchesSnapshot = (): void => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(WorkflowControls, { localVue, mocks, store })
    expect(wrapper).toMatchSnapshot()
  })
}

const itSelfAssignsOnShiftEnter = (): void => {
  it('self-assigns on shift + enter', async () => {
    const stage = store.state.workview.selectedStageInstance
    const wrapper = shallowMount(WorkflowControls, { localVue, mocks, store })
    const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true })
    document.dispatchEvent(event)
    await wrapper.vm.$nextTick()
    expect(store.dispatch)
      .toHaveBeenCalledWith('workview/assignStage', { stage, userId: user.id })
  })
}

const itSelfAssignsOnContinue = (): void => {
  it('self-assigns on continue', async () => {
    const stage = store.state.workview.selectedStageInstance
    const wrapper = shallowMount(WorkflowControls, { localVue, mocks, store })
    await wrapper.find('continue-button-stub').vm.$emit('continue')
    expect(store.dispatch)
      .toHaveBeenCalledWith('workview/assignStage', { stage, userId: user.id })
  })
}

const itDispatchesActionOnShiftEnter = (action: string): void => {
  it('dispatches action on shift + enter', async () => {
    const stage = store.state.workview.selectedStageInstance
    const wrapper = shallowMount(WorkflowControls, { localVue, mocks, store })
    const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true })
    document.dispatchEvent(event)
    await wrapper.vm.$nextTick()
    expect(store.dispatch).toHaveBeenCalledWith(action, stage)
  })
}

const itDispatchesActionOnContinue = (action: String): void => {
  it('dispatches action on continue', async () => {
    const stage = store.state.workview.selectedStageInstance
    const wrapper = shallowMount(WorkflowControls, { localVue, mocks, store })
    await wrapper.find('continue-button-stub').vm.$emit('continue')
    expect(store.dispatch).toHaveBeenCalledWith(action, stage)
  })
}

const itDisablesContinueButtonWhileBusy = (): void => {
  it('disables continue button while busy', async () => {
    const wrapper = shallowMount(WorkflowControls, { localVue, mocks, store })
    await wrapper.find('continue-button-stub').vm.$emit('continue')
    expect(wrapper.find('continue-button-stub').attributes('disabled')).toBeTruthy()
    await flushPromises()
    expect(wrapper.find('continue-button-stub').attributes('disabled')).toBeFalsy()
  })
}

const itDispatchesToastOnError = (): void => {
  it('dispatches toast on error', async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'foo' } })
    const wrapper = shallowMount(WorkflowControls, { localVue, mocks, store })
    await wrapper.find('continue-button-stub').vm.$emit('continue')
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'foo' })
  })
}

const itResetsBusyStateOnError = (): void => {
  it('resets busy state on error', async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'foo' } })
    const wrapper = shallowMount(WorkflowControls, { localVue, mocks, store })
    await wrapper.find('continue-button-stub').vm.$emit('continue')
    await flushPromises()
    expect(wrapper.find('continue-button-stub').attributes('disabled')).toBeFalsy()
  })
}

const itGoesToNextItemOnContinue = (): void => {
  it('goes to next item on continue', async () => {
    const wrapper = shallowMount(WorkflowControls, { localVue, mocks, store })
    await wrapper.find('continue-button-stub').vm.$emit('continue')
    await flushPromises()
    expect(mocks.$router.push).toHaveBeenCalledWith({ query: { image: '9999' } })
  })
}

const itRendersRejectButton = (): void => it('renders reject button', () => {
  const wrapper = shallowMount(WorkflowControls, { localVue, mocks, store })
  expect(wrapper.find('stage-reject-button-stub').exists()).toBe(true)
})

const itDoesNotRenderRejectButton = (): void => it('does not render reject button', () => {
  const wrapper = shallowMount(WorkflowControls, { localVue, mocks, store })
  expect(wrapper.find('stage-reject-button-stub').exists()).toBe(false)
})

const itGoesToNextItemOnShiftEnter = (): void => {
  it('goes to next item on shift + enter', async () => {
    shallowMount(WorkflowControls, { localVue, mocks, store })
    const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true })
    document.dispatchEvent(event)
    await flushPromises()
    expect(mocks.$router.push).toHaveBeenCalledWith({ query: { image: '9999' } })
  })
}

const itRendersContinueButton = (): void => it('renders continue button', () => {
  const wrapper = shallowMount(WorkflowControls, { localVue, mocks, store })
  expect(wrapper.find('continue-button-stub').exists()).toBe(true)
})

const itRendersArchiveButton = (): void => it('renders archive button', () => {
  const wrapper = shallowMount(WorkflowControls, { localVue, mocks, store })
  expect(wrapper.find('stage-archive-button-stub').exists()).toBe(true)
})

// tests

describe('for item without workflow', () => {
  beforeEach(() => {
    const item = buildDatasetItemPayload({ id: 1, dataset_id: sfh.id })
    const stageTemplate = template.workflow_stage_templates.find(t => t.type === StageType.Annotate)
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    store.commit('workview/PUSH_DATASET_ITEMS', [item, nextItem])
    store.commit('workview/SET_SELECTED_STAGE_TEMPLATE', stageTemplate)
  })

  itMatchesSnapshot()

  describe('during time travel', () => {
    beforeEach(() => {
      const stageTemplate = template.workflow_stage_templates.find(t => t.type === StageType.Review)
      store.commit('workview/SET_SELECTED_STAGE_TEMPLATE', stageTemplate)
    })

    itMatchesSnapshot()
  })

  describe('no access rights', () => {
    beforeEach(() => { mocks.$can = (): boolean => false })
    itMatchesSnapshot()
  })
})

describe('for item in AR workflow, annotate stage', () => {
  let stage: WorkflowStagePayload

  const item = initializeARWorkflow(
    { current_workflow_id: 5, dataset_id: sfh.id, id: 1, status: DatasetItemStatus.annotate },
    template
  )

  beforeEach(() => {
    stage = item.current_workflow!.stages[1][0]
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    store.commit('workview/PUSH_DATASET_ITEMS', [item, nextItem])
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
  })

  describe('assigned', () => {
    beforeEach(() => {
      stage.assignee_id = user.id
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })

    itMatchesSnapshot()
    itDispatchesActionOnShiftEnter('workview/setStageAutoComplete')
    itDispatchesActionOnContinue('workview/setStageAutoComplete')
    itDispatchesToastOnError()
    itResetsBusyStateOnError()
    itGoesToNextItemOnContinue()
    itDisablesContinueButtonWhileBusy()
    itGoesToNextItemOnShiftEnter()
  })

  describe('during time travel', () => {
    beforeEach(() => {
      stage = item.current_workflow!.stages[2][0]
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })

    itMatchesSnapshot()
  })

  describe('unassigned, not admin', () => {
    beforeEach(() => {
      stage = { ...stage, assignee_id: null }
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
      mocks.$can = (): boolean => false
    })
    itMatchesSnapshot()
  })

  describe('unassigned, admin', () => {
    beforeEach(() => {
      stage = { ...stage, assignee_id: null }
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })

    itMatchesSnapshot()
    itSelfAssignsOnShiftEnter()
    itSelfAssignsOnContinue()
    itDispatchesToastOnError()
    itResetsBusyStateOnError()
    itGoesToNextItemOnContinue()
    itDisablesContinueButtonWhileBusy()
    itGoesToNextItemOnShiftEnter()
  })
})

describe('for item in AR workflow, review stage', () => {
  let stage: WorkflowStagePayload

  const item = initializeARWorkflow(
    { current_workflow_id: 5, dataset_id: sfh.id, id: 1, status: DatasetItemStatus.review },
    template
  )

  beforeEach(() => {
    stage = item.current_workflow!.stages[2][0]
    item.current_workflow!.current_stage_number = stage.number
    item.current_workflow!.current_workflow_stage_template_id = stage.workflow_stage_template_id
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    store.commit('workview/PUSH_DATASET_ITEMS', [item, nextItem])
  })

  describe('assigned', () => {
    beforeEach(() => {
      stage.assignee_id = user.id
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })

    itMatchesSnapshot()

    itDispatchesActionOnShiftEnter('workview/approveStage')
    itDispatchesActionOnContinue('workview/approveStage')
    itDispatchesToastOnError()
    itResetsBusyStateOnError()
    itGoesToNextItemOnContinue()
    itDisablesContinueButtonWhileBusy()
    itGoesToNextItemOnShiftEnter()
    itRendersArchiveButton()
    itRendersRejectButton()
    itRendersContinueButton()
  })

  describe('during time travel', () => {
    beforeEach(() => {
      stage = item.current_workflow!.stages[1][0]
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })

    itMatchesSnapshot()
  })

  describe('unassigned, not admin', () => {
    beforeEach(() => {
      stage = { ...stage, assignee_id: null }
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
      mocks.$can = (): boolean => false
    })

    itMatchesSnapshot()
  })

  describe('unassigned, admin', () => {
    beforeEach(() => {
      stage = { ...stage, assignee_id: null }
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })

    itMatchesSnapshot()
    itSelfAssignsOnShiftEnter()
    itSelfAssignsOnContinue()
    itDispatchesToastOnError()
    itResetsBusyStateOnError()
    itGoesToNextItemOnContinue()
    itDisablesContinueButtonWhileBusy()
    itGoesToNextItemOnShiftEnter()
  })
})

describe('for item in AR workflow, complete stage', () => {
  const item = initializeARWorkflow(
    { current_workflow_id: 5, dataset_id: sfh.id, id: 1, status: DatasetItemStatus.complete },
    template
  )

  beforeEach(() => {
    const stage = item.current_workflow!.stages[3][0]
    item.current_workflow!.current_stage_number = stage.number
    item.current_workflow!.current_workflow_stage_template_id = stage.workflow_stage_template_id
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    store.commit('workview/PUSH_DATASET_ITEMS', [item, nextItem])
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
  })

  itMatchesSnapshot()

  describe('during time travel', () => {
    beforeEach(() => {
      const stage = item.current_workflow!.stages[1][0]
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })

    itMatchesSnapshot()
  })

  describe('no access rights', () => {
    beforeEach(() => { mocks.$can = (): boolean => false })
    itMatchesSnapshot()
  })

  it('shows storage modal on storage lockout error', async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({
      error: {
        code: ErrorCodes.OUT_OF_SUBSCRIBED_STORAGE,
        message: 'foo'
      }
    })

    const wrapper = shallowMount(WorkflowControls, { localVue, mocks, store })

    await wrapper.find('continue-button-stub').vm.$emit('restart')
    await flushPromises()
    expect(store.state.billing.outOfStorageDialogShown).toBe(true)
  })
})

describe('for archived item', () => {
  const item = initializeARWorkflow(
    { archived: true, id: 1, dataset_id: sfh.id, status: DatasetItemStatus.archived },
    template
  )

  beforeEach(() => {
    const stage = item.current_workflow!.stages[2][0]
    item.current_workflow!.current_stage_number = stage.number
    item.current_workflow!.current_workflow_stage_template_id = stage.workflow_stage_template_id
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    store.commit('workview/PUSH_DATASET_ITEMS', [item, nextItem])
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', item.current_workflow!.stages[2][0])
  })

  itMatchesSnapshot()

  describe('during time travel', () => {
    beforeEach(() => {
      const stage = item.current_workflow!.stages[1][0]
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })

    itMatchesSnapshot()
  })

  describe('no access rights', () => {
    beforeEach(() => { mocks.$can = (): boolean => false })
    itMatchesSnapshot()
  })
})

describe('for item in AA T R C workflow', () => {
  const item = initializeBlindWorkflow()

  beforeEach(() => {
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    store.commit('workview/PUSH_DATASET_ITEMS', [item, nextItem])
  })

  describe('annotate stage', () => {
    beforeEach(() => {
      const stage = item.current_workflow!.stages[1][0]
      stage.assignee_id = user.id
      item.current_workflow!.current_stage_number = stage.number
      item.current_workflow!.current_workflow_stage_template_id = stage.workflow_stage_template_id
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })

    itMatchesSnapshot()
  })

  describe('annotate stage, ready for completion', () => {
    beforeEach(() => {
      const stage = item.current_workflow!.stages[1][0]
      stage.assignee_id = user.id
      stage.metadata.ready_for_completion = true
      item.current_workflow!.current_stage_number = stage.number
      item.current_workflow!.current_workflow_stage_template_id = stage.workflow_stage_template_id
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })

    itMatchesSnapshot()

    it('sets "waiting" on continue button', () => {
      const wrapper = shallowMount(WorkflowControls, { localVue, mocks, store })
      expect(wrapper.find('continue-button-stub').props('waiting')).toBe(true)
    })
  })

  describe('review stage', () => {
    beforeEach(() => {
      const stage = item.current_workflow!.stages[3][0]
      stage.assignee_id = user.id
      item.current_workflow!.current_stage_number = stage.number
      item.current_workflow!.current_workflow_stage_template_id = stage.workflow_stage_template_id
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })
    itMatchesSnapshot()
    itRendersArchiveButton()
    itRendersContinueButton()
    itDoesNotRenderRejectButton()

    it('should return false for isBlindReview when the review stage is the first stage', () => {
      const item = buildDatasetItemPayload({
        id: 1,
        current_workflow_id: 1,
        current_workflow: {
          current_stage_number: 1,
          current_workflow_stage_template_id: 1,
          workflow_template_id: 1,
          status: DatasetItemStatus.complete,
          id: 1,
          dataset_item_id: 1,
          stages: {
            1: [buildWorkflowStagePayload({ type: StageType.Review })],
            2: [buildWorkflowStagePayload({ type: StageType.Complete })]
          }
        }
      })

      store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', item.current_workflow!.stages[1][0])

      const wrapper = shallowMount(WorkflowControls, { localVue, mocks, store })
      expect((wrapper.vm as any).isBlindReview).toBeFalsy()
    })
  })
})
