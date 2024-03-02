import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildMembershipPayload,
  buildTeamPayload,
  buildV2DARCWorkflow,
  buildV2WorkflowItemStatePayload,
  buildV2WorkflowStageInstancePayload
} from 'test/unit/factories'
import Model from 'test/unit/pageModels/Model'
import { VPopover } from 'test/unit/stubs'

import {
  MembershipPayload,
  V2InstanceStatus,
  V2WorkflowItemStatePayload,
  V2WorkflowPayload,
  V2WorkflowStageInstancePayload,
  V2WorkflowStagePayload
} from '@/store/types'

import { V2StageItem, StageProps } from '.'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

let workflow: V2WorkflowPayload
let instance: V2WorkflowStageInstancePayload
let itemState: V2WorkflowItemStatePayload
let stage: V2WorkflowStagePayload

let propsData: StageProps

let mocks: { $can: () => boolean }
const stubs = { 'v-popover': VPopover }

class PageModel extends Model {
  get avatar (): Wrapper<Vue> {
    return this.wrapper.find('team-member-avatar-stub')
  }

  get assignmentDropdown (): { wrapper: Wrapper<Vue>, exists: boolean, assign: Function } {
    const wrapper = this.wrapper.find('assignment-dropdown-stub')
    return {
      wrapper,
      exists: wrapper.exists(),
      assign: (member: MembershipPayload): Vue => {
        return wrapper.vm.$emit('assign', member)
      }
    }
  }
}

