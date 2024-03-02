<template>
  <div
    class="dataset-export__list"
    :class="{'dataset-export__single': availableExports.length === 1}"
  >
    <v2-dataset-export-version
      v-for="datasetExport in availableExports"
      :key="datasetExport.version"
      :dataset-export="datasetExport"
      :dataset-slug="dataset.slug"
      :team-slug="dataset.team_slug"
      :is-open-mode="isOpenMode"
    />

    <div
      v-if="availableExports.length === 0"
      class="dataset-empty__tips"
    >
      <slot name="version-list-empty" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import V2DatasetExportVersion from '@/components/DatasetExport/V2DatasetExportVersion.vue'
import { DatasetExportPayload, DatasetPayload } from '@/store/types'

@Component({
  name: 'v2-dataset-export-version-list',
  components: { V2DatasetExportVersion }
})
export default class V2DatasetExportVersionList extends Vue {
  @Prop({ required: true, type: Array })
  availableExports!: DatasetExportPayload[]

  @Prop({ required: true, type: Object })
  dataset!: DatasetPayload

  @Prop({ required: false, type: Boolean, default: false })
  isOpenMode!: boolean
}
</script>

<style lang="scss" scoped>
.dataset-export__list {
  border-radius: 10px;
  border: 1px solid $colorBorder;

  :deep(.dataset-export:not(:last-child)) {
    box-shadow: inset 0px -1px 0px $colorBorder;
  }
  :deep(.dataset-export:first-child) {
    .dataset-export__version__status-line {
      height: 50%!important;
      transform: translateY(100%);
    }
  }
  :deep(.dataset-export:last-child) {
    .dataset-export__version__status-line {
      height: 50%!important;
    }
  }
}

.dataset-export__single {
  :deep(.dataset-export__version__status-line) {
      display: none;
  }
}

.dataset-empty__tips {
  @include col--center;
  width: 100%;
  height: 200px;
  padding: 12px 8px;
  background: $colorFrame;
  border: 1px solid $colorBorder;
  box-sizing: border-box;
  border-radius: 8px;
  span {
    color: $colorContentSecondary;
  @include typography(lg, inter, 500);
  }
}
</style>
