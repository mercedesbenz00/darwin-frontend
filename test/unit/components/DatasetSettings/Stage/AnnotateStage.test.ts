import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildAnnotateStageTemplatePayload,
  buildMembershipPayload
} from 'test/unit/factories'

import AnnotateStage from '@/components/DatasetSettings/Stage/AnnotateStage.vue'
import { StageActor } from '@/components/DatasetSettings/utils'
import { AnnotateStageTemplatePayload, FeaturePayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let stage: AnnotateStageTemplatePayload
let store: ReturnType<typeof createTestStore>

let propsData: {
  actors: StageActor[]
  stage: AnnotateStageTemplatePayload
  hasSampling?: boolean
  deletable: boolean
}

const sam = buildMembershipPayload({ id: 1, user_id: 3, team_id: 1, first_name: 'Sam' })
const jim = buildMembershipPayload({ id: 2, user_id: 4, team_id: 1, first_name: 'Jim' })

const model = {
  annotator: 'annotator-toggle-stub',
  annotatorSamplingRate: 'sampling-rate-stub.annotate__annotator-sampling',
  assignability: 'assignability-toggle-stub',
  assignabilitySamplingRate: 'sampling-rate-stub.annotate__user-sampling',
  baseSamplingRate: 'sampling-rate-stub.annotate__base-sampling',
  deleteButton: 'delete-button-stub',
  nameField: 'stage-title-stub',
  searchField: 'input-field-stub'
}

let mocks: {
  $featureEnabled: (name: FeaturePayload['name']) => boolean
}

beforeEach(() => {
  store = createTestStore()

  stage = buildAnnotateStageTemplatePayload({ id: 1 })
  const actors: StageActor[] = [
    { member: sam, scoreInDataset: null, scoreInTeam: null },
    { member: jim, scoreInDataset: null, scoreInTeam: null }
  ]

  propsData = { actors, deletable: false, hasSampling: false, stage }
  mocks = {
    $featureEnabled: (feature): boolean => feature === 'BLIND_STAGE'
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(AnnotateStage, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when one of the members is assigned', () => {
  propsData.stage = buildAnnotateStageTemplatePayload({
    id: 1,
    workflow_stage_template_assignees: [{ assignee_id: 3, sampling_rate: 1 }]
  }
  )
  const wrapper = shallowMount(AnnotateStage, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('sorts by assignee full name', () => {
  // intentionally set out of alphabetical order
  store.commit('team/SET_MEMBERSHIPS', [sam, jim])
  const wrapper = shallowMount(AnnotateStage, { localVue, mocks, propsData, store })
  expect(wrapper.findAll(model.annotator).at(0).props('member')).toEqual(jim)
  expect(wrapper.findAll(model.annotator).at(1).props('member')).toEqual(sam)
})

it('filters by assignees', async () => {
  const wrapper = shallowMount(AnnotateStage, { localVue, mocks, propsData, store })

  await wrapper.find(model.searchField).vm.$emit('input', 'Sam')
  expect(wrapper.findAll(model.annotator).length).toEqual(1)

  await wrapper.find(model.searchField).vm.$emit('input', '')
  expect(wrapper.findAll(model.annotator).length).toEqual(2)

  await wrapper.find(model.searchField).vm.$emit('input', 'Jim')
  expect(wrapper.findAll(model.annotator).length).toEqual(1)
})

it('emits change when any is selected', async () => {
  const wrapper = shallowMount(AnnotateStage, { localVue, mocks, propsData, store })

  await wrapper.find(model.assignability).vm.$emit('change', 'anyone')
  expect(wrapper.emitted().change).toBeDefined()
  expect(wrapper.emitted().change || []).toContainEqual([
    expect.objectContaining({ metadata: expect.objectContaining({ assignable_to: 'anyone' }) })
  ])

  await wrapper.findAll(model.assignability).at(0).vm.$emit('change', 'any_user')
  expect(wrapper.emitted().change).toBeDefined()
  expect(wrapper.emitted().change || []).toContainEqual([
    expect.objectContaining({ metadata: expect.objectContaining({ assignable_to: 'any_user' }) })
  ])
})

it('emits change when a new assignee is selected', async () => {
  const wrapper = shallowMount(AnnotateStage, { localVue, mocks, propsData, store })
  await wrapper.findAll(model.annotator).at(1).vm.$emit('select')

  expect(wrapper.emitted().change![0]).toEqual([
    expect.objectContaining({
      workflow_stage_template_assignees: [{ assignee_id: 3, sampling_rate: 1.0 }]
    })
  ])
})

describe('show/hide trash icon', () => {
  it('matches snapshot when deletable', () => {
    propsData.deletable = true
    const wrapper = shallowMount(AnnotateStage, { localVue, mocks, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('shows trash icon if deletable', () => {
    propsData.deletable = true
    const wrapper = shallowMount(AnnotateStage, { localVue, mocks, propsData, store })
    expect(wrapper.find(model.deleteButton).exists()).toBeTruthy()
  })

  it('hide trash icon if not deletable', () => {
    propsData.deletable = false
    const wrapper = shallowMount(AnnotateStage, { localVue, mocks, propsData, store })
    expect(wrapper.find(model.deleteButton).exists()).toBeFalsy()
  })
})

describe('with sampling rates', () => {
  beforeEach(() => {
    propsData.hasSampling = true
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(AnnotateStage, { localVue, mocks, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('sets initial sampling rates', () => {
    stage = buildAnnotateStageTemplatePayload({
      id: 1,
      metadata: {
        assignable_to: 'manual',
        base_sampling_rate: 0.5,
        user_sampling_rate: 0.3
      }
    })
    propsData.stage = stage
    const wrapper = shallowMount(AnnotateStage, { localVue, mocks, propsData, store })
    expect(wrapper.find(model.baseSamplingRate).props('value')).toEqual(0.5)
    expect(wrapper.find(model.assignabilitySamplingRate).props('value')).toEqual(0.3)
  })

  it('REGRESSION: Allows 0.0 as user and base sampling rate', () => {
    stage = buildAnnotateStageTemplatePayload({
      id: 1,
      metadata: { assignable_to: 'manual', base_sampling_rate: 0.0, user_sampling_rate: 0.0 }
    })
    propsData.stage = stage
    const wrapper = shallowMount(AnnotateStage, { localVue, mocks, propsData, store })
    expect(wrapper.findAll('sampling-rate-stub').at(0).props('value')).toEqual(0.0)
    expect(wrapper.findAll('sampling-rate-stub').at(1).props('value')).toEqual(0.0)
  })

  it('emits change with base sampling rate change', async () => {
    const wrapper = shallowMount(AnnotateStage, { localVue, mocks, propsData, store })
    await wrapper.findAll('sampling-rate-stub').at(0).vm.$emit('change', 0.5)
    expect(wrapper.emitted().change || []).toContainEqual([
      expect.objectContaining({ metadata: expect.objectContaining({ base_sampling_rate: 0.5 }) })
    ])
  })

  it('emits change with user sampling rate change', async () => {
    const wrapper = shallowMount(AnnotateStage, { localVue, mocks, propsData, store })
    await wrapper.findAll('sampling-rate-stub').at(1).vm.$emit('change', 0.5)
    expect(wrapper.emitted().change || []).toContainEqual([
      expect.objectContaining({ metadata: expect.objectContaining({ user_sampling_rate: 0.5 }) })
    ])
  })

  it('emits change with assignee sampling rate change', async () => {
    propsData.stage = buildAnnotateStageTemplatePayload({
      id: 1,
      workflow_stage_template_assignees: [{ assignee_id: 3, sampling_rate: 1 }]
    }
    )

    const wrapper = shallowMount(AnnotateStage, { localVue, mocks, propsData, store })
    await wrapper.findAll('sampling-rate-stub').at(3).vm.$emit('change', 0.5)
    expect(wrapper.emitted().change || []).toContainEqual([
      expect.objectContaining({
        workflow_stage_template_assignees: [{ assignee_id: 3, sampling_rate: 0.5 }]
      })
    ])
  })

  it('enables/disables rates based on selection', async () => {
    propsData.stage.metadata.assignable_to = 'anyone'
    const wrapper = shallowMount(AnnotateStage, { localVue, mocks, propsData, store })

    // indices are a bit confusing to deal with here, so we define helpers

    const baseSampling = (): Wrapper<Vue> => wrapper.find(model.baseSamplingRate)
    const userSampling = (): Wrapper<Vue> => wrapper.find(model.assignabilitySamplingRate)
    const userAssignability = (): Wrapper<Vue> => wrapper.find(model.assignability)

    // subsequent pairs represent actual annotators
    const annotatorSampling = (i: number): Wrapper<Vue> =>
      wrapper.findAll(model.annotatorSamplingRate).at(i)
    const annotatorItem = (i: number): Wrapper<Vue> => wrapper.findAll(model.annotator).at(i)

    // no assignees selected initially
    expect(baseSampling().props('disabled')).toBe(false)
    expect(userSampling().props('disabled')).toBe(false)
    expect(annotatorSampling(0).props('disabled')).toBe(true)
    expect(annotatorSampling(1).props('disabled')).toBe(true)

    // select 1st assignee, should disable "anyone" item, enable 1st assignee, keep others as is
    await annotatorItem(0).vm.$emit('select')
    expect(baseSampling().props('disabled')).toBe(false)
    expect(userSampling().props('disabled')).toBe(true)

    expect(annotatorSampling(0).props('disabled')).toBe(false)
    expect(annotatorSampling(1).props('disabled')).toBe(true)

    // select "anyone" again. should enable "anyone", disable assignees
    await userAssignability().vm.$emit('change', 'anyone')
    expect(baseSampling().props('disabled')).toBe(false)
    expect(userSampling().props('disabled')).toBe(false)
    expect(annotatorSampling(0).props('disabled')).toBe(true)
    expect(annotatorSampling(1).props('disabled')).toBe(true)
  })

  it('when switching filters, correctly emits change (REGRESSION 2020-09-09)', async () => {
    const wrapper = shallowMount(AnnotateStage, { localVue, mocks, propsData, store })

    // filter Sam only
    await wrapper.find(model.searchField).vm.$emit('input', 'Sam')
    await wrapper.find(model.annotator).vm.$emit('select', { id: sam.user_id, selected: true })
    await wrapper.find(model.annotatorSamplingRate).vm.$emit('change', 0.5)

    // filter Jim only
    await wrapper.find(model.searchField).vm.$emit('input', 'Jim')
    await wrapper.find(model.annotator).vm.$emit('select', { id: jim.user_id, selected: true })
    await wrapper.find(model.annotatorSamplingRate).vm.$emit('change', 0.4)

    expect(wrapper.emitted().change || []).toContainEqual([
      expect.objectContaining({
        workflow_stage_template_assignees: [
          { assignee_id: sam.user_id, sampling_rate: 0.5 },
          { assignee_id: jim.user_id, sampling_rate: 0.4 }
        ]
      })
    ])
  })
})

it('emits name changes', async () => {
  const wrapper = shallowMount(AnnotateStage, { localVue, mocks, propsData, store })
  await wrapper.find(model.nameField).vm.$emit('change', 'New Name')
  expect(wrapper.emitted().change![0]).toEqual([expect.objectContaining({ name: 'New Name' })])
})
