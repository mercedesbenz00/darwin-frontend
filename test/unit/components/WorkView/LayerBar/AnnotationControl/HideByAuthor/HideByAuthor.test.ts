import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex, { Store } from 'vuex'

import { buildAnnotationActorPayload } from 'test/unit/factories'

import HideByAuthor
  from '@/components/WorkView/LayerBar/AnnotationControl/HideByAuthor/HideByAuthor.vue'
import workview, { getInitialState as workviewState } from '@/store/modules/workview'
import { AnnotationActorStat } from '@/store/modules/workview/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const actorStatsMock = jest.fn()
const createGetterMockedStore = () => {
  const store = new Store({
    modules: {
      workview: {
        ...workview,
        getters: {
          ...workview.getters,
          selectedStageActiveActorStats: actorStatsMock
        },
        state: workviewState()
      }
    }
  })
  jest.spyOn(store, 'dispatch').mockResolvedValue({ data: {} })
  return store
}

let store: ReturnType<typeof createGetterMockedStore>
let actor1: AnnotationActorStat
let actor2: AnnotationActorStat

beforeEach(() => {
  store = createGetterMockedStore()
  actor1 = {
    actor: buildAnnotationActorPayload({ user_id: 1 }),
    count: 2
  }
  actor2 = {
    actor: buildAnnotationActorPayload({ user_id: 2 }),
    count: 5
  }
})

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(HideByAuthor, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

describe('with some actors', () => {
  beforeEach(() => {
    actorStatsMock.mockReturnValue([actor1, actor2])
  })

  itMatchesSnapshot()

  it('matches snapshot with one item is selected', () => {
    store.commit('workview/HIDE_ANNOTATIONS_BY_AUTHOR', actor1.actor.user_id)
    const wrapper = shallowMount(HideByAuthor, { localVue, store })
    expect(wrapper).toMatchSnapshot()
    expect(wrapper.findAll('hide-by-author-item-stub').at(0).props('selected')).toBeTruthy()
  })

  it('updates annotation visibility by author', async () => {
    const wrapper = shallowMount(HideByAuthor, { localVue, store })
    await wrapper.findAll('hide-by-author-item-stub').at(0).vm.$emit('click')
    expect(store.dispatch)
      .toBeCalledWith('workview/toggleAnnotationsVisibilityByAuthor', actor1.actor.user_id)
  })
})

describe('with no actors', () => {
  beforeEach(() => {
    actorStatsMock.mockReturnValue([])
  })

  itMatchesSnapshot()
})
