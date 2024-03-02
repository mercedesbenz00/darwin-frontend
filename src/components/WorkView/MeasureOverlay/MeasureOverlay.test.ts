import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import MeasureOverlay from '@/components/WorkView/MeasureOverlay/MeasureOverlay.vue'
import { MeasureOverlayData } from '@/engine/models'
import { Point } from '@/engineCommon/point'

const localVue = createLocalVue()
localVue.use(Vuex)

let propsData: { data: MeasureOverlayData }

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()

  const position = new Point<'Canvas'>({ x: 10, y: 10 })
  propsData = {
    data: {
      id: 'id',
      color: 'rgba(0, 0, 0, 0.1)',
      label: 'Length: 100cm',
      measures: [{ center: 'HOR', position, value: '100', unit: 'cm' }]
    }
  }
})

it('matches snapshot in HOR mode', () => {
  const wrapper = shallowMount(MeasureOverlay, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot in VER mode', () => {
  propsData.data.measures[0].center = 'VER'
  const wrapper = shallowMount(MeasureOverlay, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
