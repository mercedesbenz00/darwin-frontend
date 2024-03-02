import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VModal from 'vue-js-modal'
import VueLazyload from 'vue-lazyload'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildStageAnnotationPayload,
  buildTeamPayload
} from 'test/unit/factories'
import { flask, bottle, scale } from 'test/unit/fixtures/annotation-class-payloads'

import Workview from '@/components/WorkView/Workview.vue'
import enterDirective from '@/directives/enter'
import escDirective from '@/directives/esc'
import loadingDirective from '@/directives/loading'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

const localVue = createLocalVue()

localVue.prototype.$ga = { event () { } }

localVue.use(Vuex)
localVue.use(VModal)
localVue.use(VueLazyload)
localVue.directive('enter', enterDirective)
localVue.directive('esc', escDirective)
localVue.directive('loading', loadingDirective)

const stubs: Stubs = { 'image-manipulation': true }
const computed = {
  isSocketCheckDisabled (): boolean { return false }
}

const v7 = buildTeamPayload({ id: 1 })
const dataset = buildDatasetPayload({
  id: 2,
  name: 'Foo',
  instructions: 'Foo',
  team_id: v7.id
})

let mocks: {
  $can: () => boolean
  $featureEnabled: () => boolean
  $theme: ReturnType<typeof createMockTheme>
}

let store: ReturnType<typeof createTestStore>
let propsData: {
  editor: Editor,
  hotkeys: []
}

const pageModel = {
  creditsPopup: 'credits-popup-stub',
  hotkeysSidebar: 'hotkey-info-sidebar-stub',
  imageManipulationSidebar: 'image-manipulation-sidebar-stub',
  instructionsModalName: 'modalInstructions',
  instructionsSidebar: 'instructions-sidebar-stub',
  trackerOfflineDialog: 'tracker-offline-dialog-stub',
  planExpiredDialog: 'plan-expired-dialog-stub',
  outOfStorageDialog: 'out-of-storage-dialog-stub'
}

beforeEach(() => {
  store = createTestStore()

  store.dispatch = jest.fn().mockImplementation((action: string) => {
    if (action === 'admin/indexTeamFeatures') { return { data: [] } }
    return { data: {} }
  })
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('workview/SET_DATASET', dataset)
  store.commit('aclass/SET_CLASSES', [flask, bottle, scale])

  const editor = new Editor(new ItemManager(store), store)
  const plugins = editor.pluginManager.pluginsForDataset(dataset, [])
  editor.installAllPlugins(plugins)

  propsData = { editor, hotkeys: [] }

  mocks = {
    $can: () => true,
    $featureEnabled: () => true,
    $theme: createMockTheme()
  }
})

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(Workview, { localVue, store, propsData, mocks, computed })
  expect(wrapper).toMatchSnapshot()
})

it('set ui store sidebarMinimized as true when mounted', () => {
  shallowMount(Workview, { localVue, store, propsData, mocks })
  expect(store.state.ui.sidebarMinimized).toBeTruthy()
})

describe('in normal mode, as member', () => {
  beforeEach(() => {
    mocks.$can = () => false
  })

  itMatchesSnapshot()

  it('does not render credits popup', () => {
    const wrapper = shallowMount(Workview, { localVue, store, propsData, mocks, computed })
    expect(wrapper.find(pageModel.creditsPopup).exists()).toBe(false)
  })

  it('renders tracker offline dialog', () => {
    const wrapper = shallowMount(Workview, { localVue, store, propsData, mocks, computed })
    expect(wrapper.find(pageModel.trackerOfflineDialog).exists()).toBe(true)
  })

  it('renders plan expired dialog', () => {
    const wrapper = shallowMount(Workview, { localVue, store, propsData, mocks, computed })
    expect(wrapper.find(pageModel.planExpiredDialog).exists()).toBe(true)
  })
})

describe('in normal mode, as owner', () => {
  beforeEach(() => {
    mocks.$can = () => true
  })

  itMatchesSnapshot()

  it('renders credits popup', () => {
    const wrapper = shallowMount(Workview, { localVue, store, propsData, mocks, computed })
    expect(wrapper.find(pageModel.creditsPopup).exists()).toBe(true)
  })

  it('renders tracker offline dialog', () => {
    const wrapper = shallowMount(Workview, { localVue, store, propsData, mocks, computed })
    expect(wrapper.find(pageModel.trackerOfflineDialog).exists()).toBe(true)
  })

  it('renders plan expired dialog', () => {
    const wrapper = shallowMount(Workview, { localVue, store, propsData, mocks, computed })
    expect(wrapper.find(pageModel.planExpiredDialog).exists()).toBe(true)
  })
})

itMatchesSnapshot()

describe('in tutorial', () => {
  beforeEach(() => {
    store.commit('workview/SET_TUTORIAL_MODE', true)
  })

  itMatchesSnapshot()

  it('does not render tracker offline dialog', () => {
    const wrapper = shallowMount(Workview, { localVue, store, propsData, mocks, computed })
    expect(wrapper.find(pageModel.trackerOfflineDialog).exists()).toBe(false)
  })

  it('does not render plan expired dialog', () => {
    const wrapper = shallowMount(Workview, { localVue, store, propsData, mocks, computed })
    expect(wrapper.find(pageModel.planExpiredDialog).exists()).toBeFalsy()
  })
})

