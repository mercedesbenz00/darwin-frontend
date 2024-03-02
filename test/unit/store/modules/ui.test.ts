import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { BreadCrumb } from '@/mixins/BreadCrumbInitializer'
import ui, { getInitialState as getInitialUIState } from '@/store/modules/ui'
import { RootState } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const newStore = () => {
  const store = new Vuex.Store<RootState>({
    modules: {
      ui: { ...ui, state: getInitialUIState() }
    }
  })

  return store
}

let store: ReturnType<typeof newStore>

beforeEach(() => { store = newStore() })

const fooCrumb: BreadCrumb = { to: '/foo', name: 'Foo' }
const barCrumb: BreadCrumb = { to: '/bar', name: 'Bar' }

describe('ui/setBreadCrumbs', () => {
  it('adds breadcrumb to store', async () => {
    await store.dispatch('ui/setBreadCrumbs', [fooCrumb, barCrumb])
    expect(store.state.ui.breadCrumbs).toEqual([fooCrumb, barCrumb])
  })
})

describe('ui/SET_WORKVIEW_VIDEO_FRAME_LINE_WIDTH', () => {
  it('sets workview video frame line width', () => {
    expect(store.state.ui.workviewVideoFrameLineWidth).toBe(4)
    store.commit('ui/SET_WORKVIEW_VIDEO_FRAME_LINE_WIDTH', 10)
    expect(store.state.ui.workviewVideoFrameLineWidth).toBe(10)
  })
})

describe('ui/SET_WORKVIEW_OVERLAY_TEXT', () => {
  it('sets workview overlay text', () => {
    expect(store.state.ui.workviewOverlayText).toBeNull()
    store.commit('ui/SET_WORKVIEW_OVERLAY_TEXT', 'new text')
    expect(store.state.ui.workviewOverlayText).toBe('new text')
  })
})