beforeEach(() => {
  mocks = { $can: (): boolean => true }
  store = createTestStore()

  workflow = buildV2DARCWorkflow()
  stage = workflow.stages[0]
  instance = buildV2WorkflowStageInstancePayload({ stage })
  itemState = buildV2WorkflowItemStatePayload({
    current_stage_instances: [instance],
    workflow
  })

  propsData = {
    data: { stage, instance, key: 'foo', followers: [] }
  }

  store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', itemState)
  store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)

  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 7 }))
  store.commit('team/SET_MEMBERSHIPS', [buildMembershipPayload({ team_id: 7, user_id: 1 })])
})

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(V2StageItem, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

const itMatchesSnapshotWithTimeSummary = (): void => it('matches snapshot when shows time summary', async () => {
  const wrapper = shallowMount(V2StageItem, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
  await wrapper.find('div.stage-item').trigger('mouseover')
  expect(wrapper).toMatchSnapshot('hover')
})

const itIsSelected = (): void => it('render selected', () => {
  const wrapper = shallowMount(V2StageItem, { localVue, mocks, propsData, store, stubs })
  expect(wrapper.attributes().class.includes('stage-item--selected')).toBe(true)
})

const itIsActive = (): void => it('render active', () => {
  const wrapper = shallowMount(V2StageItem, { localVue, mocks, propsData, store, stubs })
  expect(wrapper.attributes().class.includes('stage-item--active')).toBe(true)
})

const itDoesNotRenderAvatar = (): void => it('does not render avatar', () => {
  const wrapper = shallowMount(V2StageItem, { localVue, mocks, propsData, store, stubs })
  const model = new PageModel(wrapper)
  expect(model.avatar.exists()).toBe(false)
})

const itRendersAvatar = (): void => it('renders avatar', () => {
  const wrapper = shallowMount(V2StageItem, { localVue, mocks, propsData, store, stubs })
  const model = new PageModel(wrapper)
  expect(model.avatar.exists()).toBe(true)
})

const itRendersAssignment = (): void => it('renders assignment', () => {
  const wrapper = shallowMount(V2StageItem, { localVue, mocks, propsData, store, stubs })
  const model = new PageModel(wrapper)
  expect(model.assignmentDropdown.exists).toBe(true)
})

const itDoesNotRenderAssignment = (): void => it('does not render assignment', () => {
  const wrapper = shallowMount(V2StageItem, { localVue, mocks, propsData, store, stubs })
  const model = new PageModel(wrapper)

  expect(model.assignmentDropdown.exists).toBe(false)
})

const itDispatchesActionToAssign = (): void => it('dispatches action to assign', async () => {
  const wrapper = shallowMount(V2StageItem, { localVue, mocks, propsData, store, stubs })
  const model = new PageModel(wrapper)
  const member = buildMembershipPayload()
  await model.assignmentDropdown.assign(member)
  expect(store.dispatch).toHaveBeenCalledWith('workview/assignV2Stage', {
    stage: propsData.data.stage,
    member
  })
})

describe('dataset stage', () => {
  beforeEach(() => {
    stage = workflow.stages[0]
    propsData.data.stage = stage
  })

  describe('uninstantiated', () => {
    beforeEach(() => {
      store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', null)
    })
    itMatchesSnapshot()
    itDoesNotRenderAvatar()
    itDoesNotRenderAssignment()
  })

  describe('unassigned', () => {
    beforeEach(() => {
      const instance = buildV2WorkflowStageInstancePayload({ stage })
      propsData.data.instance = instance
    })

    itMatchesSnapshot()
    itDoesNotRenderAvatar()
    itDoesNotRenderAssignment()
  })

  describe('in tutorial mode', () => {
    beforeEach(() => {
      const instance = buildV2WorkflowStageInstancePayload({ stage })
      propsData.data.instance = instance
      mocks.$can = (): boolean => true
      store.commit('workview/SET_TUTORIAL_MODE', true)
    })

    itMatchesSnapshot()
    itDoesNotRenderAvatar()
    itDoesNotRenderAssignment()
  })

  describe('past', () => {
    beforeEach(() => {
      const instance = buildV2WorkflowStageInstancePayload({
        stage,
        status: V2InstanceStatus.Completed
      })
      propsData.data.instance = instance
      mocks.$can = (): boolean => false
    })

    itMatchesSnapshot()
    itDoesNotRenderAssignment()
  })
})

describe('annotate stage', () => {
  beforeEach(() => {
    stage = workflow.stages[1]
    propsData.data.stage = stage
  })

  describe('uninstantiated', () => {
    beforeEach(() => {
      store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', null)
    })
    itMatchesSnapshot()
    itDoesNotRenderAvatar()
    itDoesNotRenderAssignment()
  })

  describe('unassigned', () => {
    beforeEach(() => {
      const instance = buildV2WorkflowStageInstancePayload({ stage })
      propsData.data.instance = instance
    })

    itMatchesSnapshot()
    itDoesNotRenderAvatar()
  })

  describe('pre-assigned', () => {
    beforeEach(() => {
      propsData.data.instance = null
      store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', {
        ...itemState,
        designated_assignees: {
          [stage.id]: 1
        }
      })
    })
    itMatchesSnapshot()
    itRendersAvatar()
  })

  describe('assigned', () => {
    beforeEach(() => {
      const instance = buildV2WorkflowStageInstancePayload({ stage, user_id: 1 })
      propsData.data.instance = instance
    })

    itMatchesSnapshot()
    itRendersAvatar()
  })

  describe('when user can assign', () => {
    beforeEach(() => {
      const instance = buildV2WorkflowStageInstancePayload({ stage })
      propsData.data.instance = instance
      mocks.$can = (): boolean => true
    })

    itMatchesSnapshot()
    itRendersAssignment()
    itDispatchesActionToAssign()
  })

  describe('when user cannot assign', () => {
    beforeEach(() => {
      const instance = buildV2WorkflowStageInstancePayload({ stage })
      propsData.data.instance = instance
      mocks.$can = (): boolean => false
    })

    itMatchesSnapshot()
    itDoesNotRenderAssignment()
  })

  describe('in tutorial mode', () => {
    beforeEach(() => {
      const instance = buildV2WorkflowStageInstancePayload({ stage })
      propsData.data.instance = instance
      mocks.$can = (): boolean => true
      store.commit('workview/SET_TUTORIAL_MODE', true)
    })

    itMatchesSnapshot()
    itDoesNotRenderAssignment()
  })

  describe('past', () => {
    beforeEach(() => {
      const instance = buildV2WorkflowStageInstancePayload({
        stage,
        status: V2InstanceStatus.Completed
      })
      propsData.data.instance = instance
      mocks.$can = (): boolean => false
    })

    itMatchesSnapshot()
    itDoesNotRenderAssignment()
  })
})

