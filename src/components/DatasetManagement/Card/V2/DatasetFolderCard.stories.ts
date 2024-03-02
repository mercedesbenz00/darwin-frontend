import { Meta, Story } from '@storybook/vue'
import RouteMock from 'storybook-vue-router'

import colors from '@/assets/styles/darwin/variables/colors.module.scss'
import store from '@/store'
import { V2DatasetFolderPayload } from '@/store/types'
import { foobazFolder } from '@/storybook/fixtures/datasetFoldersV2'

import DatasetFolderCard from './DatasetFolderCard.vue'
import { DatasetFolderCardProps } from './types'

export default {
  title: 'DatasetManagement/DatasetFolderCard',
  argTypes: {
    data: {
      control: 'object',
      description: 'Folder card data'
    },
    readonly: {
      control: 'boolean',
      description: 'Disables or enables readonly',
      table: {
        type: { summary: 'Boolean' },
        defaultValue: { summary: 'false' }
      }
    }
  },
  parameters: {
    backgrounds: {
      default: 'AliceShade',
      values: [
        {
          name: 'White',
          value: colors.colorWhite
        },
        {
          name: 'AliceBlue',
          value: colors.colorAliceBlue
        },
        {
          name: 'AliceShade',
          value: colors.colorAliceShade
        },
        {
          name: 'AliceShadow',
          value: colors.colorAliceShadow
        }
      ]
    }
  },
  decorators: [RouteMock()]
} as Meta<typeof DatasetFolderCard>

const thumbnailUrl = '/static/test.png'

// DEFAULT
const datasetFolder: V2DatasetFolderPayload = foobazFolder

datasetFolder.thumbnail_url = thumbnailUrl

export const Default: Story<DatasetFolderCardProps> = (args, { argTypes }) => ({
  components: { DatasetFolderCard },
  props: Object.keys(argTypes),
  store,
  data: () => ({
    datasetFolder
  }),
  template: `
    <div style='width:200px;'>
    <dataset-folder-card
      :data='datasetFolder'
      readonly
    />
    </div>
  `
})

Default.args = {
  data: datasetFolder,
  urlPrefix: null
}
