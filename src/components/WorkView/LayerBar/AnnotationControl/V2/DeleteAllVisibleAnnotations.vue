<template>
  <div
    v-tooltip="
      disabledToDeleteAll
        ? { content: 'Cannot remove annotations in complete stage' }
        : undefined
    "
    class="annotation-control-delete"
    :class="{ 'annotation-control-delete--disabled': disabledToDeleteAll }"
    @click="showDeleteVisibleConfirmationModal"
  >
    <trash-icon />
    <label>Delete all visible annotations</label>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

import { TrashIcon } from '@/assets/icons/V1'
import { useModal, useStore } from '@/composables'
import { StageType } from '@/store/types'

export default defineComponent({
  name: 'DeleteAllVisibleAnnotations',
  components: { TrashIcon },
  setup (props, { emit }) {
    const modal = useModal()
    const { state } = useStore()
    const selectedStageInstance = computed(() => state.workview.v2SelectedStageInstance)

    const disabledToDeleteAll = computed(() => {
      return (
        selectedStageInstance.value &&
        selectedStageInstance.value.stage.type === StageType.Complete
      )
    })

    const showDeleteVisibleConfirmationModal = (): void => {
      if (disabledToDeleteAll.value) {
        emit('close')
        return
      }

      modal.show('confirm-delete-visible-annotations')
      emit('close')
    }

    return {
      disabledToDeleteAll,
      showDeleteVisibleConfirmationModal
    }
  }
})
</script>

<style lang="scss" scoped>
.annotation-control-delete {
  width: 100%;
  height: 26px;
  @include row;
  align-items: center;
  padding: 0 7px;
  cursor: pointer;

  &:hover, &:active {
    background-color: $colorSecondaryLight2;
    transition: background-color .1s;
  }

  label {
    @include typography(md);
    margin-left: 5px;
    cursor: pointer;
  }
}

.annotation-control-delete--disabled {
  path {
    fill: $colorAliceNight;
  }

  label {
    color: $colorAliceNight;
  }
}
</style>
