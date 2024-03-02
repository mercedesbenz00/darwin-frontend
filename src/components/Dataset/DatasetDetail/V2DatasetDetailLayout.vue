<template>
  <div class="dataset-details">
    <div class="dataset-details__main">
      <div class="dataset-details__header">
        <div class="dataset-details__header__left">
          <icon-button
            v-if="parentType"
            v-tooltip="tooltipLocation"
            class="dataset-details__back"
            size="small"
            flair="rounded"
            variant="default"
            tag="router-link"
            :to="parentLocation"
          >
            <icon-mono-arrow-left />
          </icon-button>
          <bread-crumbs class="dataset-details__crumbs" />
        </div>
        <div class="dataset-details__header__right">
          <v2-download-dataset-report-button />
          <v2-export-button ref="exportButton" />
          <v2-data-tab-upload />
        </div>
      </div>
      <div class="dataset-details__content">
        <div class="dataset-details__content__tabs">
          <V2DatasetDetailTabs :dataset="dataset" />
        </div>
        <div class="dataset-details__content__body">
          <div class="dataset-details__content__body__main">
            <div
              v-if="$slots['header-actions']"
              class="dataset-details__content__actions"
            >
              <slot name="header-actions" />
            </div>
            <slot name="content" />
          </div>
          <div
            v-if="$slots['sidebar']"
            class="dataset-details__sidebar-container"
          >
            <slot name="sidebar" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  watch,
  PropType,
  Ref
} from 'vue'
import { Location } from 'vue-router'

import { IconMonoArrowLeft } from '@/assets/icons/V2/Mono'
import BreadCrumbs from '@/components/Common/BreadCrumbs/V2/BreadCrumbs.vue'
import IconButton from '@/components/Common/Button/V2/IconButton/IconButton.vue'
import V2DatasetDetailTabs from '@/components/Dataset/DatasetDetail/V2DatasetDetailTabs.vue'
import V2DataTabUpload from '@/components/DatasetManagement/V2DataTabUpload.vue'
import V2DownloadDatasetReportButton from '@/components/DatasetManagement/V2DownloadDatasetReport.vue'
import V2ExportButton from '@/components/DatasetManagement/V2ExportButton.vue'
import { useRoute } from '@/composables/useRouter'
import { DatasetPayload } from '@/store/types'
import { TooltipOptions } from '@/types'

export default defineComponent({
  name: 'V2DatasetDetailLayout',
  components: {
    BreadCrumbs,
    IconButton,
    IconMonoArrowLeft,
    V2DatasetDetailTabs,
    V2DataTabUpload,
    V2DownloadDatasetReportButton,
    V2ExportButton
  },
  props: {
    dataset: {
      required: true,
      type: Object as PropType<DatasetPayload>
    },
    parentType: {
      required: false,
      type: [String, null] as PropType<'dataset' | 'folder' | null>,
      default: null
    },
    parentLocation: {
      required: false,
      type: [String, Object, null] as PropType<String |Location | null>,
      default: null
    },
    titleEditable: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  setup (props, { emit }) {
    const exportButton: Ref<InstanceType<typeof V2ExportButton> | null> = ref(null)
    const route = useRoute()

    const exportParams = computed(() => route.query.export)

    watch(exportParams, (value) => {
      if (exportButton.value == null || value === undefined) { return }
      exportButton.value.openExportDialog()
    }, { immediate: true })

    const parentTooltipText: Ref<string> = computed(() => {
      return props.parentType === 'folder'
        ? 'Back to Parent Folder'
        : 'Back to Dataset'
    })

    const tooltipLocation: Ref<TooltipOptions> = computed(() => {
      return { placement: 'bottom', content: parentTooltipText.value, delay: 500 }
    })

    const updateTitle = (title: string): void => {
      if (!props.titleEditable) { return }
      emit('change-title', title)
    }

    return {
      exportButton,
      tooltipLocation,
      updateTitle
    }
  }
})
</script>

<style lang="scss" scoped>
@import "@/uiKit/assets/index.scss";

.dataset-details {
  position: absolute;
  @include fullsize;
  @include row;
  width: 100%;
  height: 100%;
  overflow: hidden;

  background: $colorSurfaceElevate;
}

.dataset-details__main {
  position: relative;
  flex: 1;
  @include col--center;
  margin-left: 4px;
  height: 100%;
  overflow: hidden;
}

.dataset-details__header {
  width: 100%;
  padding: 10px 20px 10px 0;
  background: transparent;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  &__left {
    @include row;
    align-items: center;
  }
  &__right {

    display: flex;
    gap: 4px;
    justify-content: center;
  }

}
.dataset-details__content__actions {
  width: 224px;
  min-width: 224px;
  height: 35px;
  margin-top: 8px;
  margin-left: auto;
  margin-right: 12px;
}

.dataset-details__crumbs {
  margin-left: 8px;
}

.dataset-details__content {
  @include col;
  width: calc(100% - 8px);
  flex: 1;
  overflow: hidden;
  position: relative;
  padding-top: 6px;
  border-radius: 12px;
  border: 1px solid $colorStrokeStrong;
  margin: 0 8px 12px 0;
  box-shadow: 0px 4px 4px rgba(75, 81, 88, 0.08), 0px 16px 32px rgba(75, 81, 88, 0.12);
}

.dataset-details__content__tabs {
  @include row;
  align-items: center;
  margin-left: 8px;
}

.dataset-details__content__body {
  flex: 1;
  @include row;
  overflow-y: hidden;
  background: $colorNeutralsLightWhite;
}
.dataset-details__content__body__main {
  @include col;
  flex: 1;
  width: calc(100% - 260px);
  position: relative;
}

.dataset-details__sidebar-container {
  height: 100%;
  background: transparent;
  box-shadow: inset 1px 0px 0px $colorStrokeStrong;
  overflow: visible;
  padding: 8px;
}
:deep(.dataset-management__sidebar) {
  background: transparent;
}

</style>
