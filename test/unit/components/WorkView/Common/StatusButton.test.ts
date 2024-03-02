import { createLocalVue, shallowMount } from '@vue/test-utils'

import StatusButton from '@/components/WorkView/Common/StatusButton/V1/StatusButton.vue'
import { DatasetItemStatus } from '@/store/types'

const localVue = createLocalVue()

let propsData: { type: DatasetItemStatus }

[
  DatasetItemStatus.annotate,
  DatasetItemStatus.archived,
  DatasetItemStatus.complete,
  DatasetItemStatus.error,
  DatasetItemStatus.new,
  DatasetItemStatus.processing,
  DatasetItemStatus.review,
  DatasetItemStatus.uploading
].forEach((status) => {
  describe(`when status is ${status}`, () => {
    beforeEach(() => { propsData = { type: status } })

    it('matches snapshot', () => {
      const wrapper = shallowMount(StatusButton, { localVue, propsData })
      expect(wrapper).toMatchSnapshot()
    })
  })
})
