<template>
  <tabs
    v-if="dataset"
    :tabs="tabs"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import Tabs from '@/components/Common/Tabs/Tabs.vue'
import { Tab } from '@/components/Common/Tabs/types'
import { DatasetPayload } from '@/store/types'

@Component({
  name: 'dataset-detail-tabs',
  components: { Tabs }
})
export default class DatasetDetailTabs extends Vue {
  @Prop({ required: true })
  dataset!: DatasetPayload

  get tabs (): Tab[] {
    const { dataset } = this
    return [
      { name: 'Overview', to: `/datasets/${dataset.id}/overview` },
      { name: 'Data', to: `/datasets/${dataset.id}/dataset-management` },
      { name: 'Classes', to: `/datasets/${dataset.id}/classes` },
      { name: 'Settings', to: `/datasets/${dataset.id}/settings` }
    ]
  }
}
</script>
