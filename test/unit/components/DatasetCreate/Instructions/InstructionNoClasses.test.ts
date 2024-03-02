import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueLazyload from 'vue-lazyload'

import InstructionNoClasses from '@/components/DatasetCreate/Instructions/InstructionNoClasses.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(VueLazyload)
installCommonComponents(localVue)

it('matches the snapshot', () => {
  const wrapper = shallowMount(InstructionNoClasses, { localVue })
  expect(wrapper).toMatchSnapshot()
})

it('emits add event when click', async () => {
  const wrapper = shallowMount(InstructionNoClasses, { localVue })
  await wrapper.find('primary-button-stub').vm.$emit('click')
  expect(wrapper.emitted().add).toHaveLength(1)
})
