import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetItemPayload,
  buildMembershipPayload,
  buildUserPayload,
  buildWorkflowStagePayload
} from 'test/unit/factories'
import { initializeARWorkflow, initializeARTemplate } from 'test/unit/factories/helpers'

import StageOverlay from '@/components/WorkView/StageOverlay.vue'
import {
  DatasetItemPayload,
  DatasetItemStatus,
  ReviewStatus,
  UserPayload,
  WorkflowStagePayload,
  WorkflowTemplatePayload,
  StageType
} from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let wrapper: Wrapper<Vue>

let item: DatasetItemPayload
let stage: WorkflowStagePayload
let andrea: UserPayload

beforeEach(() => {
  item = buildDatasetItemPayload({ id: 1 })
  store = createTestStore()
  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)

  andrea = buildUserPayload({ id: 99, first_name: 'Andrea' })
  store.commit('user/SET_PROFILE', andrea)
  wrapper = shallowMount(StageOverlay, { localVue, store })
})

const centerText = (wrapper: Wrapper<Vue>) =>
  wrapper.find('.stage-overlay__center-label').text()

const topText = (wrapper: Wrapper<Vue>) =>
  wrapper.find('.stage-overlay__top-label').text()

describe('when item archived', () => {
  beforeEach(() => {
    item = buildDatasetItemPayload({
      id: 1,
      archived: true,
      archived_reason: 'Motion Blur',
      status: DatasetItemStatus.archived
    })

    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
  })

  it('matches snapshot', () => expect(wrapper).toMatchSnapshot())
  it('renders overlay', () => expect(wrapper.html()).toBeDefined())
  it('renders "Archived" on top', () => expect(topText(wrapper)).toEqual('Archived'))
  it('renders reason on center', () => expect(centerText(wrapper)).toEqual('Motion Blur'))
})

