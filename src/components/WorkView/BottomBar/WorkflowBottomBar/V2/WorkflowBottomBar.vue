<template>
  <div class="workflow-bottom-bar">
    <bottom-bar :needs-more-work="needsMoreWork">
      <template #item="{ item }">
        <workflow-image :dataset-item="item.data" />
      </template>
      <template #other>
        <more-work />
      </template>
    </bottom-bar>
  </div>
</template>

<script lang="ts">
import { computed, Ref, defineComponent } from 'vue'

import { BottomBar } from '@/components/WorkView/BottomBar/V2'
import MoreWork from '@/components/WorkView/BottomBar/components/MoreWork/V2/MoreWork.vue'
import { WorkflowImage } from '@/components/WorkView/BottomBar/components/WorkflowImage/V2'
import { useAuth, useStore } from '@/composables'
import {
  DatasetItemCountsPayload,
  DatasetPayload
} from '@/store/types'

export default defineComponent({
  name: 'WorkflowBottomBar',
  components: { BottomBar, MoreWork, WorkflowImage },
  props: {
    dataset: {
      required: true,
      type: Object as () => DatasetPayload
    }
  },
  setup (props) {
    const { state } = useStore()
    const { isAuthorized } = useAuth()

    const needsMoreWork = computed(() =>
      isAuthorized('request_work') && !isAuthorized('assign_items')
    )

    const counts: Ref<DatasetItemCountsPayload | null> = computed(() => {
      const { datasetDetails } = state.dataset
      return datasetDetails.find(d => d.id === props.dataset.id) || null
    })
    const totalItems = computed(() => counts.value?.item_count || 0)

    return {
      totalItems,
      needsMoreWork
    }
  }
})
</script>

<style lang="scss" scoped>
.workflow-bottom-bar {
  width: 100%;
  height: 100%;
}
</style>