describe('review stage', () => {
  beforeEach(() => {
    stage = workflow.stages[2]
    propsData.data.stage = stage
  })

  describe('uninstantiated', () => {
    beforeEach(() => {
      store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', null)
    })

    itMatchesSnapshot()
    itMatchesSnapshotWithTimeSummary()
    itDoesNotRenderAvatar()
    itDoesNotRenderAssignment()
  })

  describe('unassigned', () => {
    beforeEach(() => {
      const instance = buildV2WorkflowStageInstancePayload({ stage })
      propsData.data.instance = instance
    })

    itMatchesSnapshot()
    itDoesNotRenderAvatar()
    itRendersAssignment()
  })

  describe('pre-assigned', () => {
    beforeEach(() => {
      propsData.data.instance = null
      store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', {
        ...itemState,
        designated_assignees: {
          [stage.id]: 1
        }
      })
    })
    itMatchesSnapshot()
    itRendersAvatar()
    itRendersAssignment()
  })

  describe('assigned', () => {
    beforeEach(() => {
      const instance = buildV2WorkflowStageInstancePayload({ stage, user_id: 1 })
      propsData.data.instance = instance
    })

    itMatchesSnapshot()
    itRendersAvatar()
    itRendersAssignment()
  })

  describe('when user can assign', () => {
    beforeEach(() => {
      const instance = buildV2WorkflowStageInstancePayload({ stage })
      propsData.data.instance = instance
      mocks.$can = (): boolean => true
    })

    itMatchesSnapshot()
    itRendersAssignment()
    itDispatchesActionToAssign()
  })

  describe('when user cannot assign', () => {
    beforeEach(() => {
      const instance = buildV2WorkflowStageInstancePayload({ stage })
      propsData.data.instance = instance
      mocks.$can = (): boolean => false
    })

    itMatchesSnapshot()
    itDoesNotRenderAssignment()
  })

  describe('in tutorial mode', () => {
    beforeEach(() => {
      const instance = buildV2WorkflowStageInstancePayload({ stage })
      propsData.data.instance = instance
      mocks.$can = (): boolean => true
      store.commit('workview/SET_TUTORIAL_MODE', true)
    })

    itMatchesSnapshot()
    itDoesNotRenderAssignment()
  })

  describe('past', () => {
    beforeEach(() => {
      const instance = buildV2WorkflowStageInstancePayload({
        stage,
        status: V2InstanceStatus.Completed
      })
      propsData.data.instance = instance
      mocks.$can = (): boolean => false
    })

    itMatchesSnapshot()
    itDoesNotRenderAssignment()
  })
})

describe('complete stage', () => {
  beforeEach(() => {
    stage = workflow.stages[3]
    propsData.data.stage = stage
  })

  describe('uninstantiated', () => {
    beforeEach(() => {
      store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', null)
    })

    itMatchesSnapshot()
    itDoesNotRenderAvatar()
    itDoesNotRenderAssignment()
  })

  describe('unassigned', () => {
    beforeEach(() => {
      const instance = buildV2WorkflowStageInstancePayload({ stage })
      propsData.data.instance = instance
    })

    itMatchesSnapshot()
    itDoesNotRenderAvatar()
    itDoesNotRenderAssignment()
  })

  describe('when user can assign', () => {
    beforeEach(() => {
      const instance = buildV2WorkflowStageInstancePayload({ stage })
      propsData.data.instance = instance
      mocks.$can = (): boolean => true
    })

    itMatchesSnapshot()
    itDoesNotRenderAssignment()
  })

  describe('when stage is selected', () => {
    beforeEach(() => {
      propsData.selected = true
    })

    itMatchesSnapshot()
    itIsSelected()
  })

  describe('when stage is active', () => {
    beforeEach(() => {
      propsData.selected = true
    })

    itMatchesSnapshot()
    itIsActive()
  })
})
