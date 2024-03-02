<template>
  <div class="copy">
    <p
      class="copy__description"
    >
      In case this image contains duplicates to the previous images,
      you can copy the layers from the previous image.
    </p>
    <circle-spinner
      v-if="busy"
      class="copy__spinner"
      :dark="true"
      :width="40"
      :height="40"
    />
    <secondary-button
      v-else
      :disabled="!enabled"
      @click="copyAnnotations"
    >
      Copy instances
    </secondary-button>
  </div>
</template>

<script lang="ts">
import { isEqual } from 'lodash'
import { computed, defineComponent, ref } from 'vue'

import { CircleSpinner } from '@/components/Common/LoadingIndicators'
import { useDatasetItemsLoader, useSelectedDatasetItemV2, useStore } from '@/composables'
import { copyV2StageAnnotations } from '@/store/modules/workview/actions/copyV2StageAnnotations'
import { DatasetItemStatus, StoreActionPayload, V2DatasetItemPayload } from '@/store/types'

export default defineComponent({
  name: 'CopyStageAnnotations',
  components: { CircleSpinner },
  setup () {
    const { state, dispatch } = useStore()
    const busy = ref(false)
    const selectedDatasetItem = useSelectedDatasetItemV2()

    const datasetItemsIds = computed(() => state.dataset.datasetItemIdsV2)

    const dataset = computed(() => state.workview.dataset)
    const { datasetItems } = useDatasetItemsLoader(dataset)

    const annotatedPredecessor = computed((): V2DatasetItemPayload | null => {
      if (!selectedDatasetItem.value) { return null }

      const index = datasetItemsIds.value.indexOf(selectedDatasetItem.value.id)

      for (let i = index - 1; i >= 0; i--) {
        const itemId = datasetItemsIds.value[i]
        const item = datasetItems.value[itemId]
        if (
          item &&
          item.status !== DatasetItemStatus.new &&
          item.slots.length === selectedDatasetItem.value.slots.length &&
          item.dataset_id === selectedDatasetItem.value.dataset_id &&
          isEqual(item.slot_types, selectedDatasetItem.value.slot_types)
        ) {
          return item
        }
      }

      return null
    })

    const copyAnnotations = async (): Promise<void> => {
      busy.value = true

      const fromItem = annotatedPredecessor.value
      const toItem = selectedDatasetItem.value
      if (!toItem || !fromItem) { return }

      const stage = computed(() => state.workview.v2SelectedStage)

      if (!dataset.value || !stage.value) { return }

      const copyPayload: StoreActionPayload<typeof copyV2StageAnnotations> = {
        teamSlug: dataset.value.team_slug,
        itemId: fromItem.id,
        targetItemId: toItem.id,
        workPhase: stage.value.id
      }
      const { error: copyError } = await dispatch('workview/copyV2StageAnnotations', copyPayload)

      busy.value = false

      if (copyError) { dispatch('toast/warning', { content: copyError.message }) }
    }

    const enabled = computed((): boolean => {
      return annotatedPredecessor.value !== null
    })

    return {
      busy,
      enabled,
      copyAnnotations
    }
  }
})
</script>

<style lang="scss" scoped>
.copy {
  @include col--center;
}
.copy__description {
  padding: 0 20px 30px;
  @include typography(md, default, 500);
  color: $colorGrayLite;
}

.copy__spinner {
  margin: -100px;
}
</style>
