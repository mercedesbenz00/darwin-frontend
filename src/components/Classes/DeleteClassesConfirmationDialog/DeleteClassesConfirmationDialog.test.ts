import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAnnotationClassPayload, buildTeamPayload } from 'test/unit/factories'

import { DeleteClassesConfirmationDialog } from
  '@/components/Classes/DeleteClassesConfirmationDialog'
import { AnnotationClassPayload } from '@/store/types'
import { errorsByCode } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let propsData: {
  selectedClasses: AnnotationClassPayload[]
}
const mocks = {
  $can: jest.fn().mockReturnValue(true)
}

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 1 }))
  propsData = {
    selectedClasses: [
      buildAnnotationClassPayload({ id: 1 })
    ]
  }
})

it('matches snapshot when selected one class', () => {
  const wrapper = shallowMount(DeleteClassesConfirmationDialog, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when selected more than one classes', () => {
  propsData = {
    selectedClasses: [
      buildAnnotationClassPayload({ id: 1 }),
      buildAnnotationClassPayload({ id: 2 })
    ]
  }
  const wrapper = shallowMount(DeleteClassesConfirmationDialog, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('prevents delete if user not allowed action', () => {
  const mocks = { $can: jest.fn().mockReturnValue(false) }
  const wrapper = shallowMount(DeleteClassesConfirmationDialog, { localVue, mocks, propsData, store })

  wrapper.vm.showDeleteModal()
  expect(store.dispatch).toHaveBeenCalledWith('toast/warning', {
    content: errorsByCode.ANNOTATION_CLASS_DELETE_NOT_AUTHORIZED
  })
})

it('loads class usage when delete', async () => {
  const wrapper = shallowMount(DeleteClassesConfirmationDialog, { localVue, mocks, propsData, store })
  const dialog = wrapper.vm.$refs.deleteConfirmationDialog as any
  dialog.show = jest.fn()
  await wrapper.vm.showDeleteModal()

  expect(dialog.show).toHaveBeenCalled()

  expect(store.dispatch).toHaveBeenCalledWith('aclass/loadClassUsage', {
    annotationClassIds: [1]
  })
})

it('deletes if user allowed action', async () => {
  const mocks = { $can: jest.fn().mockReturnValue(true) }
  const wrapper = shallowMount(DeleteClassesConfirmationDialog, { localVue, mocks, propsData, store })
  const dialog = wrapper.vm.$refs.deleteConfirmationDialog as any
  dialog.close = jest.fn()
  await wrapper.vm.deleteSelectedClasses()

  expect(store.dispatch).toHaveBeenCalledWith('aclass/deleteClasses', {
    teamId: 1,
    annotationClassIds: [1],
    annotationsToDeleteCount: 0
  })
})

it('dispatches toast on delete failure', async () => {
  const mocks = { $can: jest.fn().mockReturnValue(true) }
  const wrapper = shallowMount(DeleteClassesConfirmationDialog, { localVue, mocks, propsData, store })
  const dialog = wrapper.vm.$refs.deleteConfirmationDialog as any
  dialog.close = jest.fn()
  jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'Fake error' } })

  await wrapper.vm.deleteSelectedClasses()

  expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake error' })
})
