<template>
  <div class="open-dataset-overview__content">
    <div
      class="open-dataset-overview__description"
      v-html="dataset.instructions"
    />
    <overview-content
      class="open-dataset-overview__content__details"
      :dataset="dataset"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import OverviewContent from '@/components/Dataset/DatasetDetail/Overview/OverviewContent.vue'
import { DatasetPayload } from '@/store/types'

@Component({
  name: 'open-dataset-overview-content',
  components: { OverviewContent }
})
export default class OpenDatasetOverviewContent extends Vue {
  @State(state => state.workview.dataset)
  dataset!: DatasetPayload | null
}
</script>

<style lang="scss" scoped>
.open-dataset-overview__content {
  width: 100%;
  height: 100%;
  padding: 20px 47px 0;
  overflow-y: auto;
}

.open-dataset-overview__description {
  width: 100%;
  padding: 25px;
  border-radius: 5px;
  background: $colorWhite;
}

.open-dataset-overview__content__details {
  width: 100%;
  margin-top: 25px;
}
</style>
