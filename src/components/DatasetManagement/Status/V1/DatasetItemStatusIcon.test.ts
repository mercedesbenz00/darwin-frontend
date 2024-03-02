import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildDatasetItemPayload,
  buildTeamPayload,
  buildMembershipPayload,
  buildWorkflowStagePayload,
  buildWorkflowPayload,
  buildV2WorkflowItemPayload,
  buildV2WorkflowStageInstancePayload,
  buildV2WorkflowStagePayload
} from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'

import DatasetItemStatusIcon from '@/components/DatasetManagement/Status/V1/DatasetItemStatusIcon.vue'
import {
  DatasetItemPayload,
  DatasetItemStatus,
  StageType,
  WorkflowStagePayload
} from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>

const statuses: DatasetItemStatus[] = [
  DatasetItemStatus.annotate,
  DatasetItemStatus.archived,
  DatasetItemStatus.complete,
  DatasetItemStatus.error,
  DatasetItemStatus.new,
  DatasetItemStatus.processing,
  DatasetItemStatus.review,
  DatasetItemStatus.uploading
]

const team = buildTeamPayload({ id: 7 })

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', team)
})

let item: DatasetItemPayload

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const propsData = { item }
  const wrapper = shallowMount(DatasetItemStatusIcon, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

statuses.forEach((status, i) => {
  describe(`dataset item of status '${status}'`, () => {
    beforeEach(() => {
      item = buildDatasetItemPayload({ id: i, status, current_workflow: null })
    })

    itMatchesSnapshot()
  })
})

const v1types: WorkflowStagePayload['type'][] = [
  StageType.Code,
  StageType.Test,
  StageType.Model
]

v1types.forEach((type) => {
  describe(`when in ${type} stage of 1.0 workflow`, () => {
    beforeEach(() => {
      item = initializeARWorkflow()
      item.current_workflow!.stages[1][0].type = type
    })

    itMatchesSnapshot()
  })
})

describe('when in dataset stage of 2.0 workflow', () => {
  beforeEach(() => {
    item = buildDatasetItemPayload({
      status: DatasetItemStatus.new,
      workflow_item: buildV2WorkflowItemPayload({
        current_stage_instances: [
          buildV2WorkflowStageInstancePayload({
            stage: buildV2WorkflowStagePayload({ type: StageType.Dataset })
          })
        ]
      })
    })
  })

  itMatchesSnapshot()
})

describe('when in discard stage of 2.0 workflow', () => {
  beforeEach(() => {
    item = buildDatasetItemPayload({
      status: DatasetItemStatus.new,
      archived: true,
      workflow_item: buildV2WorkflowItemPayload({
        current_stage_instances: [
          buildV2WorkflowStageInstancePayload({
            stage: buildV2WorkflowStagePayload({ type: StageType.Discard })
          })
        ]
      })
    })
  })

  itMatchesSnapshot()
})
describe('when assigned to 1.0 workflow', () => {
  [DatasetItemStatus.annotate, DatasetItemStatus.review].forEach((status, i) => {
    const assignee = buildMembershipPayload({
      id: 1,
      user_id: 9,
      team_id: team.id,
      first_name: 'Sam',
      last_name: 'Annotator'
    })

    beforeEach(() => {
      item = initializeARWorkflow()
      item.id = i
      item.status = status
      item.current_workflow!.stages[1][0].assignee_id = 9

      store.commit('team/SET_MEMBERSHIPS', [assignee])
    })

    it(`matches snapshot for item of status '${status}'`, () => {
      const propsData = { item }
      const wrapper = shallowMount(DatasetItemStatusIcon, { localVue, propsData, store })
      expect(wrapper).toMatchSnapshot()
    })

    it('renders assignee in tooltip', () => {
      const propsData = { item }
      const wrapper = shallowMount(DatasetItemStatusIcon, { localVue, propsData, store })
      expect(wrapper.find('status-button-stub').attributes('tooltip')).toContain('Sam Annotator')
    })
  })
})

describe('when assigned to 2.0 workflow', () => {
  [DatasetItemStatus.annotate, DatasetItemStatus.review].forEach((status, i) => {
    let item: DatasetItemPayload
    const type = status === DatasetItemStatus.annotate
      ? StageType.Annotate
      : StageType.Review

    const assignee = buildMembershipPayload({
      id: 1,
      user_id: 9,
      team_id: team.id,
      first_name: 'Sam',
      last_name: 'Annotator'
    })

    beforeEach(() => {
      item = buildDatasetItemPayload({
        id: i,
        status,
        workflow_item: buildV2WorkflowItemPayload({
          current_stage_instances: [
            buildV2WorkflowStageInstancePayload({
              user_id: assignee.user_id,
              stage: buildV2WorkflowStagePayload({ type })
            })
          ]
        })
      })

      store.commit('team/SET_MEMBERSHIPS', [assignee])
    })

    it(`matches snapshot for item of status '${status}'`, () => {
      const propsData = { item }
      const wrapper = shallowMount(DatasetItemStatusIcon, { localVue, propsData, store })
      expect(wrapper).toMatchSnapshot()
    })

    it('renders assignee in tooltip', () => {
      const propsData = { item }
      const wrapper = shallowMount(DatasetItemStatusIcon, { localVue, propsData, store })
      expect(wrapper.find('status-button-stub').attributes('tooltip')).toContain('Sam Annotator')
    })
  })
})

it('matches snapshot when status is annotate with assignee', () => {
  const v7 = buildTeamPayload({ id: 1 })
  const membership = buildMembershipPayload({
    user_id: 2,
    first_name: 'Sam',
    last_name: 'Annotator',
    team_id: v7.id
  })
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('team/SET_MEMBERSHIPS', [membership])

  const item = buildDatasetItemPayload({
    id: 1,
    status: DatasetItemStatus.annotate,
    current_workflow: buildWorkflowPayload({
      current_stage_number: 1,
      stages: {
        1: [
          buildWorkflowStagePayload({
            id: 22,
            assignee_id: membership.user_id,
            workflow_stage_template_id: 2,
            type: StageType.Annotate
          })
        ]
      }
    })
  })
  const propsData = { item, showTooltip: true }
  const wrapper = shallowMount(DatasetItemStatusIcon, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()

  expect(wrapper.find('status-button-stub').attributes('tooltip')).toContain('Sam Annotator')
})

it('matches snapshot when status is archived after completed', () => {
  const item = buildDatasetItemPayload({
    id: 1,
    status: DatasetItemStatus.archived,
    current_workflow: buildWorkflowPayload({
      current_stage_number: 1,
      stages: {
        1: [buildWorkflowStagePayload({ id: 1, completed: true })]
      }
    })
  })
  const propsData = { item }
  const wrapper = shallowMount(DatasetItemStatusIcon, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when status is processing with tags during upload', () => {
  const item = buildDatasetItemPayload({
    id: 1,
    status: DatasetItemStatus.processing,
    current_workflow: buildWorkflowPayload({
      current_stage_number: 1,
      stages: {
        1: [buildWorkflowStagePayload({ id: 1, completed: true })]
      }
    })
  })
  const propsData = { item }
  const wrapper = shallowMount(DatasetItemStatusIcon, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

describe('when in auto-complete stage of 1.0 workflow', () => {
  beforeEach(() => {
    item = buildDatasetItemPayload({
      status: DatasetItemStatus.new,
      current_workflow: buildWorkflowPayload({
        current_stage_number: 1,
        stages: {
          1: [buildWorkflowStagePayload({ type: StageType.Complete })]
        }
      })

    })
  })

  itMatchesSnapshot()
})
