import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { initializeARWorkflow } from 'test/unit/factories/helpers'

import StageInstanceWithTimer from '@/components/WorkView/Common/StageInstanceWithTimer.vue'
import { StageInstanceWithTimerProps } from '@/components/WorkView/Common/types'
import { ReviewStatus, DatasetItemPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let propsData: StageInstanceWithTimerProps
let store: ReturnType<typeof createTestStore>

let item: DatasetItemPayload

beforeEach(() => {
  item = initializeARWorkflow({ id: 1 })

  propsData = {
    instance: item.current_workflow!.stages[2][0]
  }

  store = createTestStore()
  store.commit('workview/PUSH_DATASET_ITEMS', [item])
  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
})

describe('in annotate stage', () => {
  beforeEach(() => {
    propsData.instance = item.current_workflow!.stages[1][0]
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(StageInstanceWithTimer, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  describe('with autocompletion', () => {
    beforeEach(() => {
      propsData.instance.completes_at = 1234567
    })

    it('matches snapshot when progressing', () => {
      const wrapper = shallowMount(StageInstanceWithTimer, { localVue, propsData, store })
      expect(wrapper).toMatchSnapshot()
    })

    it('matches snapshot when skipping', () => {
      propsData.instance.skipped = true
      propsData.instance.skipped_reason = 'Other'

      const wrapper = shallowMount(StageInstanceWithTimer, { localVue, propsData, store })
      expect(wrapper).toMatchSnapshot()
    })
  })
})

describe('in review stage', () => {
  beforeEach(() => {
    propsData.instance = item.current_workflow!.stages[2][0]
  })

  it('matches snapshot', () => {
    delete propsData.instance.metadata.review_status
    const wrapper = shallowMount(StageInstanceWithTimer, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  describe('with autocompletion', () => {
    beforeEach(() => {
      propsData.instance.completes_at = 1234567
    })

    it('matches snapshot when implicitly approving', () => {
      delete propsData.instance.metadata.review_status
      const wrapper = shallowMount(StageInstanceWithTimer, { localVue, propsData, store })
      expect(wrapper).toMatchSnapshot()
    })

    it('matches snapshot when approving', () => {
      propsData.instance.metadata.review_status = ReviewStatus.Approved
      const wrapper = shallowMount(StageInstanceWithTimer, { localVue, propsData, store })
      expect(wrapper).toMatchSnapshot()
    })

    it('matches snapshot when rejecting', () => {
      propsData.instance.metadata.review_status = ReviewStatus.Rejected
      const wrapper = shallowMount(StageInstanceWithTimer, { localVue, propsData, store })
      expect(wrapper).toMatchSnapshot()
    })

    it('matches snapshot when archiving', () => {
      propsData.instance.metadata.review_status = ReviewStatus.Archived
      const wrapper = shallowMount(StageInstanceWithTimer, { localVue, propsData, store })
      expect(wrapper).toMatchSnapshot()
    })
  })
})

describe('in complete stage', () => {
  beforeEach(() => {
    propsData.instance = item.current_workflow!.stages[3][0]
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(StageInstanceWithTimer, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
})
