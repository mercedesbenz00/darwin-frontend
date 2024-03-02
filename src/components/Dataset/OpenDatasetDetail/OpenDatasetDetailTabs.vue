<template>
  <tabs :tabs="tabs" />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import Tabs from '@/components/Common/Tabs/Tabs.vue'
import { Tab } from '@/components/Common/Tabs/types'
import { DatasetPayload } from '@/store/types'

@Component({
  name: 'open-dataset-detail-tabs',
  components: { Tabs }
})
export default class OpenDatasetDetailTabs extends Vue {
  @Prop({ required: true })
  dataset!: DatasetPayload

  get tabs (): Tab[] {
    const { dataset } = this
    const mainRoute = `/${dataset.team_slug}/${dataset.slug}`

    return [
      { name: 'Overview', to: `${mainRoute}/overview`, exact: true },
      { name: 'Data', to: mainRoute, exact: true }
    ]
  }
}
</script>
