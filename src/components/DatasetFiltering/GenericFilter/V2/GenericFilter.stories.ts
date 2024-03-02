import { Meta } from '@storybook/vue'

import { bazFolder, foobazFolder, fooFolder, rootFolder } from '@/storybook/fixtures/datasetFolders'
import { janeDoe, johnDoe, johnSmith } from '@/storybook/fixtures/memberships'

import GenericFilter from './GenericFilter.vue'

const Sidebar = () => {
  return {
    template: '<div style="width: 200px;"><story/></div>'
  }
}

export default {
  title: 'DatasetFiltering/V2/GenericFilter',
  decorators: [Sidebar],
  argTypes: {
    loading: { control: 'boolean' }
  }
} as Meta<typeof GenericFilter>

export const Default = () => ({
  loading: false,
  components: { GenericFilter },
  data () {
    return {
      members: [johnDoe, johnSmith, janeDoe],
      selectedMembers: [],
      folders: [rootFolder, fooFolder, bazFolder, foobazFolder],
      selectedFolders: [],
      filenames: ['1.jpg', '2.jpg', '3.jpg'],
      selectedFilenames: []
    }
  },
  props: ['loading'],
  methods: {
    onChange (params: any) {
      if ('members' in params) {
        (this as any).selectedMembers = params.members
      }
      if ('filenames' in params) {
        (this as any).selectedFilenames = params.filenames
      }
      if ('folders' in params) {
        (this as any).selectedFolders = params.folders
      }
    }
  },
  template: `
    <generic-filter
      :members="members"
      :selected-members="selectedMembers"
      :folders="folders"
      :selected-folders="selectedFolders"
      :filenames="filenames"
      :selected-filenames="selectedFilenames"
      :loading="loading"
      @change="onChange"
    />
  `
})