describe('when in current stage', () => {
  beforeEach(() => {
    item = initializeARWorkflow({ id: 1, status: DatasetItemStatus.annotate })
  })

  describe('when stage is annotate', () => {
    beforeEach(() => {
      item.current_workflow!.current_stage_number = 1
      item.status = DatasetItemStatus.annotate
      stage = item.current_workflow!.stages[1][0]

      store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
      store.commit('workview/PUSH_DATASET_ITEMS', [item])
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })

    it('matches snapshot', () => expect(wrapper).toMatchSnapshot())

    it('renders default overlay', () => {
      expect(wrapper.find('.stage-overlay--none').exists()).toBe(true)
    })
    it('should return empty array for previousAssignees', () => {
      expect((wrapper.vm as any).previousAssignees).toEqual([])
    })

    describe('when skipped', () => {
      beforeEach(() => {
        stage.skipped = true
        stage.skipped_reason = 'Motion Blur'
        store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
      })

      it('matches snapshot', () => expect(wrapper).toMatchSnapshot())
      it('renders overlay', () => expect(wrapper.html()).toBeDefined())
      it('renders "Discarded" on top', () => expect(topText(wrapper)).toEqual('Discarded'))
      it('renders reason on center', () => expect(centerText(wrapper)).toEqual('Motion Blur'))
    })

    describe('when assigned to someone else', () => {
      beforeEach(() => {
        const sam = buildMembershipPayload({ id: 1, user_id: 2, first_name: 'Sam' })
        store.commit('team/SET_MEMBERSHIPS', [sam])
        stage.assignee_id = sam.user_id
        store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
      })

      it('matches snapshot', () => expect(wrapper).toMatchSnapshot())
      it('renders overlay', () => expect(wrapper.html()).toBeDefined())

      it('renders "Assigned to {name}" on top', () => {
        expect(topText(wrapper)).toEqual('Assigned to Sam')
      })

      it('does not render center button', () => {
        expect(wrapper.find('.stage-overlay__center-label').exists()).toBe(false)
      })
    })
  })

  describe('when stage is review', () => {
    beforeEach(() => {
      item.current_workflow!.current_stage_number = 2
      item.status = DatasetItemStatus.review
      stage = item.current_workflow!.stages[2][0]

      store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
      store.commit('workview/PUSH_DATASET_ITEMS', [item])
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })

    it('renders overlay', () => expect(wrapper.html()).toBeDefined())

    describe('when no previous stage assignee', () => {
      it('matches snapshot', () => expect(wrapper).toMatchSnapshot())
      it('renders "Reviewing" on top', () => expect(topText(wrapper)).toEqual('Reviewing'))

      it('does not render center button', () => {
        expect(wrapper.find('.stage-overlay__center-label').exists()).toBe(false)
      })
    })

    describe('when single previous stage assignee', () => {
      beforeEach(() => {
        const sam = buildMembershipPayload({ id: 1, user_id: 2, first_name: 'Sam' })
        store.commit('team/SET_MEMBERSHIPS', [sam])
        item.current_workflow!.stages[1][0].assignee_id = sam.user_id
        store.commit('workview/PUSH_DATASET_ITEMS', [item])
      })

      it('matches snapshot', () => expect(wrapper).toMatchSnapshot())
      it('renders "Reviewing: {name}" on top', () => expect(topText(wrapper)).toEqual('Reviewing Sam'))

      it('does not render center button', () => {
        expect(wrapper.find('.stage-overlay__center-label').exists()).toBe(false)
      })
    })

    describe('when multiple previous stage assignees', () => {
      beforeEach(() => {
        const sam = buildMembershipPayload({ id: 1, user_id: 2, first_name: 'Sam' })
        const jim = buildMembershipPayload({ id: 4, user_id: 3, first_name: 'Jim' })
        store.commit('team/SET_MEMBERSHIPS', [sam, jim])

        const oldStage = item.current_workflow!.stages[1][0]
        item.current_workflow!.stages[1] = [
          { ...oldStage, id: 1, assignee_id: sam.user_id },
          { ...oldStage, id: 2, assignee_id: jim.user_id }
        ]
        store.commit('workview/PUSH_DATASET_ITEMS', [item])
      })

      it('matches snapshot', () => expect(wrapper).toMatchSnapshot())

      it('renders "Reviewing: {names}" on top', () => {
        expect(topText(wrapper)).toEqual('Reviewing Sam, Jim')
      })

      it('does not render center button', () => {
        expect(wrapper.find('.stage-overlay__center-label').exists()).toBe(false)
      })
    })

    describe('when rejected', () => {
      beforeEach(() => {
        stage.metadata.review_status = ReviewStatus.Rejected
        store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
        wrapper = shallowMount(StageOverlay, { localVue, store })
      })

      it('matches snapshot', () => expect(wrapper).toMatchSnapshot())
      it('renders "Reviewing" on top', () => expect(topText(wrapper)).toEqual('Reviewing'))
      it('renders "Rejected" in center', () => expect(centerText(wrapper)).toEqual('Rejected'))
    })

    describe('when archived', () => {
      beforeEach(() => {
        stage.metadata.review_status = ReviewStatus.Archived
        store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
        wrapper = shallowMount(StageOverlay, { localVue, store })
      })

      it('matches snapshot', () => expect(wrapper).toMatchSnapshot())

      it('renders "Reviewing" on top', () => expect(topText(wrapper)).toEqual('Reviewing'))
      it('renders "Archived" in center', () => expect(centerText(wrapper)).toEqual('Archived'))
    })

    describe('when skipped and approved', () => {
      beforeEach(() => {
        stage.metadata.review_status = ReviewStatus.Approved
        stage.skipped = true
        stage.skipped_reason = 'Motion Blur'
        store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
        wrapper = shallowMount(StageOverlay, { localVue, store })
      })

      it('matches snapshot', () => expect(wrapper).toMatchSnapshot())
      it('renders "Reviewing" on top', () => expect(topText(wrapper)).toEqual('Reviewing'))
      it('renders "Archived: {reason}" in center', () => expect(centerText(wrapper)).toEqual('Archived: Motion Blur'))
    })

    describe('when assigned to someone else', () => {
      beforeEach(() => {
        const sam = buildMembershipPayload({ id: 1, user_id: 2, first_name: 'Sam' })
        store.commit('team/SET_MEMBERSHIPS', [sam])
        stage.assignee_id = sam.user_id
        store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
      })

      it('matches snapshot', () => expect(wrapper).toMatchSnapshot())
      it('renders overlay', () => expect(wrapper.html()).toBeDefined())

      it('renders "Assigned to {name}" on top', () => {
        expect(topText(wrapper)).toEqual('Assigned to Sam')
      })
    })
  })

  describe('when stage is model', () => {
    beforeEach(() => {
      item.current_workflow!.current_stage_number = 1
      stage = item.current_workflow!.stages[1][0]
      stage.type = StageType.Model
      item.status = DatasetItemStatus.annotate

      store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
      store.commit('workview/PUSH_DATASET_ITEMS', [item])
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })

    it('matches snapshot', () => expect(wrapper).toMatchSnapshot())
    it('renders "Model"', () => expect(topText(wrapper)).toEqual('AI Model'))

    it('renders center label correctly', () => {
      expect(centerText(wrapper)).toEqual('AI Model is running')
    })
  })

  describe('when stage is code', () => {
    beforeEach(() => {
      item.current_workflow!.current_stage_number = 1
      stage = item.current_workflow!.stages[1][0]
      stage.type = StageType.Code
      item.status = DatasetItemStatus.annotate

      store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
      store.commit('workview/PUSH_DATASET_ITEMS', [item])
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })

    it('matches snapshot', () => expect(wrapper).toMatchSnapshot())
    it('renders "Code"', () => expect(topText(wrapper)).toEqual('Code'))

    it('renders center label correctly', () => {
      expect(centerText(wrapper)).toEqual('Custom code is running')
    })
  })

  describe('when stage is complete', () => {
    beforeEach(() => {
      item.current_workflow!.current_stage_number = 3
      item.status = DatasetItemStatus.complete
      stage = item.current_workflow!.stages[3][0]

      store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
      store.commit('workview/PUSH_DATASET_ITEMS', [item])
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })

    it('matches snapshot', () => expect(wrapper).toMatchSnapshot())
    it('renders "Complete"', () => expect(topText(wrapper)).toEqual('Complete'))
  })
})

