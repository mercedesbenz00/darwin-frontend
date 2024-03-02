import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'

import DropArea from './DropArea.vue'

const localVue = createLocalVue()
const mocks = { $toast: { warning: jest.fn() }}

beforeEach(() => {
  mocks.$toast.warning.mockClear()
})

it('matches snapshot when accepting all images', () => {
  const propsData = { acceptedFileTypes: ['image/*'] }
  const wrapper = shallowMount(DropArea, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when accepting all videos', () => {
  const propsData = { acceptedFileTypes: ['video/*'] }
  const wrapper = shallowMount(DropArea, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when accepting specific types', () => {
  const propsData = { acceptedFileTypes: ['image/jpg', 'video/mov'] }
  const wrapper = shallowMount(DropArea, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when supplied a slot', () => {
  const propsData = { acceptedFileTypes: ['image/jpg', 'video/mov'] }
  const slots = {
    default: '<div class="default-slot"></div>'
  }
  const wrapper = shallowMount(DropArea, { localVue, propsData, slots })
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.findAll('.default-slot')).toHaveLength(1)
})

it('matches snapshot when clicks are prevented', () => {
  const propsData = { acceptedFileTypes: ['image/jpg', 'video/mov'], openFilePickerOnClick: false }
  const wrapper = shallowMount(DropArea, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.findAll('label').length).toEqual(0)
})

const file1 = new File([''], 'foo.png', { type: 'image/jpg' })
const file2 = new File([''], 'foo.png', { type: 'image/jpg' })
const files = [file1, file2]

describe('onPaste', () => {
  const dispatchPaste = (files: File[]): void => {
    const items = files.map(f => ({ getAsFile: () => f }))
    const clipboardData = { items }

    const event = new Event('paste')
    Object.defineProperty(event, 'clipboardData', { value: clipboardData, writable: false })
    document.dispatchEvent(event)
  }

  it('emits if supported file pasted', () => {
    const propsData = { acceptedFileTypes: ['image/*'] }
    const wrapper = shallowMount(DropArea, { localVue, propsData })

    dispatchPaste(files)

    expect(wrapper.emitted()['files-added']).toEqual([[files]])
  })

  it('emits single file if mode is "single"', () => {
    const propsData = { acceptedFileTypes: ['image/*'], mode: 'single' }
    const wrapper = shallowMount(DropArea, { localVue, propsData })

    dispatchPaste(files)

    expect(wrapper.emitted()['file-added']).toEqual([[files[0]]])
  })

  it('does not emit if unsupported file pasted', () => {
    const propsData = { acceptedFileTypes: ['image/png'] }
    const wrapper = shallowMount(DropArea, { localVue, propsData })

    dispatchPaste(files)

    expect(wrapper.emitted()['files-added']).toBeUndefined()
  })
})

describe('onDrop', () => {
  const dispatchFileDropped = (wrapper: Wrapper<Vue>, files: File[]): void => {
    const dataTransfer = { files }
    const event = new Event('drop')
    Object.defineProperty(event, 'dataTransfer', { value: dataTransfer, writable: false })
    wrapper.find('label').element.dispatchEvent(event)
  }

  it('emits if supported file dropped', () => {
    const propsData = { acceptedFileTypes: ['image/*', '.png'] }
    const wrapper = shallowMount(DropArea, { localVue, propsData })

    dispatchFileDropped(wrapper, files)

    expect(wrapper.emitted()['files-added']).toEqual([[files]])
  })

  it('emits single file if mode is "single"', () => {
    const propsData = { acceptedFileTypes: ['image/*', '.png'], mode: 'single' }
    const wrapper = shallowMount(DropArea, { localVue, propsData })

    dispatchFileDropped(wrapper, files)

    expect(wrapper.emitted()['file-added']).toEqual([[files[0]]])
  })

  it('does not emit if unsupported file dropped', () => {
    const propsData = { acceptedFileTypes: ['music/*'] }
    const wrapper = shallowMount(DropArea, { localVue, mocks, propsData })

    dispatchFileDropped(wrapper, files)

    expect(wrapper.emitted()['files-added']).toBeUndefined()
  })

  it('dispatches toast if unsupported file dropped', () => {
    const propsData = { acceptedFileTypes: ['.jpg'] }
    const wrapper = shallowMount(DropArea, { localVue, mocks, propsData })

    dispatchFileDropped(wrapper, files)

    expect(mocks.$toast.warning).toHaveBeenCalled()
  })
})

describe('onPick', () => {
  const dispatchFilePicked = (wrapper: Wrapper<Vue>, files: File[]): void => {
    const target = { files }
    const event = new Event('change')
    Object.defineProperty(event, 'target', { value: target, writable: false })

    wrapper.find('input').element.dispatchEvent(event)
  }

  it('emits if supported files picked', () => {
    const propsData = { acceptedFileTypes: ['image/*', '.png'] }
    const wrapper = shallowMount(DropArea, { localVue, propsData })

    dispatchFilePicked(wrapper, files)

    expect(wrapper.emitted()['files-added']).toEqual([[files]])
  })

  it('emits single file if mode is "single"', () => {
    const propsData = { acceptedFileTypes: ['image/*', '.png'], mode: 'single' }
    const wrapper = shallowMount(DropArea, { localVue, propsData })

    dispatchFilePicked(wrapper, files)

    expect(wrapper.emitted()['file-added']).toEqual([[files[0]]])
  })

  it('does not emit if unsupported file dropped', () => {
    const propsData = { acceptedFileTypes: ['image/png'] }
    const wrapper = shallowMount(DropArea, { localVue, mocks, propsData })

    dispatchFilePicked(wrapper, files)

    expect(wrapper.emitted()['files-added']).toBeUndefined()
  })

  it('dispatches toast if unsupported file dropped', () => {
    const propsData = { acceptedFileTypes: ['image/png'] }
    const wrapper = shallowMount(DropArea, { localVue, mocks, propsData })

    dispatchFilePicked(wrapper, files)

    expect(mocks.$toast.warning).toHaveBeenCalled()
  })
})
