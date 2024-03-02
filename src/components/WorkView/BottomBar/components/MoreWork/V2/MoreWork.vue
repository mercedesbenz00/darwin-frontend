<template>
  <div
    v-tooltip="tooltip"
    class="more-work"
  >
    <custom-button
      class="more-work__button"
      :class="{'more-work__button--loading': loading}"
      size="large"
      :disabled="disabled"
      full-width
      @click="requestWork"
    >
      <span v-if="loading">Fetching Images...</span>
      <span v-else>More Work</span>
    </custom-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, Ref } from 'vue'

import { CustomButton } from '@/components/Common/Button/V2'
import { useDatasetItemsLoader, useStore } from '@/composables'
import {
  DatasetItemCountsPayload,
  DatasetStatusCountsPayload
} from '@/store/types'
import { TooltipOptions } from '@/types'

export default defineComponent({
  name: 'MoreWork',
  components: { CustomButton },
  setup () {
    const { state, dispatch } = useStore()

    const dataset = computed(() => state.workview.dataset)

    const { initLoader } = useDatasetItemsLoader(dataset)

    const counts: Ref<DatasetItemCountsPayload | null> = computed(() => {
      const { datasetDetails } = state.dataset
      if (!dataset.value) { return null }
      return datasetDetails.find(d => d.id === dataset.value?.id) || null
    })

    const loading = ref(false)

    const disabled = computed((): boolean => {
      if (!Array.isArray(counts.value?.status_counts)) { return loading.value }
      const statusNew = counts.value?.status_counts
        .find((item: DatasetStatusCountsPayload) => item.status === 'new')
      const statusAnnotate = counts.value?.status_counts
        .find((item: DatasetStatusCountsPayload) => item.status === 'annotate')
      return loading.value || statusNew?.count !== 0 || statusAnnotate?.count !== 0
    })

    const tooltip = computed((): TooltipOptions => {
      return {
        content: disabled.value
          ? 'Finish your currently assigned work to request more'
          : 'Request more work ',
        placement: 'top',
        delay: { show: 300, hide: 300 }
      }
    })

    const requestWork = async (): Promise<void> => {
      if (!state.v2Workflow.workflows.length) {
        await dispatch('v2Workflow/loadWorkflows', { worker: state.ui.workerMode })
      }

      const workflow = state.v2Workflow.workflows.find(
        w => w.stages.some(
          s => 'dataset_id' in s.config && s.config.dataset_id === dataset.value?.id
        )
      )

      if (!workflow) { throw new Error('Dataset not associated to any known workflow') }

      loading.value = true

      const { data } = await dispatch('v2Workflow/requestWorkBatchInWorkflow', {
        teamSlug: dataset.value?.team_slug,
        workflowId: workflow.id
      })

      initLoader()

      if (data && data.length === 0) {
        dispatch(
          'toast/notify',
          { content: 'There are no more items available to work on.' }
        )
      }
      loading.value = false
    }

    return {
      requestWork,
      loading,
      tooltip,
      disabled
    }
  }
})
</script>

<style lang="scss" scoped>
.more-work {
  @include col--center;
  width: 140px;
  max-height: calc(100% - 1px);
  height: 52px;
  margin-left: 4px;

  &__button {
    height: 100%;
    @include typography(md-1, headlines, 800);

    &--loading {
      white-space: normal;
    }
  }
}
</style>