describe('when in past stage', () => {
  beforeEach(() => {
    item = initializeARWorkflow({ id: 1, status: DatasetItemStatus.annotate })
    item.current_workflow!.current_stage_number = 3
    stage = item.current_workflow!.stages[1][0]

    store.commit('workview/PUSH_DATASET_ITEMS', [item])
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
  })

  it('matches snapshot', () => expect(wrapper).toMatchSnapshot())
  it('renders "Time Travel" on top', () => expect(topText(wrapper)).toEqual('Time Travel'))
  it('does not render center button', () => {
    expect(wrapper.find('.stage-overlay__center-label').exists()).toBe(false)
  })
})

describe('when in future stage', () => {
  beforeEach(() => {
    item = initializeARWorkflow({ id: 1, status: DatasetItemStatus.annotate })
    item.current_workflow!.current_stage_number = 1
    stage = item.current_workflow!.stages[3][0]

    store.commit('workview/PUSH_DATASET_ITEMS', [item])
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
  })

  it('matches snapshot', () => expect(wrapper).toMatchSnapshot())
  it('renders "Time Travel"', () => expect(wrapper.text()).toContain('Time Travel'))
  it('renders "Time Travel" on top', () => expect(topText(wrapper)).toEqual('Time Travel'))
  it('does not render center button', () => {
    expect(wrapper.find('.stage-overlay__center-label').exists()).toBe(false)
  })
})

describe('when not in worfklow', () => {
  let workflowTemplate: WorkflowTemplatePayload

  beforeEach(() => {
    workflowTemplate = initializeARTemplate()
    store.commit('workview/PUSH_WORKFLOW_TEMPLATE', workflowTemplate)
  })

  describe('when in first stage', () => {
    beforeEach(() => {
      const template = workflowTemplate.workflow_stage_templates[0]
      store.commit('workview/SET_SELECTED_STAGE_TEMPLATE', template)
    })

    it('matches snapshot', () => expect(wrapper).toMatchSnapshot())

    it('renders default overlay', () => {
      expect(wrapper.find('.stage-overlay--none').exists()).toBe(true)
    })
  })

  describe('when in future stage', () => {
    beforeEach(() => {
      const template = workflowTemplate.workflow_stage_templates[1]
      store.commit('workview/SET_SELECTED_STAGE_TEMPLATE', template)
    })

    it('matches snapshot', () => expect(wrapper).toMatchSnapshot())

    it('renders default overlay', () => {
      expect(wrapper.find('.stage-overlay--none').exists()).toBe(true)
    })

    it('does not render top button', () => {
      expect(wrapper.find('.stage-overlay__top-label').text()).toEqual('')
    })

    it('does not render center button', () => {
      expect(wrapper.find('.stage-overlay__center-label').exists()).toBe(false)
    })
  })
})

describe('when in "default_auto_complete" worfklow', () => {
  let workflowTemplate: WorkflowTemplatePayload
  let item: ReturnType<typeof buildDatasetItemPayload>

  beforeEach(() => {
    workflowTemplate = initializeARTemplate()
    store.commit('workview/PUSH_WORKFLOW_TEMPLATE', workflowTemplate)

    item = buildDatasetItemPayload({
      id: 1,
      seq: 1,
      current_workflow_id: 1,
      current_workflow: {
        current_stage_number: 1,
        current_workflow_stage_template_id: 1,
        workflow_template_id: 1,
        status: DatasetItemStatus.complete,
        id: 1,
        dataset_item_id: 1,
        stages: {
          1: [buildWorkflowStagePayload({ type: StageType.Complete })]
        }
      }
    })

    store.commit('workview/PUSH_DATASET_ITEMS', [item])
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', item.current_workflow!.stages[1][0])
  })

  it('matches snapshot', () => expect(wrapper).toMatchSnapshot())

  it('renders default overlay', () => {
    expect(wrapper.find('.stage-overlay--none').exists()).toBe(true)
  })

  it('does not render top button', () => {
    expect(wrapper.find('.stage-overlay__top-label').text()).toEqual('')
  })

  it('does not render center button', () => {
    expect(wrapper.find('.stage-overlay__center-label').exists()).toBe(false)
  })
})
