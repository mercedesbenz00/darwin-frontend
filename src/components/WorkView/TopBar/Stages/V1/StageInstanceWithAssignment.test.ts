import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildMembershipPayload, buildUserPayload } from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'
import {
  itemAlreadyInWorkflowError,
  outOfSubscribedStorageError
} from 'test/unit/fixtures/errors'
import { StageItem } from 'test/unit/stubs'
import { emitRootStub } from 'test/unit/testHelpers'

import StageInstanceWithAssignment from '@/components/WorkView/TopBar/Stages/V1/StageInstanceWithAssignment.vue'
import {
  DatasetItemPayload,
  DatasetItemStatus,
  WorkflowStagePayload
} from '@/store/types'

const stubs = { StageItem }

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.directive('tooltip', () => { })

let store: ReturnType<typeof createTestStore>
let item: DatasetItemPayload

let propsData: {
  instance: WorkflowStagePayload
}

const model = {
  restartButton: 'refresh-icon-stub'
}

beforeEach(() => {
  item = initializeARWorkflow(item)
  const instance = item.current_workflow!.stages[1][0]
  store = createTestStore()
  store.commit('workview/PUSH_DATASET_ITEMS', [item])
  store.commit('user/SET_PROFILE', buildUserPayload({ id: instance.assignee_id || 1 }))

  propsData = { instance }
})

const itMatchesSnapshot = (): void => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(StageInstanceWithAssignment, { localVue, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })
}

itMatchesSnapshot()

describe('when instance is future', () => {
  beforeEach(() => {
    propsData.instance = item.current_workflow!.stages[2][0]
  })

  describe('when assigned', () => {
    beforeEach(() => {
      propsData.instance.assignee_id = 1
    })

    itMatchesSnapshot()

    it('renders time summary', () => {
      const wrapper = shallowMount(StageInstanceWithAssignment, {
        localVue,
        propsData,
        store,
        stubs
      })
      expect(wrapper.find('time-summary-stub').exists()).toBe(true)
    })
  })

  describe('when not assigned', () => {
    beforeEach(() => {
      propsData.instance.assignee_id = null
    })

    itMatchesSnapshot()

    it('does not render time summary', async () => {
      const wrapper = shallowMount(StageInstanceWithAssignment, {
        localVue,
        propsData,
        store,
        stubs
      })
      await flushPromises()
      expect(wrapper.find('time-summary-stub').exists()).toBe(false)
    })
  })
})

describe('when restartable', () => {
  beforeEach(() => {
    item = { ...item, status: DatasetItemStatus.complete }
    propsData.instance = item.current_workflow!.stages[3][0]
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', propsData.instance)
  })

  itMatchesSnapshot()

  it(
    `shows storage modal if restarting fails with ${outOfSubscribedStorageError.code}`,
    async () => {
      jest.spyOn(store, 'dispatch').mockResolvedValue({ error: outOfSubscribedStorageError })

      const wrapper = shallowMount(StageInstanceWithAssignment, { localVue, propsData, store })

      await wrapper.find(model.restartButton).vm.$emit('click', new Event('click'))
      await flushPromises()
      expect(store.state.billing.outOfStorageDialogShown).toBe(true)
    }
  )
})

it('dispatches to assign stage on assignment selection', () => {
  const wrapper = shallowMount(StageInstanceWithAssignment, { localVue, propsData, store })
  const member = buildMembershipPayload({ id: 1 })
  emitRootStub(wrapper, 'assign', member)

  expect(store.dispatch).toHaveBeenCalledWith('workview/assignStage', {
    stage: propsData.instance,
    userId: member.user_id
  })
})

it('dispatches error if assignment fails', async () => {
  jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'Fake error' } })
  const wrapper = shallowMount(StageInstanceWithAssignment, { localVue, propsData, store })
  const member = buildMembershipPayload({ id: 1 })
  emitRootStub(wrapper, 'assign', member)

  await flushPromises()

  expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake error' })
})

it(
  `dispatches custom error if assignment fails with ${itemAlreadyInWorkflowError.code}`,
  async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: itemAlreadyInWorkflowError })
    const wrapper = shallowMount(StageInstanceWithAssignment, { localVue, propsData, store })
    const member = buildMembershipPayload({ id: 1 })
    emitRootStub(wrapper, 'assign', member)

    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', {
      content: expect.stringContaining('already assigned to a different stage')
    })
  }
)
