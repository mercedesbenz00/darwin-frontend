import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildUserPayload } from 'test/unit/factories'

import AnnotationTutorialBox from '@/components/AnnotationTutorialBox/AnnotationTutorialBox.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
const mocks = { $modal: { show: jest.fn() } }

beforeEach(() => {
  store = createTestStore()
})

describe('when tutorial was not seen yet', () => {
  beforeEach(() => {
    store.commit('user/SET_PROFILE', buildUserPayload({ tutorial_seen: false }))
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(AnnotationTutorialBox, { localVue, mocks, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('opens modal to confirm to hide tutorial', async () => {
    const wrapper = shallowMount(AnnotationTutorialBox, { localVue, mocks, store })
    await wrapper.find('.tutorial-box__hide').trigger('click')
    expect(mocks.$modal.show).toBeCalled()
  })

  it('updates tutorial_seen of current user', async () => {
    const wrapper = shallowMount(AnnotationTutorialBox, { localVue, mocks, store })
    await wrapper.find('confirmation-dialog-stub').vm.$emit('confirmed')
    expect(store.dispatch).toBeCalledWith('user/confirmTutorial')
  })
})

describe('when tutorial was seen already ', () => {
  beforeEach(() => {
    store.commit('user/SET_PROFILE', buildUserPayload({ tutorial_seen: true }))
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(AnnotationTutorialBox, { localVue, mocks, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders nothing', () => {
    const wrapper = shallowMount(AnnotationTutorialBox, { localVue, mocks, store })
    expect(wrapper.html()).toEqual('')
  })
})
