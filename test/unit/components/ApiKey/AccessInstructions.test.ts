import { shallowMount, createLocalVue } from '@vue/test-utils'

import AccessInstructions from '@/components/ApiKey/AccessInstructions.vue'
import { ACCESS_CODES as GENERAL_ACCESS_CODES } from '@/components/ApiKey/snippets'
import { ACCESS_CODES as MODEL_ACCESS_CODES } from '@/components/Models/ApiKeyManagement/snippets'

const localVue = createLocalVue()

const generalSnippets = Object.entries(GENERAL_ACCESS_CODES).map(([language, code]) => ({ language, code }))

generalSnippets.forEach(({ language }) => {
  it(`matches general snapshot for language: ${language}`, async () => {
    const propsData = { snippets: generalSnippets }
    const wrapper = shallowMount(AccessInstructions, { localVue, propsData })
    await wrapper.find('tab-selector-stub').vm.$emit('change', language)
    expect(wrapper).toMatchSnapshot()
  })
})

const modelSnippets = Object.entries(MODEL_ACCESS_CODES).map(([language, code]) => ({ language, code }))

modelSnippets.forEach(({ language }) => {
  it(`matches model snapshot for language: ${language}`, async () => {
    const propsData = { snippets: modelSnippets }
    const wrapper = shallowMount(AccessInstructions, { localVue, propsData })
    await wrapper.find('tab-selector-stub').vm.$emit('change', language)
    expect(wrapper).toMatchSnapshot()
  })
})

it('sets language on tab select', async () => {
  const propsData = { snippets: generalSnippets }
  const wrapper = shallowMount(AccessInstructions, { localVue, propsData })
  expect(wrapper.vm.$data.language).toEqual('cli')
  await wrapper.find('tab-selector-stub').vm.$emit('change', 'python')
  expect(wrapper.vm.$data.language).toEqual('python')
})
