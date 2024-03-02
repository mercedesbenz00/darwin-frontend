import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAnnotationClassPayload, buildDatasetPayload, buildTeamPayload } from 'test/unit/factories'
import { emitRootStub } from 'test/unit/testHelpers'

import WorkviewClassDialog from '@/components/WorkView/ClassSelection/WorkviewClassDialog.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { DatasetPayload, TeamPayload } from '@/store/types'
import { polygon, boundingBox } from '@/utils/tutorialBackend/data/annotationTypes'

const localVue = createLocalVue()
let store: ReturnType<typeof createTestStore>
let propsData: {
  editor: Editor
}
let mocks: { $can: () => boolean }

let dataset: DatasetPayload
let v7: TeamPayload

localVue.use(Vuex)
beforeEach(() => {
  dataset = buildDatasetPayload({ id: 1 })
  v7 = buildTeamPayload({ id: 2 })
  store = createTestStore()
  store.commit('workview/SET_DATASET', dataset)
  store.commit('aclass/SET_TYPES', [polygon, boundingBox])
  store.commit('team/SET_CURRENT_TEAM', v7)
  propsData = { editor: new Editor(new ItemManager(store), store) }
  mocks = { $can: () => true }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(WorkviewClassDialog, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('commits created class into store', async () => {
  const wrapper = shallowMount(WorkviewClassDialog, { localVue, mocks, propsData, store })
  await emitRootStub(wrapper, 'add', { data: buildAnnotationClassPayload({ id: 1 }) })
  expect(store.state.aclass.classes.length).toEqual(1)
})
