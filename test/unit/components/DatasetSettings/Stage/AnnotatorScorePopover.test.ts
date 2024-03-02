import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import { createMockTheme } from 'test/unit/components/mocks'
import { buildMembershipPayload } from 'test/unit/factories'
import { VPopover } from 'test/unit/stubs'

import AnnotatorScorePopover from '@/components/DatasetSettings/Stage/AnnotatorScorePopover.vue'
import { StageActor } from '@/components/DatasetSettings/utils'

const localVue = createLocalVue()
localVue.directive('loading', () => {})

const mocks = { $theme: createMockTheme() }
const stubs: Stubs = { VPopover }
let propsData: {
  actor: StageActor
}

beforeEach(() => {
  const actor: StageActor = {
    member: buildMembershipPayload({ first_name: 'John', last_name: 'Doe' }),
    scoreInDataset: { score: 5, mergedInstances: 11, rejectedInstances: 1 },
    scoreInTeam: { score: 10, mergedInstances: 20, rejectedInstances: 1 }
  }

  propsData = { actor }
})

it('matches the snapshot', () => {
  const wrapper = shallowMount(AnnotatorScorePopover, {
    localVue, propsData, mocks, stubs
  })
  expect(wrapper).toMatchSnapshot()
})
