import { createWidget } from '@typeform/embed'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import TypeformModal from '@/components/Plans/Product/AnnotationCredits/TypeformModal.vue'
import { UserPayload, TeamPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(VModal)
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  store.state.user = {
    profile: {
      id: 1
    } as UserPayload
  }
  store.state.team.currentTeam = {
    id: 1,
    slug: 'slug'
  } as TeamPayload
})

jest.mock('@typeform/embed', () => ({
  createWidget: jest.fn((str, obj) => {
    obj.onSubmit()
  })
}))

it('matches snapshot', () => {
  const wrapper = shallowMount(TypeformModal, { localVue })
  expect(wrapper).toMatchSnapshot()
})

it('should hide modal on typeform submit', () => {
  const wrapper = shallowMount(TypeformModal, { localVue, store })
  const component = wrapper.vm as any
  const hideSpyOn = jest.spyOn(component.$modal, 'hide')
  component.onOpened()

  expect(hideSpyOn).toBeCalledWith('typeform-modal')
})

it('should emit component submit event on typeform submit', () => {
  const wrapper = shallowMount(TypeformModal, { localVue, store })
  const component = wrapper.vm as any
  component.onOpened()

  expect(wrapper.emitted().submit).toBeTruthy()
})

it('should provide hidden fields values for typeform component', () => {
  const wrapper = shallowMount(TypeformModal, { localVue, store })
  const component = wrapper.vm as any
  component.onOpened()

  expect(createWidget).toBeCalledWith(expect.any(String), expect.objectContaining({
    hidden: {
      team_id: '1',
      user_id: '1',
      team_slug: 'slug'
    }
  }))
})
