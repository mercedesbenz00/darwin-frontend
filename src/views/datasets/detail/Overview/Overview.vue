<template>
  <v2-dataset-detail-layout
    v-if="dataset.version === 2"
    :dataset="dataset"
    parent-type="dataset"
    :parent-location="parentLocation"
  >
    <template #content>
      <div class="overview">
        <overview-content
          class="overview__content"
          :dataset="dataset"
        />
      </div>
    </template>
    <template #sidebar>
      <div class="overview__sidebar">
        <custom-button
          class="reports-button"
          size="small"
          flair="rounded"
          variant="default"
          @click="openReportDialog"
        >
          Download CSV Report
        </custom-button>
      </div>
    </template>
  </v2-dataset-detail-layout>
  <dataset-detail-layout
    v-else
    :dataset="dataset"
  >
    <template #content>
      <div class="overview">
        <overview-content
          class="overview__content"
          :dataset="dataset"
        />
      </div>
    </template>
    <template #sidebar>
      <div class="overview__sidebar">
        <export-button button-type="primary-button" />
        <download-full-item-report-button />
      </div>
    </template>
  </dataset-detail-layout>
</template>

<script lang="ts">
import { PropType, computed, defineComponent } from 'vue'
import { Location } from 'vue-router'

import { CustomButton } from '@/components/Common/Button/V2'
import DatasetDetailLayout from '@/components/Dataset/DatasetDetail/DatasetDetailLayout.vue'
import OverviewContent from '@/components/Dataset/DatasetDetail/Overview/OverviewContent.vue'
import V2DatasetDetailLayout from '@/components/Dataset/DatasetDetail/V2DatasetDetailLayout.vue'
import ExportButton from '@/components/DatasetManagement/ExportButton/ExportButton.vue'
import DownloadFullItemReportButton from '@/components/DatasetManagement/Sidebar/DownloadFullItemReportButton.vue'
import { useBreadcrumbs, useModal, useRoute, useStore } from '@/composables'
import { BreadCrumb } from '@/mixins/BreadCrumbInitializer'
import { DatasetPayload } from '@/store/types'

export default defineComponent({
  name: 'Overview',
  components: {
    CustomButton,
    DatasetDetailLayout,
    DownloadFullItemReportButton,
    ExportButton,
    OverviewContent,
    V2DatasetDetailLayout
  },
  props: {
    dataset: {
      required: true,
      type: Object as PropType<DatasetPayload>,
    }
  },
  setup (props) {
    const modal = useModal()
    const route = useRoute()
    const store = useStore()

    const breadCrumbs = computed((): BreadCrumb[] => {
      if (props.dataset.version === 2) {
        return [
          { to: '/datasets', name: 'Datasets' },
          {
            to: `/datasets/${props.dataset.id}/dataset-management`,
            name: props.dataset.name
          },
          { name: 'Quality' }
        ]
      } else {
        return [
          { to: '/datasets', name: 'Datasets' },
          { to: `/datasets/${props.dataset.id}/overview`, name: props.dataset.name }
        ]
      }
    })

    const parentLocation = computed((): Location => {
      return { path: '/datasets', query: route.query }
    })

    const openReportDialog = (): void => {
      modal.show('download-report')
      store.dispatch('ui/putBackSidebar')
    }

    useBreadcrumbs(breadCrumbs)

    return { openReportDialog, parentLocation }
  }
})
</script>

<style lang="scss" scoped>
.overview {
  @include row;
  position: relative;
  width: 100%;
  height: 100%;
}

.overview__content {
  width: 100%;
  height: 100%;
  padding: 35px 47px;
}

.overview__sidebar {
  @include col--distributed;
  gap: 10px;
}
</style>
