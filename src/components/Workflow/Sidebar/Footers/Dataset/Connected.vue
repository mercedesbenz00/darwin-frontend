<template>
  <div>
    <custom-button
      size="medium"
      full-width
      tag="router-link"
      :disabled="!route"
      :to="route"
    >
      <template #suffix-icon>
        <shortcut :keys="['⏎']" />
      </template>
      Manage Dataset
    </custom-button>
    <custom-button
      size="medium"
      color="negative"
      full-width
      @click="$emit('disconnect-dataset')"
    >
      Disconnect Dataset
    </custom-button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { RawLocation } from 'vue-router'

import { CustomButton } from '@/components/Common/Button/V2'
import Shortcut from '@/components/Common/Shortcut'
import { useHotkey } from '@/composables/useHotkey'
import { useRouter } from '@/composables/useRouter'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'

export default defineComponent({
  name: 'DatasetConnected',
  components: {
    CustomButton,
    Shortcut
  },
  setup () {
    const router = useRouter()
    const scene = useWorkflowSceneStore()
    const stage = computed(() => scene.selectedStage)

    const route = computed<RawLocation | null>(() => {
      if (!stage.value) { return null }
      if (!('dataset_id' in stage.value.config)) { return null }
      if (stage.value.config.dataset_id === null) { return null }

      return {
        name: 'DatasetManagementData',
        params: { datasetId: stage.value.config.dataset_id.toString() }
      }
    })

    useHotkey({
      handler: () => {
        if (!route.value) { return }
        router.push(route.value)
      },
      key: 'Enter',
      name: 'From workflow sidebar dataset stage config, navigate to dataset management'
    })

    return { route }
  }
})

</script>
