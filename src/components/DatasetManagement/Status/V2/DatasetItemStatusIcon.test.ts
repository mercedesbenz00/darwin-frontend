import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildTeamPayload,
  buildMembershipPayload,
  buildWorkflowStagePayload,
  buildWorkflowPayload,
  buildV2DatasetItemPayload,
  buildV2DARCWorkflow
} from 'test/unit/factories'

import DatasetItemStatusIcon from '@/components/DatasetManagement/Status/V2/DatasetItemStatusIcon.vue'
import { V2DatasetItemPayload, DatasetItemStatus, StageType } from '@/store/types'

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

statuses.forEach((status, i) => {
  let item: V2DatasetItemPayload

  beforeEach(() => {
    item = buildV2DatasetItemPayload({ id: i.toString(), processing_status: status })
  })

  it(`matches snapshot for dataset item of status '${status}'`, () => {
    const propsData = { item }
    const wrapper = shallowMount(DatasetItemStatusIcon, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when assigned to 2.0 workflow', () => {
  [DatasetItemStatus.annotate, DatasetItemStatus.review].forEach((status, i) => {
    let item: V2DatasetItemPayload
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
      const workflow = buildV2DARCWorkflow()
      const stage = workflow.stages.find(s => s.type === type)
      item = buildV2DatasetItemPayload({
        id: i.toString(),
        processing_status: status,
        status: status,
        workflow_data: {
          current_stage_instances: [
            {
              stage_id: stage!.id,
              stage_type: stage!.type,
              assignee_id: assignee.user_id
            }
          ],
          workflow_id: '1'
        }
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

  const item = buildV2DatasetItemPayload({
    id: '1',
    processing_status: DatasetItemStatus.annotate,
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
  const item = buildV2DatasetItemPayload({
    id: '1',
    processing_status: DatasetItemStatus.archived,
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
  const item = buildV2DatasetItemPayload({
    id: '1',
    processing_status: DatasetItemStatus.processing,
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
