<template>
  <form
    class="disconnected-model-stage-sidebar-child"
    @submit.prevent
  >
    <div class="disconnected-model-stage-sidebar-child__search-form">
      <search-field
        v-model="query"
        class="disconnected-model-stage-sidebar-child__search-field"
        placeholder="Search Models"
      />
    </div>
    <div class="disconnected-model-stage-sidebar-child__models">
      <label
        class="disconnected-model-stage-sidebar-child__model"
        v-for="model in filteredModels"
        :key="model.id"
        @dblclick="$emit('connect-model', model.id)"
      >
        <input
          class="disconnected-model-stage-sidebar-child__input"
          type="radio"
          name="model_id"
          required
          :value="model.id"
          @change="selectModel(model.id)"
        >
        <model-card
          class="disconnected-model-stage-sidebar-child__card"
          :model="model"
          :selected="selectedModelId === model.id"
        />
      </label>
    </div>
  </form>
</template>

<script lang="ts">

import { computed, defineComponent, onMounted, ref } from 'vue'

import ModelCard from '@/components/Common/ModelCard/ModelCard.vue'
import SearchField from '@/components/Common/SearchField/V2/SearchField.vue'
import { useStore } from '@/composables/useStore'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'

export default defineComponent({
  name: 'DisconnectedModelStageSidebarChild',
  components: { ModelCard, SearchField },
  setup () {
    const store = useStore() 
    const scene = useWorkflowSceneStore()
    const selectedModelId = computed(() => scene.selectedModelId)
    const query = ref('')

    const models = computed(() => store.state.neuralModel.runningSessions)

    const filteredModels = computed(() => {
      if (query.value === '') { return models.value }
      const regex = new RegExp(query.value, 'i')

      return models.value.filter((m) => m.id === query.value || m.name.match(regex))
    })

    onMounted(() => {
      store.dispatch('neuralModel/loadRunningSessions')
    })

    const selectModel = (modelId: string): void => {
      scene.selectModel(modelId)
    }
  
    return { 
      filteredModels,
      query, 
      selectedModelId,
      selectModel
    }
  }
})
</script>

<style lang="scss" scoped>
.disconnected-model-stage-sidebar-child {
  height: 100%;
  background-color: $colorSurfaceElevate;

  &__search-form {
    padding: 10px;
    background-color: $colorSurfaceDefault;
  }

  &__models {
    padding: 10px;
  }

  &__model:not(:last-child) {
    display: block;
    margin-bottom: 8px;
  }

  &__input {
    display: none;
  }

  &__card {
    cursor: pointer;
  }

  &__input:checked + &__card {
    border: 2px solid $colorInteractivePrimaryDefault;
    padding: 5px;
  }
}
</style>
