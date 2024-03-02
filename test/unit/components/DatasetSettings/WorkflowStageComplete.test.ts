import { createLocalVue, shallowMount } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import WorkflowStageComplete from '@/components/DatasetSettings/WorkflowStageComplete.vue'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)

it('matches snapshot', () => {
  const wrapper = shallowMount(WorkflowStageComplete, { localVue })
  expect(wrapper).toMatchSnapshot()
})
