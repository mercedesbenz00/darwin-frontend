import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueJSModal from 'vue-js-modal'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildDatasetDetailPayload,
  buildDatasetPayload
} from 'test/unit/factories'

import ModalV2 from '@/components/Common/Modal/V2/Modal.vue'
import ModalContentV2 from '@/components/Common/Modal/V2/ModalContent.vue'
import ModalFooterV2 from '@/components/Common/Modal/V2/ModalFooter.vue'
import ModalHeaderV2 from '@/components/Common/Modal/V2/ModalHeader.vue'
import ModalHeaderTitleV2 from '@/components/Common/Modal/V2/ModalHeaderTitle.vue'
import PostExportDialog from '@/components/DatasetManagement/Dialog/PostExportDialog.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueJSModal)
localVue.directive('loading', stubDirectiveWithAttribute)
installCommonComponents(localVue)
localVue.component('ModalV2', ModalV2)
localVue.component('ModalHeaderV2', ModalHeaderV2)
localVue.component('ModalHeaderTitleV2', ModalHeaderTitleV2)
localVue.component('ModalContentV2', ModalContentV2)
localVue.component('ModalFooterV2', ModalFooterV2)

const dataset = buildDatasetPayload({ id: 1, slug: 'test' })
const mocks = { $theme: createMockTheme() }
let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  store.commit('dataset/SET_DATASETS', [dataset])

  const myDatasetDetails = buildDatasetDetailPayload({ id: 1 })
  store.commit('dataset/SET_CURRENT_DATASET_DETAILS', myDatasetDetails)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(PostExportDialog, { localVue, mocks, store })
  expect(wrapper).toMatchSnapshot()
})
