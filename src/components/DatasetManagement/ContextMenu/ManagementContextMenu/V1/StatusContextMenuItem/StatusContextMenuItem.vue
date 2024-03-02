<template>
  <div>
    <v-popover
      placement="top"
      trigger="click"
      popover-class="status-change__popover"
      :offset="1"
      :container="false"
    >
      <gallery-context-menu-item
        class="status-change"
        label="STATUS"
      >
        <status-change-icon class="status-change__icon" />
      </gallery-context-menu-item>
      <template #popover>
        <div class="status-selection">
          <button
            class="status-selection__item item"
            :disabled="busy"
            @click="markAsComplete"
          >
            <completed-icon class="item__icon item__icon--complete" />
            <div class="item__label">
              Mark as Complete
            </div>
          </button>
          <button
            class="status-selection__item item"
            :disabled="busy"
            @click="advanceToNextStage"
          >
            <chevron-right-icon class="item__icon item__icon--annotate" />
            <div class="item__label">
              Advance 1 Stage
            </div>
          </button>
          <button
            v-tooltip="'Set status to new while keeping annotations'"
            class="status-selection__item item"
            :disabled="busy"
            @click="moveItemsToNew"
          >
            <div class="item__icon item__icon item__icon--new" />
            <div class="item__label">
              Reset to New
            </div>
          </button>
          <!-- disabled buttons do not trigger tooltips, so we must wrap them -->
          <button
            v-tooltip="'Set status to new and discard all annotations'"
            class="status-selection__item item"
            :disabled="busy"
            @click="resetItemsToNew"
          >
            <trash-icon class="item__icon item__icon--archived" />
            <div class="item__label">
              Clear and Reset to New
            </div>
          </button>
        </div>
      </template>
    </v-popover>
    <delete-confirmation-dialog
      :name="resetModalName"
      :loading="busy"
      title="Are you sure you wish to reset?"
      detail="This will discard all annotations on the selected items."
      button-text="RESET TO NEW"
      @confirmed="confirmResetItemsToNew"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { StatusChangeIcon, ChevronRightIcon, CompletedIcon, TrashIcon } from '@/assets/icons/V1'
import { DeleteConfirmationDialog } from '@/components/Common/DeleteConfirmationDialog/V1'
import GalleryContextMenuItem from '@/components/Common/Gallery/GalleryContextMenuItem.vue'

@Component({
  name: 'status-context-menu-item',
  components: {
    ChevronRightIcon,
    CompletedIcon,
    DeleteConfirmationDialog,
    GalleryContextMenuItem,
    StatusChangeIcon,
    TrashIcon
  }
})
export default class StatusContextMenuItem extends Vue {
  get comingSoon () {
    return { content: 'Coming soon' }
  }

  busy: boolean = false

  advanceToNextStage () {
    this.performAction('dataset/advanceSelectedItemsToNextStage')
  }

  markAsComplete () {
    this.performAction('dataset/markSelectedItemsCompleted')
  }

  async moveItemsToNew () {
    await this.performAction(
      'dataset/moveSelectedItemsToNew',
      'Status changed to new'
    )
  }

  readonly resetModalName = 'reset-items-to-new-modal'

  resetItemsToNew () {
    this.$modal.show(this.resetModalName)
  }

  async confirmResetItemsToNew () {
    await this.performAction(
      'dataset/resetSelectedItemsToNew',
      'Annotations cleared, and reset to new'
    )
    this.$modal.hide(this.resetModalName)
  }

  async performAction (action: string, successMessage?: string) {
    this.busy = true

    const result = await this.$store.dispatch(action)

    this.busy = false

    if ('error' in result) {
      this.$store.dispatch('toast/warning', { content: result.error.message })
    } else if (successMessage) {
      this.$store.dispatch('toast/notify', { content: successMessage })
    }

    return result
  }
}
</script>

<style lang="scss" scoped>
.status-change {
  height: 100%;
}

.status-change__icon {
  color: $colorAliceNight;
}

.status-selection {
  display: grid;
  grid-template-rows: auto auto auto auto;
  overflow: hidden;
  margin: 7px 0;
  justify-items: stretch;
}

.item {
  width: 100%;
  background: $colorWhite;
  display: grid;
  padding: 7px 14px;
  grid-template-columns: 20px 1fr;
  column-gap: 10px;
  justify-items: start;
  align-items: center;
  transition: background-color .2s ease;
}

.item:not(:disabled):hover,
.item:not(:disabled):active {
  background: $colorAliceBlue;
}

.item__icon {
  width: 20px;
  height: 20px;
  padding: 5px;
  border-radius: 50%;
  color: $colorWhite;
  @include workflow-status-background-color;
}

.item__label {
  color: $color90Black;
}

// Delete icon appears smaller so smaller
// padding resolves
.item__icon--archived {
  padding: 3px;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.status-change__popover {
  @include dropdownAbove;
  overflow: hidden;
  top: 5px !important;

  .popover-inner {
    padding: 0;
  }

  .popover-arrow {
    display: none;
  }
}
</style>
