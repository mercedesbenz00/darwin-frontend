import { createLocalVue, shallowMount } from '@vue/test-utils'

import { buildCodeStageTemplatePayload } from 'test/unit/factories'

import CodeStage from '@/components/DatasetSettings/Stage/CodeStage.vue'
import { CodeStageTemplatePayload } from '@/store/types'

const localVue = createLocalVue()
let propsData: {
  deletable?: boolean
  stage: CodeStageTemplatePayload
}

const model = {
  deleteButton: 'delete-button-stub',
  nameField: 'stage-title-stub',
  sessionDropdown: 'dropdown-stub'
}

beforeEach(() => {
  propsData = {
    stage: buildCodeStageTemplatePayload({ id: 1, name: 'Transform' })
  }
})

const itMatchesSnapshot = (): void => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(CodeStage, { localVue, propsData })
    expect(wrapper).toMatchSnapshot()
  })
}

describe('when deletable', () => {
  beforeEach(() => {
    propsData.deletable = true
  })

  itMatchesSnapshot()

  it('renders delete button', () => {
    const wrapper = shallowMount(CodeStage, { localVue, propsData })
    expect(wrapper.find(model.deleteButton).exists()).toBeTruthy()
  })

  it('emits delete', async () => {
    const wrapper = shallowMount(CodeStage, { localVue, propsData })
    await wrapper.find(model.deleteButton).vm.$emit('click')
    expect(wrapper.emitted().delete!.length).toEqual(1)
  })
})

describe('when not deletable', () => {
  beforeEach(() => {
    propsData.deletable = false
  })

  itMatchesSnapshot()

  it('does not render delete button', () => {
    const wrapper = shallowMount(CodeStage, { localVue, propsData })
    expect(wrapper.find(model.deleteButton).exists()).toBeFalsy()
  })
})

it('binds name', async () => {
  const wrapper = shallowMount(CodeStage, { localVue, propsData })
  expect(wrapper.find(model.nameField).props('value')).toEqual('Transform')

  await wrapper.setProps({ stage: { ...propsData.stage, name: 'Logic' } })
  expect(wrapper.find(model.nameField).props('value')).toEqual('Logic')
})

it('emits on name change', async () => {
  const wrapper = shallowMount(CodeStage, { localVue, propsData })
  await wrapper.find(model.nameField).vm.$emit('change', 'New name')
  expect(wrapper.emitted().change![0]).toEqual([{ ...propsData.stage, name: 'New name' }])
})
