<template>
  <sidebar-configure-section
    label="Connected Dataset"
    background-color="#FFFFFF"
  >
    <div
      class="dataset-stage-connected-section__wrapper"
      v-if="dataset"
    >
      <input-field
        :value="dataset.name"
        disabled
      />
      <h1
        class="stage-path__label"
        @click="copySlug"
      >
        <span>ds:{{ dataset.team_slug }}/</span>{{ dataset.slug }}
      </h1>
    </div>
  </sidebar-configure-section>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { InputField } from '@/components/Common/InputField/V2'
import SidebarConfigureSection from '@/components/Workflow/Sidebar/Views/Configure/Section/Section.vue'
import { useStore, useToast } from '@/composables'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'
import { DatasetPayload } from '@/store/types'

export default defineComponent({
  name: 'DatasetStageSidebarChildConnected',
  components: {
    SidebarConfigureSection,
    InputField
  },
  setup () {
    const store = useStore()
    const scene = useWorkflowSceneStore()
    const stage = scene.selectedStage
    const datasetById: (id: number) => DatasetPayload | null = store.getters['dataset/findById']

    const dataset = computed<DatasetPayload | null>(() => {
      if (!stage) { return null }
      if (!('dataset_id' in stage.config)) { return null }
      if (stage.config.dataset_id === null) { return null }
      return datasetById(stage.config.dataset_id)
    })
    const toast = useToast()

    const copySlug = (): void => {
      if (!navigator || !dataset.value) { return }
      toast.info({
        duration: 3000,
        meta: { title: `"${dataset.value.team_slug}/${dataset.value.slug}" copied to clipboard` }
      })
      navigator.clipboard.writeText(`${dataset.value.team_slug}/${dataset.value.slug}`)
    }

    return { dataset, copySlug }
  }

})
</script>

<style lang="scss" scoped>
.stage-path__label {
  @include typography(md-1, inter, 500);
  color: $colorNeutralsLight900;
  max-width: 100%;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  & > span {
    color: $colorNeutralsLight500;
  }
}

.dataset-stage-connected-section__wrapper {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 12px;
}
</style>
