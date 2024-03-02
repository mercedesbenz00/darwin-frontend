import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueJSModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildStoragePayload
} from 'test/unit/factories/buildStoragePayload'
import { triggerRootStub } from 'test/unit/testHelpers'

import AwsStorageForm from '@/components/Storage/Forms/AwsStorageForm.vue'
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
  bucketInput: 'input-field-stub#storageBucket'
}

let propsData: {
  value: StoragePayload
}
let storagePayload: ReturnType<typeof buildStoragePayload>

beforeEach(() => {
  store = createTestStore()
  storagePayload = buildStoragePayload({})
  propsData = { value: storagePayload }
})

it('matches snaphsot', () => {
  const wrapper = shallowMount(AwsStorageForm, { localVue, mocks, store, propsData })
  expect(wrapper).toMatchSnapshot()
})

describe('validation', () => {
  let data: () => {
    name: string
    bucket: string
    prefix: string
    region: string
  }
  beforeEach(() => {
    data = () => ({
      name: 'name',
      bucket: 'bucket',
      prefix: 'prefix',
      region: 'region'
    })
  })

  it('shows error when name is empty', async () => {
    propsData.value.name = ''
    const wrapper = shallowMount(AwsStorageForm, { localVue, data, mocks, store, propsData })
    await triggerRootStub(wrapper, 'submit')
    expect(wrapper.find(model.nameInput).props('error')).toEqual('Storage name cannot be empty')
    expect(mocks.$ga.event).toBeCalledWith('aws_storage', 'submit', 'failure_form_invalid')
  })

  it('shows error when bucket is empty', async () => {
    propsData.value.bucket = ''
    const wrapper = shallowMount(AwsStorageForm, { localVue, data, mocks, store, propsData })
    await triggerRootStub(wrapper, 'submit')
    expect(wrapper.find(model.bucketInput).props('error')).toEqual('Bucket cannot be empty')
    expect(mocks.$ga.event).toBeCalledWith('aws_storage', 'submit', 'failure_form_invalid')
  })

  it('submit fails when region is empty', async () => {
    propsData.value.region = ''
    const wrapper = shallowMount(AwsStorageForm, { localVue, data, mocks, store, propsData })
    await triggerRootStub(wrapper, 'submit')
    expect(mocks.$ga.event).toBeCalledWith('aws_storage', 'submit', 'failure_form_invalid')
  })
})
