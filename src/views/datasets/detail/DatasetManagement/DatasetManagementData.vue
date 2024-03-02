<template>
  <v2-dataset-detail-layout
    v-if="dataset.version === 2"
    :dataset="dataset"
    :parent-type="parentType"
    :parent-location="parentLocation"
  >
    <template #content>
      <v2-billing-box
        v-if="showBillingBox"
        class="dataset-management-data__overlay--v2"
      />
      <dataset-management-header :dataset="dataset" />
      <DropArea
        :accepted-file-types="acceptedFileTypes"
        :open-file-picker-on-click="false"
        @files-added="setAndOpenFileDialog"
        class="dataset-management-data__gallery"
      >
        <V2DatasetItemGallery
          :dataset="dataset"
          :dataset-items.sync="datasetItems"
        />
      </DropArea>
      <FileUploadDialogWrapper />
      <v2-management-context-menu
        :dataset="dataset"
        :dataset-items.sync="datasetItems"
        class="dataset-management-data__menu"
      />
    </template>
    <template #sidebar>
      <v2-workflow-sidebar
        :dataset="dataset"
        :dataset-items="datasetItems"
      />
    </template>
  </v2-dataset-detail-layout>
  <dataset-detail-layout
    v-else
    :dataset="dataset"
    :parent-type="parentType"
    :parent-location="parentLocation"
  >
    <template #content>
      <dataset-items-loader :dataset="dataset" />
      <dataset-channel-subscriber :dataset="dataset" />
      <billing-box
        v-if="showBillingBox"
        class="dataset-management-data__overlay"
      />
      <dataset-item-gallery
        class="dataset-management-data__gallery dataset-management-data__gallery--v1"
        :dataset="dataset"
      />
      <management-context-menu
        :dataset="dataset"
      />
    </template>
    <template #sidebar>
      <workflow-sidebar :dataset="dataset" />
    </template>
  </dataset-detail-layout>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  watch,
  onMounted,
  PropType,
  Ref
} from 'vue'

import DropArea from '@/components/Common/DropArea/V2/DropArea.vue'
import { acceptedFileTypes } from '@/components/Common/DropArea/fileTypes'
import BillingBox from '@/components/Dataset/BillingBox.vue'
import DatasetDetailLayout from '@/components/Dataset/DatasetDetail/DatasetDetailLayout.vue'
import DatasetManagementHeader from '@/components/Dataset/DatasetDetail/DatasetManagementHeader.vue'
import V2DatasetDetailLayout from '@/components/Dataset/DatasetDetail/V2DatasetDetailLayout.vue'
import V2BillingBox from '@/components/Dataset/V2BillingBox.vue'
import { useDatasetUploadDialog } from '@/components/Dataset/useDatasetUploadDialog'
import ManagementContextMenu from '@/components/DatasetManagement/ContextMenu/ManagementContextMenu/V1/ManagementContextMenu.vue'
import V2ManagementContextMenu from '@/components/DatasetManagement/ContextMenu/ManagementContextMenu/V2/ManagementContextMenu.vue'
import FileUploadDialogWrapper from '@/components/DatasetManagement/Dialog/FileUploadDialog/FileUploadDialogWrapper.vue'
import DatasetItemGallery from '@/components/DatasetManagement/Gallery/DatasetItemGallery.vue'
import V2DatasetItemGallery from '@/components/DatasetManagement/Gallery/V2DatasetItemGallery.vue'
import DatasetChannelSubscriber from '@/components/DatasetManagement/Renderless/DatasetChannelSubscriber'
import DatasetItemsLoader from '@/components/DatasetManagement/Renderless/DatasetItemsLoader'
import V2WorkflowSidebar from '@/components/DatasetManagement/Sidebar/V2WorkflowSidebar.vue'
import WorkflowSidebar from '@/components/DatasetManagement/Sidebar/WorkflowSidebar.vue'
import { BreadCrumb, useBreadcrumbs, useStore } from '@/composables'
import { useItemsReloader } from '@/composables/useItemsReloader'
import { useRoute } from '@/composables/useRouter'
import { DatasetPayload, TeamPayload, V2DatasetItemPayload } from '@/store/types'
import { isDatasetInCurrentTeam } from '@/utils/dataset'

