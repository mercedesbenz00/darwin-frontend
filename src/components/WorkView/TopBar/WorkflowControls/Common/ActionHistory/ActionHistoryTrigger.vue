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
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { XIcon } from '@/assets/icons/V1'
import { ThreeDotButton } from '@/components/Common/ThreeDotButton'
import { DatasetItemPayload, LoadingStatus } from '@/store/types'

import ActionHistory from './ActionHistory.vue'

@Component({
  name: 'action-history-trigger',
  components: {
    ActionHistory,
    ThreeDotButton,
    XIcon
  }
})
export default class ActionHistoryTrigger extends Vue {
  @State(state => state.workview.selectedDatasetItem)
  item!: DatasetItemPayload

  @State(state => state.workview.workflowActionsLoading)
  status!: LoadingStatus

  open: boolean = false

  get loading (): boolean { return this.status === LoadingStatus.Loading }

  async openPopover () {
    this.open = true
    await this.$store.dispatch('workview/loadWorkflowActions', this.item)
  }
}
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
