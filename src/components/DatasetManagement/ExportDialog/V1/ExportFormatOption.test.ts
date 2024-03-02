import { createLocalVue, shallowMount } from '@vue/test-utils'

import ExportFormatOption from '@/components/DatasetManagement/ExportDialog/V1/ExportFormatOption.vue'
import { ExportFormatOptionType } from '@/components/DatasetManagement/ExportDialog/types'

const localVue = createLocalVue()

let propsData: { option: ExportFormatOptionType }

beforeEach(() => {
  propsData = {
    option: {
      id: 'coco',
      label: 'COCO',
      pills: [{ name: 'Very Slow', type: 'pink' }]
    }
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ExportFormatOption, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
