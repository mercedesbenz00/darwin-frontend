import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import md5 from 'blueimp-md5'
import flushPromises from 'flush-promises'
import { enableFetchMocks } from 'jest-fetch-mock'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import AvatarUpload from '@/components/Common/AvatarUpload/AvatarUpload.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.directive('lazy', () => { })
localVue.directive('loading', stubDirectiveWithAttribute)
installCommonComponents(localVue)

const slots = {
  placeholder: { template: '<div class="avatar-upload__placeholder" />' }
}
let stubs: Stubs
let propsData: {
  src: string | null
  name?: string
  companyUrl?: string
  canUpload?: boolean
  disabled?: boolean
  loading?: boolean
}

beforeEach(() => {
  stubs = {
    'clearbit-logo': {
      template: `
        <div class="clearbit-logo">
          <img :src="companyUrl" />
          <slot />
        </div>
      `,
      props: { companyUrl: { type: String } }
    }
  }
})

it('matches snapshot for user who has avatar and can upload', () => {
  propsData = { src: 'foo', canUpload: true }
  const wrapper = shallowMount(AvatarUpload, { localVue, propsData, slots, stubs })
  expect(wrapper.element).toMatchSnapshot('yes avatar, yes upload')
})

it('matches snapshot for user who has avatar and cannot upload', () => {
  propsData = { src: 'foo', canUpload: false }
  const wrapper = shallowMount(AvatarUpload, { localVue, propsData, slots, stubs })
  expect(wrapper.element).toMatchSnapshot('yes avatar no upload')
})

it('matches snapshot for user who has no avatar and can upload', () => {
  propsData = { src: null, canUpload: true, name: 'John Doe' }
  const wrapper = shallowMount(AvatarUpload, { localVue, propsData, slots, stubs })
  expect(wrapper.element).toMatchSnapshot('no avatar, yes upload')
})

it('matches snapshot for user who has no avatar and cannot upload', () => {
  propsData = { src: null, canUpload: false, name: 'John Doe' }
  const wrapper = shallowMount(AvatarUpload, { localVue, propsData, slots, stubs })
  expect(wrapper.element).toMatchSnapshot('no avatar no upload')
})

it('matches snapshot with company url', () => {
  propsData = { src: null, companyUrl: 'v7labs.com', name: 'John Doe' }
  const wrapper = shallowMount(AvatarUpload, { localVue, propsData, slots, stubs })
  expect(wrapper.element).toMatchSnapshot()
})

it('matches snapshot when uploading', () => {
  propsData = { src: 'foo', canUpload: true, loading: true }
  const wrapper = shallowMount(AvatarUpload, { localVue, propsData, slots, stubs })
  expect(wrapper.element).toMatchSnapshot()
})

it('matches snapshot when disabled', () => {
  propsData = { src: 'foo', canUpload: true, disabled: true }
  const wrapper = shallowMount(AvatarUpload, { localVue, propsData, slots, stubs })
  expect(wrapper.element).toMatchSnapshot()
})

it('triggers image load on file select', async () => {
  propsData = { src: null, canUpload: true, name: 'John Doe' }
  const wrapper = shallowMount(AvatarUpload, { localVue, propsData, slots, stubs })

  const file = new File(['fakecontent'], 'programmatically_created.png', { type: 'image/png' })
  const component = wrapper.vm as any
  await component.onFile({ target: { files: [file] } })

  expect(wrapper.emitted().change).toEqual([[{
    hash: md5('fakecontent'),
    file,
    type: file.type
  }]])
  expect(component.image).toEqual(`data:image/png;base64,${btoa('fakecontent')}`)
})

it('emits change when clearbit logo loaded', async () => {
  enableFetchMocks()
  propsData = { src: null, companyUrl: 'v7labs.com', name: 'John Doe' }
  stubs = { 'clearbit-logo': true }
  const wrapper = shallowMount(AvatarUpload, { localVue, propsData, slots, stubs })
  fetchMock.mockResponseOnce('fakecontent')

  await wrapper.find('clearbit-logo-stub').vm.$emit('load', '//logo.clearbit.com/v7labs.com')
  await flushPromises()
  await flushPromises()
  await flushPromises()
  expect(wrapper.emitted().change).toBeDefined()
})

it('emits change with null when clearbit logo errored', async () => {
  propsData = { src: null, companyUrl: 'v7labs.com', name: 'John Doe' }
  stubs = { 'clearbit-logo': true }
  const wrapper = shallowMount(AvatarUpload, { localVue, propsData, slots, stubs })

  await wrapper.find('clearbit-logo-stub').vm.$emit('error')
  expect(wrapper.emitted().change).toEqual([[null]])
})