export default defineComponent({
  name: 'DatasetManagement',
  components: {
    BillingBox,
    DatasetChannelSubscriber,
    DatasetDetailLayout,
    DatasetItemsLoader,
    DatasetItemGallery,
    DatasetManagementHeader,
    DropArea,
    FileUploadDialogWrapper,
    ManagementContextMenu,
    V2BillingBox,
    V2DatasetDetailLayout,
    V2DatasetItemGallery,
    V2ManagementContextMenu,
    V2WorkflowSidebar,
    WorkflowSidebar
  },
  props: {
    // provided by parent route
    dataset: {
      required: true,
      type: Object as PropType<DatasetPayload>
    }
  },
  setup (props) {
    const { dispatch, state } = useStore()
    const route = useRoute()
    const datasetItems: Ref<V2DatasetItemPayload[]> = ref([])
    const { channelDatasetItems } = useItemsReloader(datasetItems)

    watch(channelDatasetItems, () => {
      datasetItems.value = channelDatasetItems.value
    })

    const folderEnabled: Ref<boolean> = computed(() => {
      return state.dataset.folderEnabled
    })

    const currentTeam: Ref<TeamPayload | null> = computed(() => {
      return state.team.currentTeam
    })

    const datasetId: Ref<number> = computed(() => {
      return props.dataset.id
    })

    const path: Ref<string> = computed(() => {
      const { path } = route.params
      if (!path) { return '/' }
      return `/${path}`
    })

    const parentType: Ref<string | null> = computed(() => {
      if (folderEnabled.value && path.value !== '/') { return 'folder' }
      if (props.dataset.version === 2) {
        return 'dataset'
      }
      return null
    })

    const parentLocation = computed(() => {
      const parentPath = path.value.split('/').slice(0, -1).join('/')

      if (!parentType.value) { return null }
      if (parentType.value === 'dataset') {
        return { path: '/datasets', query: route.query }
      } else {
        const parentPathUrl = parentPath === '' || parentPath === '/'
          ? `/datasets/${datasetId.value}/dataset-management`
          : `/datasets/${datasetId.value}/dataset-management/tree${parentPath}`
        return { path: parentPathUrl, query: route.query }
      }
    })

    const breadCrumbs: Ref<BreadCrumb[]> = computed(() => {
      const { hash, query } = route
      const pathSegments = (path.value + (hash || ''))
        .split('/')
        .slice(1)
        .filter(segment => !!segment)
      const folderPathPrefix = `/datasets/${datasetId.value}/dataset-management/tree/`
      const folderBreadCrumbs = pathSegments.map((segment, index) => {
        const breadCrumbSegment = pathSegments.slice(0, index + 1).join('/')
        if (path.value === `/${breadCrumbSegment}`) {
          return { name: segment }
        }
        return {
          to: folderPathPrefix + breadCrumbSegment,
          name: segment
        }
      })

      if (props.dataset.version === 2) {
        return [
          { to: { path: '/datasets' }, name: 'Datasets' },
          {
            ...(
              path.value === '/'
                ? {}
                : { to: { path: `/datasets/${datasetId.value}/dataset-management`, query } }),
            name: props.dataset.name
          },
          ...folderBreadCrumbs
        ]
      } else {
        return [
          { to: { path: '/datasets' }, name: 'Datasets' },
          {
            to: { path: `/datasets/${datasetId.value}/overview`, query },
            name: props.dataset.name
          },
          { to: { path: `/datasets/${datasetId.value}/dataset-management`, query }, name: 'Data' },
          ...folderBreadCrumbs
        ]
      }
    })

    useBreadcrumbs(breadCrumbs)

    /**
     * Billing box is shown the user is viewing datasets which are
     * part of the same team as they are.
     *
     * If there's no team, it means the user is viewing a publically
     * available dataset, so there's nothing to show.
     */
    const showBillingBox: Ref<boolean> = computed(() => {
      return isDatasetInCurrentTeam(props.dataset, currentTeam.value)
    })

    const fetchDatasetExports = async (): Promise<void> => {
      const { slug: datasetSlug, team_slug: teamSlug, version } = props.dataset
      if (version === 2) {
        await dispatch('dataset/getV2Exports', { datasetSlug, teamSlug })
      } else {
        await dispatch('dataset/getDatasetExports', { datasetId: datasetId.value })
      }
    }

    onMounted(() => {
      fetchDatasetExports()
    })

    const {
      setAndOpenFileDialog
    } = useDatasetUploadDialog(ref(props.dataset), false, 'dataset_management')

    return {
      acceptedFileTypes,
      breadCrumbs,
      datasetItems,
      parentType,
      parentLocation,
      setAndOpenFileDialog,
      showBillingBox
    }
  }
})
</script>

<style lang="scss" scoped>
@import "@/uiKit/assets/index.scss";

.dataset-management-data__overlay {
  width: calc(100% - 90px);
}
.dataset-management-data__overlay--v2 {
  width: calc(100% - 40px);
  margin-left: 20px;
}

// &.droparea--dragging is not being detected here, since
// it's internal to the droparea component.
// eslint-disable-next-line vue-scoped-css/no-unused-selector
.dataset-management-data__gallery {
  // overrides border radius given by droparea
  border-radius: 0;

  background: $colorSurfaceElevate;
  flex: 1;
  overflow-y: auto;
  justify-content: start;

  // hides the scrollbar when dragging
  // something on top of the dropzone
  &.droparea--dragging {
    overflow-y: hidden;
  }

  // keeps old background color for the gallery in v1 dataset layout.
  // can be safely removed once we drop v1;
  &--v1 {
    background-color: transparent;
  }
}

.dataset-management-data__menu {
  position: absolute;
  bottom: 24px;
  right: 0;
  left: 0;
  margin: auto;
}
</style>
