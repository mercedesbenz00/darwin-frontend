import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueJSModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildStoragePayload
} from 'test/unit/factories/buildStoragePayload'
import { triggerRootStub } from 'test/unit/testHelpers'

import AzureStorageForm from '@/components/Storage/Forms/AzureStorageForm.vue'
import loadingDirective from '@/directives/loading'
import { installCommonComponents } from '@/plugins/components'
import { StoragePayload } from '@/store/types'

const localVue = createLocalVue()
installCommonComponents(localVue)
localVue.use(Vuex)
localVue.use(VueJSModal)
localVue.directive('loading', loadingDirective)

let store: ReturnType<typeof createTestStore>
const mocks = {
  $ga: { event: jest.fn() }
}
const model = {
  nameInput: 'input-field-stub#storageName',
  bucketInput: 'input-field-stub#storageBucket',
  prefixInput: 'input-field-stub#storagePrefix',
  tenantIdInput: 'input-field-stub#tenantId'
}

let propsData: {
  value: StoragePayload
}
let storagePayload: ReturnType<typeof buildStoragePayload>

beforeEach(() => {
  store = createTestStore()
  storagePayload = buildStoragePayload({ provider: 'azure', tenant_id: 'tenant' })
  propsData = { value: storagePayload }
})

it('matches snaphsot', () => {
  const wrapper = shallowMount(AzureStorageForm, { localVue, mocks, store, propsData })
  expect(wrapper).toMatchSnapshot()
})

describe('validation', () => {
  let data: () => {
    name: string
    bucket: string
    prefix: string
    tenantId: string
  }
  beforeEach(() => {
    data = () => ({
      name: 'name',
      bucket: 'bucket',
      prefix: 'prefix',
      tenantId: 'tenant'
    })
  })

  it('shows error when name is empty', async () => {
    propsData.value.name = ''
    const wrapper = shallowMount(AzureStorageForm, { localVue, data, mocks, store, propsData })
    await triggerRootStub(wrapper, 'submit')
    expect(wrapper.find(model.nameInput).props('error')).toEqual('Storage name cannot be empty')
    expect(mocks.$ga.event).toBeCalledWith('azure_storage', 'submit', 'failure_form_invalid')
  })

  it('shows error when bucket is empty', async () => {
    propsData.value.bucket = ''
    const wrapper = shallowMount(AzureStorageForm, { localVue, data, mocks, store, propsData })
    await triggerRootStub(wrapper, 'submit')
    expect(wrapper.find(model.bucketInput).props('error')).toEqual('Bucket cannot be empty')
    expect(mocks.$ga.event).toBeCalledWith('azure_storage', 'submit', 'failure_form_invalid')
  })

  it('shows error when prefix is empty', async () => {
    propsData.value.prefix = ''
    const wrapper = shallowMount(AzureStorageForm, { localVue, data, mocks, store, propsData })
    await triggerRootStub(wrapper, 'submit')
    expect(wrapper.find(model.prefixInput).props('error')).toEqual('Prefix cannot be empty')
    expect(mocks.$ga.event).toBeCalledWith('azure_storage', 'submit', 'failure_form_invalid')
  })

  it('shows error when tenant id is empty', async () => {
    propsData.value.tenant_id = ''
    const wrapper = shallowMount(AzureStorageForm, { localVue, data, mocks, store, propsData })
    await triggerRootStub(wrapper, 'submit')
    expect(wrapper.find(model.tenantIdInput).props('error')).toEqual('Tenant id cannot be empty')
    expect(mocks.$ga.event).toBeCalledWith('azure_storage', 'submit', 'failure_form_invalid')
  })
})
