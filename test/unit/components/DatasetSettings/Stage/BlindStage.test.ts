import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildAnnotateStageTemplatePayload,
  buildMembershipPayload,
  buildReviewStageTemplatePayload,
  buildTestStageTemplatePayload
} from 'test/unit/factories'

import BlindStage from '@/components/DatasetSettings/Stage/BlindStage.vue'
import { StageActor } from '@/components/DatasetSettings/utils'
import {
  AnnotateStageTemplatePayload,
  ReviewStageTemplatePayload,
  TestStageTemplatePayload
} from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let stages: [AnnotateStageTemplatePayload, TestStageTemplatePayload, ReviewStageTemplatePayload]
let store: ReturnType<typeof createTestStore>

let propsData: {
  actors: StageActor[]
  deletable?: boolean
  movable?: boolean
  stages: [AnnotateStageTemplatePayload, TestStageTemplatePayload, ReviewStageTemplatePayload]
}

const sam = buildMembershipPayload({ id: 1, user_id: 3, team_id: 1, first_name: 'Sam' })
const jim = buildMembershipPayload({ id: 2, user_id: 4, team_id: 1, first_name: 'Jim' })

beforeEach(() => {
  store = createTestStore()

  stages = [
    buildAnnotateStageTemplatePayload({ id: 1, metadata: { parallel: 2 } }),
    buildTestStageTemplatePayload({ id: 2 }),
    buildReviewStageTemplatePayload({ id: 3 })
  ]
  const actors: StageActor[] = [
    { member: sam, scoreInDataset: null, scoreInTeam: null },
    { member: jim, scoreInDataset: null, scoreInTeam: null }
  ]

  propsData = { actors, deletable: false, stages }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(BlindStage, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

class Model {
  wrapper: Wrapper<Vue>
  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get addons (): {
    wrapper: Wrapper<Vue>
    remove(): Promise<void>
  }[] {
    return this.wrapper.findAll('.blind__annotate__addon').wrappers
      .map(wrapper => ({
        wrapper,
        async remove (): Promise<void> {
          await wrapper.find('delete-button-stub').vm.$emit('click')
        }
      }))
  }

  async addParallelStage (): Promise<void> {
    await this.wrapper
      .find('.blind__chevron-add__add-icon round-drop-shadow-button-stub')
      .vm.$emit('click')
  }

  async updateAnnotateStage (): Promise<void> {
    await this.wrapper.find('annotate-stage-stub').vm.$emit('change')
  }

  async deleteAnnotateStage (): Promise<void> {
    await this.wrapper.find('annotate-stage-stub').vm.$emit('delete')
  }

  async updateTestStage (): Promise<void> {
    await this.wrapper.find('test-stage-stub').vm.$emit('change')
  }

  async updateReviewStage (): Promise<void> {
    await this.wrapper.find('review-stage-stub').vm.$emit('change')
  }
}

it('renders number of addons based on number of parallel stages', async () => {
  const wrapper = shallowMount(BlindStage, { localVue, propsData, store })
  const model = new Model(wrapper)
  expect(model.addons.length).toEqual(1)

  const newStages = [
    { ...stages[0], metadata: { ...stages[0], parallel: 3 } },
    stages[1],
    stages[2]
  ]

  await wrapper.setProps({ stages: newStages })

  expect(model.addons.length).toEqual(2)
})

it('emits change when adding parallel stage', async () => {
  const wrapper = shallowMount(BlindStage, { localVue, propsData, store })
  const model = new Model(wrapper)
  await model.addParallelStage()
  expect(wrapper.emitted().change![0][0]).toEqual(
    expect.objectContaining({
      metadata: expect.objectContaining({ parallel: 3 })
    })
  )
})

it('emits change when removing parallel stage', async () => {
  const wrapper = shallowMount(BlindStage, { localVue, propsData, store })
  const model = new Model(wrapper)
  await model.addons[0].remove()
  expect(wrapper.emitted().change![0][0]).toEqual(
    expect.objectContaining({
      metadata: expect.objectContaining({ parallel: 1 })
    })
  )
})

it('emits change when annotate stage changes', async () => {
  const wrapper = shallowMount(BlindStage, { localVue, propsData, store })
  const model = new Model(wrapper)
  await model.updateAnnotateStage()
  expect(wrapper.emitted().change?.length).toEqual(1)
})

it('emits change when test stage changes', async () => {
  const wrapper = shallowMount(BlindStage, { localVue, propsData, store })
  const model = new Model(wrapper)
  await model.updateTestStage()
  expect(wrapper.emitted().change?.length).toEqual(1)
})

it('emits change when review stage changes', async () => {
  const wrapper = shallowMount(BlindStage, { localVue, propsData, store })
  const model = new Model(wrapper)
  await model.updateReviewStage()
  expect(wrapper.emitted().change?.length).toEqual(1)
})

it('emits delete when annotate stage is deleted', async () => {
  const wrapper = shallowMount(BlindStage, { localVue, propsData, store })
  const model = new Model(wrapper)
  await model.deleteAnnotateStage()
  expect(wrapper.emitted().delete?.length).toEqual(1)
})
