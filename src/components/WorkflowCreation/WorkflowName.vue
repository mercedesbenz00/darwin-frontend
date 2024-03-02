<template>
  <div class="workflow-name">
    <span
      class="workflow-name__readonly"
      @click="enterEdit"
    >
      <span class="workflow-name__readonly__text">{{ currentName }}</span>
      <icon-mono-edit class="workflow-name__readonly__icon" />
    </span>
    <input-field
      class="workflow-name__editing"
      v-if="editing"
      autofocus
      required
      :value="currentName"
      @escape="leaveEditWithReset"
      @blur="emitChange"
      @enter="emitChange"
      @change="applyChangeInternally"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'

import { IconMonoEdit } from '@/assets/icons/V2/Mono'
import InputField from '@/components/Common/InputField/V2/InputField.vue'

export default defineComponent({
  name: 'WorkflowName',
  components: { IconMonoEdit, InputField },
  props: {
    name: { required: true, type: String }
  },
  setup (props, { emit }) {
    const editing = ref(false)
    const currentName = ref(props.name)

    onMounted(() => {
      currentName.value = props.name
    })

    // watcher to update currentName if name prop changes
    watch(() => props.name, () => {
      currentName.value = props.name
    })

    const originalName = ref(props.name)
    const enterEdit = (): void => {
      originalName.value = currentName.value
      editing.value = true
    }

    const leaveEditWithReset = (): void => {
      currentName.value = originalName.value
      editing.value = false
    }

    const applyChangeInternally = (newVal: string): void => {
      currentName.value = newVal
    }

    const emitChange = (): void => {
      editing.value = false
      if (currentName.value === originalName.value) { return }
      emit('change', currentName.value)
    }

    return {
      applyChangeInternally,
      currentName,
      editing,
      emitChange,
      enterEdit,
      leaveEditWithReset
    }
  }
})
</script>

<style lang="scss" scoped>
.workflow-name {
  width: auto;
  display: grid;
  color: $colorContentEmphasis;
  grid-template-columns: 1fr;
  overflow: hidden;
  justify-items: start;

  // The two sections are rendered overlaid on top of each other
  // Input is only rendered in edit mode, while readonly version is
  // always rendered
  // This allows the input to stretch to the length of the original name
  // however, it will not stretch if the content changes.
  // There are ways to do this, but they're simply not how the input normally
  // behaves.
  &__readonly,
  &__editing {
    grid-area: 1 / 2 / 1 / 2;
  }

  &__readonly {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 0.5em;
    cursor: pointer;
    background: inherit;
    width: 100%;

    &__text {
      overflow: hidden;
    }

    &__icon {
      flex-shrink: 0;
    }
  }
}
</style>
