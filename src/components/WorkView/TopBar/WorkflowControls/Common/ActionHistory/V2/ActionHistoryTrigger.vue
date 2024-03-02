<template>
  <v-popover
    trigger="manual"
    :open.sync="open"
    popover-class="action-popover"
  >
    <three-dot-button
      class="trigger"
      :disabled="false"
      @click="openPopover"
    />
    <template #popover>
      <div
        v-loading="loading"
        class="action-container"
        :loading-options="{ label: null }"
      >
        <div class="action-container__header">
          <h3>Workflow Stats</h3>
          <button
            class="action-container__header__close"
            @click="open = false"
          >
            <x-icon />
          </button>
        </div>
        <action-history />
      </div>
    </template>
  </v-popover>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'

import { XIcon } from '@/assets/icons/V1'
import { ThreeDotButton } from '@/components/Common/ThreeDotButton'
import { useStore } from '@/composables/useStore'
import { LoadingStatus } from '@/store/types'

import ActionHistory from './ActionHistory.vue'

export default defineComponent({
  name: 'ActionHistoryTrigger',
  components: {
    ActionHistory,
    ThreeDotButton,
    XIcon
  },
  setup () {
    const { state, dispatch } = useStore()
    const item = state.workview.selectedDatasetItem
    const status = state.workview.workflowActionsLoading
    const open = ref(false)
    const loading = status === LoadingStatus.Loading
    const openPopover = (): void => {
      open.value = true
      dispatch('workview/loadWorkflowActions', item)
    }

    return {
      item,
      status,
      open,
      loading,
      openPopover
    }
  }
})
</script>

<style lang="scss" scoped>
.action-container {
  color: $colorBlack;
  padding: 10px;
  @include typography(md, inter, bold);

  &__header {
    @include row--distributed;
    @include typography(xl, inter, bold);
    margin-bottom: 26px;

    &__close {
      padding: 0;
      background: transparent;
      transition: color .2s ease;
    }
  }
}

.action-container__header__close {
  color: $colorAliceNight;

  &:hover {
    color: $colorAliceShadow;
  }
}

.trigger {
  margin-left: -6px;
  margin-right: -6px;
  padding: 6px;
  color: $colorAliceShadow;
  background: transparent;
  transition: color .2s ease;

  &:hover {
    color: $colorAliceNight;
  }
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.action-popover .popover-inner {
  @include dropdownBelow;
  background: $colorWhite;
}

.action-popover .popover-arrow {
  display: none;
}
</style>
