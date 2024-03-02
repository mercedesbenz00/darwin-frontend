<template>
  <div>
    <custom-button
      color="primary"
      flair="soft"
      full-width
      size="medium"
      :disabled="!isSelected"
      @click="selectDataset"
    >
      <template #suffix-icon>
        <shortcut
          :keys="['⏎']"
          inverted
        />
      </template>
      Confirm
    </custom-button>
    <custom-button
      v-if="!createMode"
      size="medium"
      variant="outline"
      full-width
      @click="onCreateNewClick"
    >
      <template #prefix-icon>
        <plus-icon color="#4B5158" />
      </template>
      New Dataset
    </custom-button>
    <input-field
      value=""
      v-else
      autofocus
      placeholder="Enter dataset name"
      @enter="onCreateNewSubmit"
      @escape="onCreateNewCancel"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { RawLocation } from 'vue-router'

import { CustomButton, PlusIcon } from '@/components/Common/Button/V2'
import InputField from '@/components/Common/InputField/V2/InputField.vue'
import Shortcut from '@/components/Common/Shortcut'
import { useHotkey } from '@/composables/useHotkey'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'

export type DatasetName = string | null;

export default defineComponent({
  name: 'DatasetDisconnected',

  components: {
    CustomButton,
    InputField,
    PlusIcon,
    Shortcut
  },

  setup (_, { emit }) {
    const scene = useWorkflowSceneStore()
    const isSelected = computed<boolean>(() => !!scene.selectedDatasetId)

    const selectDataset = (): void =>
      emit('select-dataset', scene.selectedDatasetId)

    useHotkey({
      handler: () => selectDataset(),
      key: 'Enter',
      name: 'Select dataset in workflow creation'
    })
    const createMode = ref(false)

    const route: RawLocation = { name: 'DatasetCreationCreateStep' }
    const onCreateNewClick = (): void => {
      createMode.value = true
    }

    const onCreateNewSubmit = ({ value }: { value: string }): void => {
      if (value) {
        emit('create-new', value)
        createMode.value = false
      }
    }

    const onCreateNewCancel = (): void => {
      createMode.value = false
    }

    return {
      isSelected,
      route,
      selectDataset,
      createMode,
      onCreateNewCancel,
      onCreateNewClick,
      onCreateNewSubmit
    }
  }

})
</script>
