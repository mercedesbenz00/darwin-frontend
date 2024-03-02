import { Meta, Story } from '@storybook/vue'
import Vue from 'vue'

import { buildV2DatasetFolderPayload } from 'test/unit/factories'

import store from '@/store'
import { setupMultiple } from '@/storybook/fixtures/__mocks__/workflow/setupMultiple'

import ManagementContextMenu from './ManagementContextMenu.vue'

export default {
  title: 'DatasetManagement/ManagementContextMenu'
} as Meta<typeof ManagementContextMenu>

export const Default: Story = (args, { argTypes }) => ({
  components: { ManagementContextMenu },
  props: Object.keys(argTypes),
  store,
  created (): void {
    setupMultiple({ x: 0, y: 0 })

    const store = ((this as unknown) as Vue).$store
    store.commit('dataset/SET_V2_DATASET_FOLDERS', {
      datasetId: 1,
      folders: [
        buildV2DatasetFolderPayload({
          path: '/bin',
          dataset_id: 1,
          filtered_item_count: 1
        }),
        buildV2DatasetFolderPayload({
          path: '/bin/trash-files',
          dataset_id: 1,
          filtered_item_count: 1
        }),
        buildV2DatasetFolderPayload({
          path: '/root',
          dataset_id: 1,
          filtered_item_count: 1
        }),
        buildV2DatasetFolderPayload({
          path: '/root/cats',
          dataset_id: 1,
          filtered_item_count: 1
        }),
        buildV2DatasetFolderPayload({
          path: '/root/dogs',
          dataset_id: 1,
          filtered_item_count: 1
        }),
        buildV2DatasetFolderPayload({
          path: '/root/dogs/paws',
          dataset_id: 1,
          filtered_item_count: 1
        }),
        buildV2DatasetFolderPayload({
          path: '/root/birds',
          dataset_id: 1,
          filtered_item_count: 1
        })
      ]
    })
  },
  template: `
    <div style='width:100%;height:100vh;display:flex;align-items:center;justify-content:center'>
      <management-context-menu v-bind='$props' />
    </div>
  `
})

Default.storyName = 'ManagementContextMenu'
Default.args = {}
