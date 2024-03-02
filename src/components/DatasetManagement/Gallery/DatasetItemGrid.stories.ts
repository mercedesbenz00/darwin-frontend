import { Meta, Story } from '@storybook/vue'
import { Dispatch } from 'vuex'

import { Grid, GridProps, SizeStep } from '@/components/Common/Grid'
import DatasetFolderCard from '@/components/DatasetManagement/Card/V2/DatasetFolderCard.vue'
import DatasetItemCard from '@/components/DatasetManagement/Card/V2/DatasetItemCard.vue'
import router from '@/router'
import store, { resetStore } from '@/store'
import { DatasetItemPayload, DatasetFolderPayload, DatasetItemStatus } from '@/store/types'
import { blurry } from '@/storybook/fixtures/annotationClasses'
import { foobazFolder } from '@/storybook/fixtures/datasetFolders'
import { datasetItemBuilder } from '@/storybook/fixtures/datasetItems'

require('vue-virtual-scroller/dist/vue-virtual-scroller.css')

const tag1 = {
  ...blurry,
  id: 1,
  name: 'Sitting',
  metadata: { _color: 'rgba(201,44,122,1)' }
}

const tag2 = {
  ...blurry,
  id: 2,
  name: 'Running',
  metadata: { _color: 'rgba(64,181,181,1)' }
}

export default {
  title: 'DatasetManagement/DatasetItemGrid'
} as Meta<typeof Grid>

const Template: Story<GridProps> = (args) => ({
  components: { DatasetItemCard, DatasetFolderCard, Grid },
  store,
  router,
  beforeMount () {
    store.commit('aclass/SET_CLASSES', [tag1, tag2])
  },
  setup () {
    store.dispatch = ((() => Promise.resolve({})) as unknown as Dispatch)
    // need to set initial info on creation, or we get console errors
    resetStore()
    return { args }
  },
  methods: {
    onInfiniteScroll (): void {
      const appendItems = []
      for (let i = 1; i <= 10; i++) {
        appendItems.push({
          id: `${args.items.length + i}`,
          data: args.items.length + i
        })
      }
      args.items = args.items.concat(appendItems)
    }
  },
  template: `
    <div style="height:300px;">
      <grid v-bind="args" @infinite-scroll="onInfiniteScroll">
        <template #card="{ item: { data, type } }">
          <template v-if="type === 'item'">
            <dataset-item-card
              :data="data"
            />
          </template>
          <template v-if="type === 'folder'">
            <dataset-folder-card
              :data="data"
              readonly
            />
          </template>
        </template>

        <template #skeleton="{ item }">
          <div style="width:100%;height:200px;background:hsla(220, 17%, 91%, 1);">
          </div>
        </template>
      </grid>
    </div>
  `
})

export const DefaultStory = Template.bind({})
const thumbnailUrl = '/static/test.png'

const generateItems = (n: number): any[] => {
  const items = []
  for (let i = 1; i <= n; i++) {
    const datasetItem: DatasetItemPayload = datasetItemBuilder({
      inserted_at: '2022-01-01T01:01:01',
      updated_at: '2022-02-02T02:02:02',
      status: DatasetItemStatus.archived,
      labels: [1, 2]
    })
    if (datasetItem.dataset_image) {
      datasetItem.dataset_image.image.thumbnail_url = thumbnailUrl
    }
    items.push({
      id: `item_${items.length + i}`,
      data: datasetItem,
      type: 'item'
    })
  }
  return items
}

const generateFolders = (n: number): any[] => {
  const items = []
  for (let i = 1; i <= n; i++) {
    const datasetFolder: DatasetFolderPayload = foobazFolder
    datasetFolder.url = thumbnailUrl
    items.push({
      id: `folder_${items.length + i}`,
      data: datasetFolder,
      type: 'folder'
    })
  }
  return items
}

DefaultStory.storyName = 'Without folder '
DefaultStory.args = {
  sizeStep: SizeStep.md,
  items: generateItems(100)
}

export const FolderStory = Template.bind({})

FolderStory.storyName = 'With folder '
FolderStory.args = {
  sizeStep: SizeStep.md,
  items: [...generateFolders(3), ...generateItems(100)]
}
