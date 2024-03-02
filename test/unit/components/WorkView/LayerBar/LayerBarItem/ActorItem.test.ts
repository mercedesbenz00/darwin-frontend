import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildMembershipPayload } from 'test/unit/factories'
import { VPopover } from 'test/unit/stubs'

import ActorItem from '@/components/WorkView/LayerBar/LayerBarItem/ActorItem.vue'
import { MembershipPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)
let propsData: { actor: MembershipPayload }
const stubs: Stubs = { VPopover }

beforeEach(() => {
  propsData = { actor: buildMembershipPayload({ first_name: 'Test', last_name: 'Actor' }) }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ActorItem, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})
