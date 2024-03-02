import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import {
  buildDatasetFolderPayload,
  buildDatasetItemFilenamePayload,
  buildDatasetPayload,
  buildMembershipPayload
} from 'test/unit/factories'
import { Dropdown } from 'test/unit/stubs'

import { GenericFilter } from '@/components/DatasetFiltering/GenericFilter/V1'
import {
  filenameToOption,
  folderToOption,
  membershipToOption
} from '@/components/DatasetFiltering/GenericFilter/utils'
import {
  DatasetFolderPayload,
  DatasetItemFilenamePayload,
  DatasetPayload,
  MembershipPayload
} from '@/store/types'

const stubs: Stubs = { Dropdown }
const localVue = createLocalVue()
let propsData: {
  keyword: string
  dataset: DatasetPayload
  members: MembershipPayload[]
  selectedPositiveMembers: MembershipPayload[]
  selectedNegativeMembers: MembershipPayload[]
  folders: DatasetFolderPayload[]
  selectedPositiveFolders: DatasetFolderPayload[]
  selectedNegativeFolders: DatasetFolderPayload[]
  filenames: DatasetItemFilenamePayload[]
  selectedPositiveFilenames: DatasetItemFilenamePayload[]
  selectedNegativeFilenames: DatasetItemFilenamePayload[]
  loading?: boolean
}

beforeEach(() => {
  const dataset = buildDatasetPayload({ id: 1, name: 'Test Dataset' })
  const members = [
    buildMembershipPayload({ id: 1, first_name: 'Test', last_name: 'Annotator1' }),
    buildMembershipPayload({ id: 2, first_name: 'Test', last_name: 'Annotator2' })
  ]
  const folders = [
    buildDatasetFolderPayload({ path: '/' }),
    buildDatasetFolderPayload({ path: '/root' })
  ]
  const filenames = [
    buildDatasetItemFilenamePayload({ filename: '1.jpg' }),
    buildDatasetItemFilenamePayload({ filename: '2.jpg' })
  ]
  propsData = {
    keyword: '',
    dataset,
    members,
    selectedPositiveMembers: members.slice(0, 1),
    selectedNegativeMembers: members.slice(1),
    folders,
    selectedPositiveFolders: folders.slice(0, 1),
    selectedNegativeFolders: folders.slice(1),
    filenames,
    selectedPositiveFilenames: filenames.slice(0, 1),
    selectedNegativeFilenames: filenames.slice(1)
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(GenericFilter, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when loading', () => {
  propsData.loading = true
  const wrapper = shallowMount(GenericFilter, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('renders proper selected options', () => {
  const wrapper = shallowMount(GenericFilter, { localVue, propsData, stubs })
  expect(wrapper.findAll('generic-filter-option-stub[status=positive]')).toHaveLength(3)
  expect(wrapper.findAll('generic-filter-option-stub[status=negative]')).toHaveLength(3)
  expect(wrapper.findAll('generic-filter-selected-option-stub')).toHaveLength(6)
})

it('assigns "includeHeader = true" to first option of each group', () => {
  const wrapper = shallowMount(GenericFilter, { localVue, propsData, stubs })

  expect(wrapper.findAll('generic-filter-option-stub').at(0).props('option')).toEqual({
    id: 'annotator-1',
    label: 'Test Annotator1',
    type: 'assignees',
    includeHeader: true,
    data: propsData.members[0]
  })
  expect(wrapper.findAll('generic-filter-option-stub').at(2).props('option')).toEqual({
    id: 'folder-/',
    label: 'Test Dataset',
    type: 'paths',
    includeHeader: true,
    data: propsData.folders[0]
  })
  expect(wrapper.findAll('generic-filter-option-stub').at(4).props('option')).toEqual({
    id: 'filename-1.jpg',
    label: '1.jpg',
    type: 'filenames',
    includeHeader: true,
    data: propsData.filenames[0]
  })
})

it('selecting positive assignee option emits change', async () => {
  const wrapper = shallowMount(GenericFilter, { localVue, propsData, stubs })

  await wrapper.findAll('generic-filter-option-stub').at(1).vm.$emit('toggle', {
    option: membershipToOption(propsData.members[1]),
    status: 'positive'
  })
  expect(wrapper.emitted().change).toEqual([[{
    positiveMembers: propsData.members,
    negativeMembers: []
  }]])
})

it('selecting negative assignee option emits change', async () => {
  const wrapper = shallowMount(GenericFilter, { localVue, propsData, stubs })

  await wrapper.findAll('generic-filter-option-stub').at(0).vm.$emit('toggle', {
    option: membershipToOption(propsData.members[0]),
    status: 'negative'
  })
  expect(wrapper.emitted().change).toEqual([[{
    positiveMembers: [],
    negativeMembers: propsData.members.reverse()
  }]])
})

it('selecting positive folder option emits change', async () => {
  const wrapper = shallowMount(GenericFilter, { localVue, propsData, stubs })

  await wrapper.findAll('generic-filter-option-stub').at(3).vm.$emit(
    'toggle',
    {
      option: folderToOption(propsData.folders[1], propsData.dataset),
      status: 'positive'
    }
  )
  expect(wrapper.emitted().change).toEqual([[{
    positiveFolders: propsData.folders,
    negativeFolders: []
  }]])
})

it('selecting negative folder option emits change', async () => {
  const wrapper = shallowMount(GenericFilter, { localVue, propsData, stubs })

  await wrapper.findAll('generic-filter-option-stub').at(2).vm.$emit(
    'toggle',
    {
      option: folderToOption(propsData.folders[0], propsData.dataset),
      status: 'negative'
    }
  )
  expect(wrapper.emitted().change).toEqual([[{
    positiveFolders: [],
    negativeFolders: propsData.folders.reverse()
  }]])
})

it('selecting positive filename option emits change', async () => {
  const wrapper = shallowMount(GenericFilter, { localVue, propsData, stubs })

  await wrapper.findAll('generic-filter-option-stub').at(5).vm.$emit(
    'toggle',
    {
      option: filenameToOption(propsData.filenames[1]),
      status: 'positive'
    }
  )
  expect(wrapper.emitted().change).toEqual([[{
    positiveFilenames: propsData.filenames,
    negativeFilenames: []
  }]])
})

it('selecting negative filename option emits change', async () => {
  const wrapper = shallowMount(GenericFilter, { localVue, propsData, stubs })

  await wrapper.findAll('generic-filter-option-stub').at(4).vm.$emit(
    'toggle',
    {
      option: filenameToOption(propsData.filenames[0]),
      status: 'negative'
    }
  )
  expect(wrapper.emitted().change).toEqual([[{
    positiveFilenames: [],
    negativeFilenames: propsData.filenames.reverse()
  }]])
})

it('removing selected option emits change', async () => {
  const wrapper = shallowMount(GenericFilter, { localVue, propsData, stubs })

  await wrapper.findAll('generic-filter-selected-option-stub').at(0).vm.$emit(
    'deselect',
    membershipToOption(propsData.members[0])
  )
  expect(wrapper.emitted().change).toEqual([[{
    positiveMembers: [],
    negativeMembers: [propsData.members[1]]
  }]])
})

it('emits search when keyword changes', async () => {
  const wrapper = shallowMount(GenericFilter, { localVue, propsData, stubs })

  const input = wrapper.find('input.vs__search')
  const inputElement = input.element as HTMLInputElement
  inputElement.value = 'keyword'
  await input.trigger('input')

  expect(wrapper.emitted().search).toEqual([['keyword']])
  expect(wrapper.emitted()['update:keyword']).toEqual([['keyword']])
})
