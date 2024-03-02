import { shallowMount } from '@vue/test-utils'

import ModelStat from '@/components/Models/ModelStats/ModelStat.vue'

let propsData: {
  name: string
  score?: string
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(ModelStat, { propsData })
  expect(wrapper).toMatchSnapshot()
})

describe('when score is undefined, the grid has 2 columns', () => {
  beforeEach(() => {
    propsData = { name: 'stat' }
  })

  itMatchesSnapshot()
})

describe('when score is defined, the grid has 3 columns', () => {
  beforeEach(() => {
    propsData = { name: 'stat', score: '89%' }
  })

  itMatchesSnapshot()
})
