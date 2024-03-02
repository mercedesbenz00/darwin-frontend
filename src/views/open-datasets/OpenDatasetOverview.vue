<template>
  <open-dataset-detail-layout :dataset="dataset">
    <template #header-actions>
      <div class="open-dataset-overview__empty-actions" />
    </template>
    <template #content>
      <open-dataset-overview-content :dataset="dataset" />
    </template>
  </open-dataset-detail-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import OpenDatasetDetailLayout from '@/components/Dataset/OpenDatasetDetail/OpenDatasetDetailLayout.vue'
import OpenDatasetOverviewContent from '@/components/Dataset/OpenDatasetDetail/OpenDatasetOverviewContent.vue'
import BreadCrumbInitializer, { BreadCrumb } from '@/mixins/BreadCrumbInitializer'
import { DatasetPayload } from '@/store/types'

@Component({
  name: 'open-dataset-overview',
  components: { OpenDatasetDetailLayout, OpenDatasetOverviewContent },
  mixins: [BreadCrumbInitializer]
})
export default class OpenDatasetOverview extends Vue {
  @State(state => state.workview.dataset)
  dataset!: DatasetPayload | null

  get breadCrumbs (): BreadCrumb[] {
    const { dataset } = this
    if (!dataset) { return [] }
    return [
      { name: 'Datasets Overview' },
      { to: `/${dataset.team_slug}/${dataset.slug}`, name: dataset.name }
    ]
  }
}
</script>

<style lang="scss" scoped>
.open-dataset-overview {
  width: 100%;
  @include col;
}

.open-dataset-overview__empty-actions {
  width: 100%;
}
</style>