describe('public dataset', () => {
  describe('when not logged in', () => {
    beforeEach(() => {
      store.commit('team/UNSET_CURRENT_TEAM')
    })

    itMatchesSnapshot()

    it('does not render plan expired dialog', () => {
      const wrapper = shallowMount(Workview, { localVue, store, propsData, mocks, computed })
      expect(wrapper.find(pageModel.planExpiredDialog).exists()).toBeFalsy()
    })
  })

  describe('when the dataset is public and current team is not the owner of the dataset', () => {
    beforeEach(() => {
      const publicDataset = buildDatasetPayload({
        id: 2,
        name: 'Foo',
        instructions: 'Foo',
        public: true,
        team_id: 2
      })
      store.commit('workview/SET_DATASET', publicDataset)
      store.commit('aclass/SET_CLASSES', [flask, bottle, scale])
    })

    itMatchesSnapshot()

    it('does not render plan expired dialog', () => {
      const wrapper = shallowMount(Workview, { localVue, store, propsData, mocks, computed })
      expect(wrapper.find(pageModel.planExpiredDialog).exists()).toBeFalsy()
    })
  })
})

it('renders slots', () => {
  const slots = {
    default: 'Default content',
    top: 'Top content',
    left: 'Left content',
    right: 'Right content',
    bottom: 'Bottom content',
    'sticky-bars': 'Sticky bar content',
    main: 'Main content'
  }

  const wrapper = shallowMount(Workview, { localVue, store, propsData, slots, mocks, computed })

  expect(wrapper.text()).toContain('Default content')
  expect(wrapper.text()).toContain('Top content')
  expect(wrapper.text()).toContain('Left content')
  expect(wrapper.text()).toContain('Right content')
  expect(wrapper.text()).toContain('Bottom content')
  expect(wrapper.text()).toContain('Main content')
})

it('closes other drawers when instructions open', async () => {
  const wrapper = shallowMount(Workview, { localVue, store, propsData, mocks, computed, stubs })
  await wrapper.find(pageModel.instructionsSidebar).vm.$emit('open')

  expect(wrapper.find('hotkey-info-sidebar-stub').props('open')).toBeFalsy()
  expect(wrapper.find('image-manipulation-sidebar-stub').props('open')).toBeFalsy()
})

it('closes other drawers when hotkeys open', async () => {
  const wrapper = shallowMount(Workview, { localVue, store, propsData, mocks, computed, stubs })
  await wrapper.find(pageModel.hotkeysSidebar).vm.$emit('open')

  expect(wrapper.find('instructions-sidebar-stub').props('open')).toBeFalsy()
  expect(wrapper.find('image-manipulation-sidebar-stub').props('open')).toBeFalsy()
})

it('opens instructions in a modal', async () => {
  const wrapper = shallowMount(Workview, { localVue, store, propsData, mocks, computed, stubs })
  jest.spyOn(wrapper.vm.$modal, 'show')
  store.commit('workview/OPEN_INSTRUCTIONS')
  await wrapper.vm.$nextTick()
  expect(wrapper.vm.$modal.show).toHaveBeenCalledWith(pageModel.instructionsModalName)
})

it('set proper tool annotation types when selected annotation changes', async () => {
  shallowMount(Workview, { localVue, store, propsData, mocks, computed })
  propsData.editor.activateTool('edit_tool')
  store.commit(
    'workview/PUSH_STAGE_ANNOTATION',
    {
      ...buildStageAnnotationPayload({ annotation_class_id: 1, workflow_stage_id: 1 }),
      isSelected: true
    }
  )
  jest.spyOn(store, 'commit').mockReturnValue(undefined)
  jest.spyOn(propsData.editor.toolManager, 'currentAnnotationTypes').mockReturnValue(['polygon'])
  await flushPromises()
  expect(store.commit).toBeCalledWith('workview/SET_TOOL_ANNOTATION_TYPES', ['polygon'])
  expect(store.commit).toBeCalledWith('workview/PRESELECT_CLASS_ID_WITHOUT_TOOL_CHANGE', 1)
})

it('renders dataset channel subscriber', () => {
  const wrapper = shallowMount(Workview, { localVue, store, propsData, mocks, computed })
  expect(wrapper.find('dataset-channel-subscriber-stub').exists()).toBe(true)
})

it('renders comment UI', () => {
  const wrapper = shallowMount(Workview, { localVue, store, propsData, mocks, computed })
  expect(wrapper.find('comment-thread-stub').exists()).toBe(true)
})

describe('when isSockerCheckDisabled is true', () => {
  beforeEach(() => {
    computed.isSocketCheckDisabled = (): boolean => { return true }
  })

  itMatchesSnapshot()

  it('hides the trackerOfflineDialog, planExpiredDialog and outOfStorageDialog', () => {
    const wrapper = shallowMount(Workview, { localVue, store, propsData, mocks, computed })
    expect(wrapper.find(pageModel.trackerOfflineDialog).exists()).toBe(false)
    expect(wrapper.find(pageModel.planExpiredDialog).exists()).toBe(false)
    expect(wrapper.find(pageModel.outOfStorageDialog).exists()).toBe(false)
  })
})
