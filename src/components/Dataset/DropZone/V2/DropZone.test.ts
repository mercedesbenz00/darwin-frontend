import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { createFile } from 'test/unit/factories'

import DropZone from './DropZone.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let files: File[]

beforeEach(() => {
  store = createTestStore()
  files = [
    createFile('foo.png'),
    createFile('bar.png'),
    createFile('baz.png'),
    createFile('bat.png')
  ]
})

it('matches snapshot', () => {
  const wrapper = shallowMount(DropZone, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with multiple sets added', () => {
  store.commit('datasetUpload/ADD_FILES', files)
  const wrapper = shallowMount(DropZone, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})
