import { createLocalVue, shallowMount } from '@vue/test-utils'

import ExportFormatPill from '@/components/DatasetManagement/ExportDialog/V1/ExportFormatPill.vue'
import { ExportFormatPillType } from '@/components/DatasetManagement/ExportDialog/types'

const localVue = createLocalVue()

let propsData: { pill: ExportFormatPillType }

['feather-light', 'pink', 'yellow'].forEach(pill => {
  it('matches snapshot', () => {
    propsData = { pill: { name: 'Name', type: pill as any } }
    const wrapper = shallowMount(ExportFormatPill, { localVue, propsData })
    expect(wrapper).toMatchSnapshot()
  })
})
