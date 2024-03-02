import { action } from '@storybook/addon-actions'

import { FolderIcon } from '@/assets/icons/V1'
import { treefiedRootFolder } from '@/storybook/fixtures/datasetFolders'
import { sfh } from '@/storybook/fixtures/datasets'

import FolderPopoverComponent from './FolderPopover.vue'

const stories = {
  title: 'Common',
  argTypes: {}
}

export default stories

const buildActions = () => ({
  move: action('move')
})

type Args = Record<keyof typeof stories.argTypes, any>

export const FolderPopover = (args: Args, { argTypes }: any) => ({
  components: { FolderIcon, FolderPopoverComponent },
  data: () => ({
    actions: buildActions(),
    dataset: sfh,
    folders: [treefiedRootFolder]
  }),
  props: Object.keys(argTypes),
  template: `
    <folder-popover-component
      :dataset="dataset"
      :folders="folders"
      v-on="actions"
    >
      <button>
        <folder-icon />
      </button>
    </folder-popover-component>
  `
})

FolderPopover.args = {}
