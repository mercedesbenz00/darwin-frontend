import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex, { Store } from 'vuex'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import { installCommonComponents } from '@/plugins/components'
import datasetUpload, {
  getInitialState as getInitialDatasetUploadState
} from '@/store/modules/datasetUpload'
import { RootState } from '@/store/types'

import V2DataTabUpload from './V2DataTabUpload.vue'

const mockShowUploadDialog = jest.fn()

jest.mock('@/components/Dataset/useDatasetUploadDialog', () => ({
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  useDatasetUploadDialog: () => ({
    showUploadDialog: mockShowUploadDialog
  })
}))

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)
installCommonComponents(localVue)

const newStore = (): Store<RootState> => {
  const store = new Vuex.Store<RootState>({
    modules: {
      datasetUpload: { ...datasetUpload, state: getInitialDatasetUploadState() }
    }
  })

  jest.spyOn(store, 'dispatch').mockResolvedValue({})
  return store
}

let store: ReturnType<typeof newStore>

beforeEach(() => { store = newStore() })

it('matches snapshot', () => {
  const wrapper = shallowMount(V2DataTabUpload, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when upload in progress', () => {
  store.commit('datasetUpload/SET_UPLOAD_STATUS', 'started')
  const wrapper = shallowMount(V2DataTabUpload, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('opens dialog when clicking add button', async () => {
  mockShowUploadDialog.mockClear()
  const wrapper = shallowMount(V2DataTabUpload, { localVue, store })

  await wrapper.find('darwinbutton-stub').vm.$emit('click')
  expect(mockShowUploadDialog).toHaveBeenCalled()
})
