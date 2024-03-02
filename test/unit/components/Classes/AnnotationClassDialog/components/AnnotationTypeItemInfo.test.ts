import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import { buildAnnotationTypePayload } from 'test/unit/factories'
import { VPopover } from 'test/unit/stubs'

import AnnotationTypeItemInfo from '@/components/Classes/AnnotationClassDialog/components/AnnotationTypeItemInfo/AnnotationTypeItemInfo.vue'
import { AnnotationTypeRichPayload, annotationTypeRichData } from '@/utils'

const localVue = createLocalVue()

let propsData: {
  data: AnnotationTypeRichPayload
}
const stubs: Stubs = { VPopover }

annotationTypeRichData.forEach((data: any) => {
  it('matches snapshot', () => {
    propsData = {
      data: {
        ...buildAnnotationTypePayload({ id: 1 }),
        ...data
      }
    }
    const wrapper = shallowMount(AnnotationTypeItemInfo, { localVue, propsData, stubs })
    expect(wrapper).toMatchSnapshot()
  })
})
