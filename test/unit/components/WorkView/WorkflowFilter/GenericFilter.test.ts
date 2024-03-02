import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetFolderPayload,
  buildDatasetItemFilenamePayload,
  buildDatasetPayload,
  buildMembershipPayload,
  buildTeamPayload
} from 'test/unit/factories'
import { emitRootStub, nthEmitted } from 'test/unit/testHelpers'

import GenericFilter from '@/components/WorkView/WorkflowFilter/GenericFilter.vue'
import {
  DatasetFolderPayload,
  DatasetItemFilenamePayload,
  DatasetPayload,
  LoadingStatus,
  MembershipPayload,
  TeamPayload
} from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let propsData: {
  positiveAssignees: number[]
  negativeAssignees: number[]
  positivePaths: string[]
  negativePaths: string[]
  positiveFilenames: string[]
  negativeFilenames: string[]
}
let v7: TeamPayload
let dataset: DatasetPayload
let members: MembershipPayload[]
let folders: DatasetFolderPayload[]
let filenames: DatasetItemFilenamePayload[]
const mocks = { $can: () => true }

beforeEach(() => {
  store = createTestStore()
  v7 = buildTeamPayload({ id: 1, name: 'V7' })
  dataset = buildDatasetPayload({ id: 1 })
  members = [
    buildMembershipPayload({ user_id: 1, first_name: 'Test', last_name: 'Annotator1', team_id: v7.id }),
    buildMembershipPayload({ user_id: 2, first_name: 'Test', last_name: 'Annotator2', team_id: v7.id })
  ]
  folders = [
    buildDatasetFolderPayload({ path: '/' }),
    buildDatasetFolderPayload({ path: '/root' })
  ]
  filenames = [
    buildDatasetItemFilenamePayload({ filename: '1.jpg' }),
    buildDatasetItemFilenamePayload({ filename: '2.jpg' })
  ]

  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('team/SET_MEMBERSHIPS', members)
  store.commit('workview/SET_DATASET', dataset)
  store.commit('workview/SET_DATASET_FOLDERS', { datasetId: dataset.id, folders })
  store.commit('workview/SET_DATASET_ITEM_FILENAMES', filenames)

  propsData = {
    positiveAssignees: [members[0].id],
    negativeAssignees: [members[0].id],
    positiveFilenames: [filenames[0].filename],
    negativeFilenames: [filenames[0].filename],
    positivePaths: [folders[0].path],
    negativePaths: [folders[0].path]
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(GenericFilter, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when loading', () => {
  store.commit('loading/SET_ACTION_LOADING_STATUS', {
    key: 'workview/loadDatasetFolders',
    status: LoadingStatus.Loading
  })
  store.commit('loading/SET_ACTION_LOADING_STATUS', {
    key: 'workview/searchFilenames',
    status: LoadingStatus.Loading
  })
  const wrapper = shallowMount(GenericFilter, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

describe('filtering', () => {
  beforeEach(() => {
    propsData = {
      positiveAssignees: [],
      negativeAssignees: [],
      positiveFilenames: [],
      negativeFilenames: [],
      positivePaths: [],
      negativePaths: []
    }
  })

  it('sends filter action to store on positive annotator selection change', async () => {
    const wrapper = shallowMount(GenericFilter, { localVue, mocks, propsData, store })

    await emitRootStub(wrapper, 'change', { positiveMembers: [members[0]], negativeMembers: [] })
    expect(nthEmitted(wrapper, 'update:positive-assignees', 0)).toEqual([[1]])
    expect(nthEmitted(wrapper, 'change', 0)).toEqual([expect.objectContaining({ positiveAssignees: [1] })])

    await emitRootStub(wrapper, 'change', { positiveMembers: [members[1]], negativeMembers: [] })
    expect(nthEmitted(wrapper, 'update:positive-assignees', 1)).toEqual([[2]])
    expect(nthEmitted(wrapper, 'change', 1)).toEqual([expect.objectContaining({ positiveAssignees: [2] })])

    await emitRootStub(wrapper, 'change', { positiveMembers: members, negativeMembers: [] })
    expect(nthEmitted(wrapper, 'update:positive-assignees', 2)).toEqual([[1, 2]])
    expect(nthEmitted(wrapper, 'change', 2)).toEqual([expect.objectContaining({ positiveAssignees: [1, 2] })])

    await emitRootStub(wrapper, 'change', { positiveMembers: [], negativeMembers: [] })
    expect(nthEmitted(wrapper, 'update:positive-assignees', 3)).toEqual([[]])
    expect(nthEmitted(wrapper, 'change', 3)).toEqual([expect.objectContaining({ positiveAssignees: [] })])
  })

  it('sends filter action to store on positive folder selection change', async () => {
    const wrapper = shallowMount(GenericFilter, { localVue, mocks, propsData, store })

    await emitRootStub(wrapper, 'change', { positiveFolders: [folders[0]], negativeFolders: [] })
    expect(nthEmitted(wrapper, 'update:positive-paths', 0)).toEqual([['/']])
    expect(nthEmitted(wrapper, 'change', 0)).toEqual([expect.objectContaining({ positiveFolders: ['/'] })])

    await emitRootStub(wrapper, 'change', { positiveFolders: [folders[1]], negativeFolders: [] })
    expect(nthEmitted(wrapper, 'update:positive-paths', 1)).toEqual([['/root']])
    expect(nthEmitted(wrapper, 'change', 1)).toEqual([expect.objectContaining({ positiveFolders: ['/root'] })])

    await emitRootStub(wrapper, 'change', { positiveFolders: folders, negativeFolders: [] })
    expect(nthEmitted(wrapper, 'update:positive-paths', 2)).toEqual([['/', '/root']])
    expect(nthEmitted(wrapper, 'change', 2)).toEqual([expect.objectContaining({ positiveFolders: ['/', '/root'] })])

    await emitRootStub(wrapper, 'change', { positiveFolders: [], negativeFolders: [] })
    expect(nthEmitted(wrapper, 'update:positive-paths', 3)).toEqual([[]])
    expect(nthEmitted(wrapper, 'change', 3)).toEqual([expect.objectContaining({ positiveFolders: [] })])
  })

  it('sends filter action to store on positive filename selection change', async () => {
    const wrapper = shallowMount(GenericFilter, { localVue, mocks, propsData, store })

    await emitRootStub(wrapper, 'change', { positiveFilenames: [filenames[0]], negativeFilenames: [] })
    expect(nthEmitted(wrapper, 'update:positive-filenames', 0)).toEqual([['1.jpg']])
    expect(nthEmitted(wrapper, 'change', 0)).toEqual([expect.objectContaining({ positiveFilenames: ['1.jpg'] })])

    await emitRootStub(wrapper, 'change', { positiveFilenames: [filenames[1]], negativeFilenames: [] })
    expect(nthEmitted(wrapper, 'update:positive-filenames', 1)).toEqual([['2.jpg']])
    expect(nthEmitted(wrapper, 'change', 1)).toEqual([expect.objectContaining({ positiveFilenames: ['2.jpg'] })])

    await emitRootStub(wrapper, 'change', { positiveFilenames: filenames, negativeFilenames: [] })
    expect(nthEmitted(wrapper, 'update:positive-filenames', 2)).toEqual([['1.jpg', '2.jpg']])
    expect(nthEmitted(wrapper, 'change', 2)).toEqual([expect.objectContaining({ positiveFilenames: ['1.jpg', '2.jpg'] })])

    await emitRootStub(wrapper, 'change', { positiveFilenames: [], negativeFilenames: [] })
    expect(nthEmitted(wrapper, 'update:positive-filenames', 3)).toEqual([[]])
    expect(nthEmitted(wrapper, 'change', 3)).toEqual([expect.objectContaining({ positiveFilenames: [] })])
  })

  it('sends filter action to store on negative annotator selection change', async () => {
    const wrapper = shallowMount(GenericFilter, { localVue, mocks, propsData, store })

    await emitRootStub(wrapper, 'change', { positiveMembers: [], negativeMembers: [members[0]] })
    expect(nthEmitted(wrapper, 'update:negative-assignees', 0)).toEqual([[1]])
    expect(nthEmitted(wrapper, 'change', 0)).toEqual([expect.objectContaining({ negativeAssignees: [1] })])

    await emitRootStub(wrapper, 'change', { positiveMembers: [], negativeMembers: [members[1]] })
    expect(nthEmitted(wrapper, 'update:negative-assignees', 1)).toEqual([[2]])
    expect(nthEmitted(wrapper, 'change', 1)).toEqual([expect.objectContaining({ negativeAssignees: [2] })])

    await emitRootStub(wrapper, 'change', { positiveMembers: [], negativeMembers: members })
    expect(nthEmitted(wrapper, 'update:negative-assignees', 2)).toEqual([[1, 2]])
    expect(nthEmitted(wrapper, 'change', 2)).toEqual([expect.objectContaining({ negativeAssignees: [1, 2] })])

    await emitRootStub(wrapper, 'change', { positiveMembers: [], negativeMembers: [] })
    expect(nthEmitted(wrapper, 'update:negative-assignees', 3)).toEqual([[]])
    expect(nthEmitted(wrapper, 'change', 3)).toEqual([expect.objectContaining({ negativeAssignees: [] })])
  })

  it('sends filter action to store on negative folder selection change', async () => {
    const wrapper = shallowMount(GenericFilter, { localVue, mocks, propsData, store })

    await emitRootStub(wrapper, 'change', { positiveFolders: [], negativeFolders: [folders[0]] })
    expect(nthEmitted(wrapper, 'update:negative-paths', 0)).toEqual([['/']])
    expect(nthEmitted(wrapper, 'change', 0)).toEqual([expect.objectContaining({ negativeFolders: ['/'] })])

    await emitRootStub(wrapper, 'change', { positiveFolders: [], negativeFolders: [folders[1]] })
    expect(nthEmitted(wrapper, 'update:negative-paths', 1)).toEqual([['/root']])
    expect(nthEmitted(wrapper, 'change', 1)).toEqual([expect.objectContaining({ negativeFolders: ['/root'] })])

    await emitRootStub(wrapper, 'change', { positiveFolders: [], negativeFolders: folders })
    expect(nthEmitted(wrapper, 'update:negative-paths', 2)).toEqual([['/', '/root']])
    expect(nthEmitted(wrapper, 'change', 2)).toEqual([expect.objectContaining({ negativeFolders: ['/', '/root'] })])

    await emitRootStub(wrapper, 'change', { positiveFolders: [], negativeFolders: [] })
    expect(nthEmitted(wrapper, 'update:negative-paths', 3)).toEqual([[]])
    expect(nthEmitted(wrapper, 'change', 3)).toEqual([expect.objectContaining({ negativeFolders: [] })])
  })

  it('sends filter action to store on negative filename selection change', async () => {
    const wrapper = shallowMount(GenericFilter, { localVue, mocks, propsData, store })

    await emitRootStub(wrapper, 'change', { positiveFilenames: [], negativeFilenames: [filenames[0]] })
    expect(nthEmitted(wrapper, 'update:negative-filenames', 0)).toEqual([['1.jpg']])
    expect(nthEmitted(wrapper, 'change', 0)).toEqual([expect.objectContaining({ negativeFilenames: ['1.jpg'] })])

    await emitRootStub(wrapper, 'change', { positiveFilenames: [], negativeFilenames: [filenames[1]] })
    expect(nthEmitted(wrapper, 'update:negative-filenames', 1)).toEqual([['2.jpg']])
    expect(nthEmitted(wrapper, 'change', 1)).toEqual([expect.objectContaining({ negativeFilenames: ['2.jpg'] })])

    await emitRootStub(wrapper, 'change', { positiveFilenames: [], negativeFilenames: filenames })
    expect(nthEmitted(wrapper, 'update:negative-filenames', 2)).toEqual([['1.jpg', '2.jpg']])
    expect(nthEmitted(wrapper, 'change', 2)).toEqual([expect.objectContaining({ negativeFilenames: ['1.jpg', '2.jpg'] })])

    await emitRootStub(wrapper, 'change', { positiveFilenames: [], negativeFilenames: [] })
    expect(nthEmitted(wrapper, 'update:negative-filenames', 3)).toEqual([[]])
    expect(nthEmitted(wrapper, 'change', 3)).toEqual([expect.objectContaining({ negativeFilenames: [] })])
  })
})

describe('when search text changes', () => {
  it('dispatches action to search filenames', async () => {
    const wrapper = shallowMount(GenericFilter, { localVue, mocks, propsData, store })
    await emitRootStub(wrapper, 'search', 'keyword')
    expect(store.dispatch).toBeCalledWith(
      'workview/searchFilenamesThrottled',
      { search: 'keyword' }
    )
  })
})
