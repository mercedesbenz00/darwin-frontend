import { createLocalVue, shallowMount } from '@vue/test-utils'
import { defineComponent, ref, Ref } from 'vue'
import Vuex, { Store } from 'vuex'

import { createEditorV2 } from 'test/unit/createEditorV2'
import createTestStore from 'test/unit/createTestStore'
import { buildV2DatasetItemPayload } from 'test/unit/factories'

import { RootState, V2DatasetItemPayload } from '@/store/types'

import { useStageAnnotationLoader } from './useStageAnnotationLoader'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: Store<RootState>
let mocks: { $can: () => boolean }
let provide: { editorV2: Ref }
let item: V2DatasetItemPayload
let item2: V2DatasetItemPayload

jest.mock('@/engineV2/workers/FramesLoaderWorker')

const TestComponent = defineComponent({
  setup () {
    useStageAnnotationLoader()
  },
  render (h) {
    return h('div')
  }
})

beforeEach(() => {
  store = createTestStore()

  provide = {
    editorV2: ref(createEditorV2(store))
  }

  item = buildV2DatasetItemPayload({ id: 'uuid-1' })
  item2 = buildV2DatasetItemPayload({ id: 'uuid-2' })

  provide.editorV2.value.itemManager.setCurrentItem(item)

  store.commit('workview/PUSH_DATASET_ITEMS', [item])
  store.commit('workview/SET_V2_SELECTED_DATASET_ITEM', item.id)
})

it('loads annotations on mount', () => {
  shallowMount(TestComponent,{ localVue, mocks, store, provide })
  expect(store.dispatch).toHaveBeenCalledWith('workview/loadV2Annotations', 'uuid-1')
})

it('loads annotations on stage selection', async () => {
  const wrapper = shallowMount(TestComponent,{ localVue, mocks, store, provide })

  store.commit('workview/SET_V2_SELECTED_DATASET_ITEM', item)
  await wrapper.vm.$nextTick()
  expect(store.dispatch).toHaveBeenCalledWith('workview/loadV2Annotations', 'uuid-1')
})

it('triggers additional loads on item id change', async () => {
  const wrapper = shallowMount(TestComponent,{ localVue, mocks, store, provide })

  expect(store.dispatch).toHaveBeenNthCalledWith(1, 'workview/loadV2Annotations', item.id)

  provide.editorV2.value.itemManager.setCurrentItem(item)
  await wrapper.vm.$nextTick()
  expect(store.dispatch).toHaveBeenNthCalledWith(1, 'workview/loadV2Annotations', item.id)

  provide.editorV2.value.itemManager.setCurrentItem(item2)
  await wrapper.vm.$nextTick()

  expect(store.dispatch).toHaveBeenNthCalledWith(2, 'workview/loadV2Annotations', item2.id)
})
