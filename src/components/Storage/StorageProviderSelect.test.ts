import { createLocalVue, shallowMount } from '@vue/test-utils'

import { rootStubProps } from 'test/unit/testHelpers'

import StorageProviderSelect from '@/components/Storage/StorageProviderSelect.vue'
import { StorageProvider } from '@/store/types'

const localVue = createLocalVue()
let propsData: {
  value: string
}

const STORAGE_PROVIDERS: { text: string, id: StorageProvider }[] = [
  { text: 'AWS S3', id: StorageProvider.AWS },
  { text: 'GCP', id: StorageProvider.GCP },
  { text: 'Azure Blob Storage', id: StorageProvider.Azure },
  { text: 'MinIO', id: StorageProvider.Minio }
]

beforeEach(() => {
  propsData = { value: 'aws' }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(StorageProviderSelect, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('should use 4 storage providers as options', () => {
  const wrapper = shallowMount(StorageProviderSelect, { localVue, propsData })

  expect(rootStubProps(wrapper, 'options')).toEqual(STORAGE_PROVIDERS)
})
