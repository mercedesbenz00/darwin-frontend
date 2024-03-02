import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAnnotationClassPayload, buildTeamPayload } from 'test/unit/factories'

import ClassesContextMenu from '@/components/Classes/ClassesContextMenu.vue'
import { AnnotationClassPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let propsData: {
  classes: AnnotationClassPayload[]
}
const mocks = {
  $can: jest.fn().mockReturnValue(true)
}

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 1 }))
  propsData = {
    classes: [
      buildAnnotationClassPayload({ id: 1 }),
      buildAnnotationClassPayload({ id: 2 })
    ]
  }
})

it('matches snapshot when nothing selected', () => {
  const wrapper = shallowMount(ClassesContextMenu, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with selection and user allowed action', () => {
  store.commit('aclass/SET_CLASS_SELECTIONS', [{ id: 1, selected: true }])
  const wrapper = shallowMount(ClassesContextMenu, { localVue, mocks, propsData, store })

  expect(wrapper).toMatchSnapshot()
})

it('shows delete confirmation dialog when delete classes', async () => {
  store.commit('aclass/SET_CLASS_SELECTIONS', [{ id: 1, selected: true }])
  const wrapper = shallowMount(ClassesContextMenu, { localVue, mocks, propsData, store })
  const dialog = wrapper.vm.$refs.deleteConfirmationDialog as any
  dialog.showDeleteModal = jest.fn()
  await wrapper.findAll('gallery-context-menu-item-stub').at(0).vm.$emit('click')

  expect(dialog.showDeleteModal).toHaveBeenCalled()
})
