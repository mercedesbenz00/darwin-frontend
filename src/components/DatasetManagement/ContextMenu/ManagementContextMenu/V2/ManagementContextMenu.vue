<template>
  <fade-transition>
    <div
      v-if="selectedCount > 0 || isAllSelected"
      class="action-bar"
    >
      <p class="action-bar__label">
        {{ selectedCount }} Selected
      </p>
      <div
        class="action-bar__wrapper"
        v-click-outside="closePopover"
      >
        <action-bar-select
          :active="isAllSelected"
          @click="onSelect"
        />
        <action-bar-restore
          v-if="isAllArchived"
          @click="onRestore"
        >
          <icon-mono-step />
        </action-bar-restore>
        <!-- member could return MembershipPayload or 'anyone' -->
        <action-bar-default
          v-if="!isAllArchived && !assignDisabled"
          id="action-assign"
          @click="openPopover('assign')"
          :active="activePopover === 'assign'"
        >
          <template #icon>
            <icon-mono-person :variant="activePopover === 'assign' ? 'selected' : 'default'" />
          </template>
          <template #popover>
            <context-menu-popover-assign
              :show="activePopover === 'assign'"
              @assign="assign"
            />
          </template>
          Assign
        </action-bar-default>
        <action-bar-default
          v-if="!isAllArchived && assignDisabled"
          id="action-assign-disabled"
          :disabled="'disabled'"
          v-tooltip="{
            content: assignTooltip
          }"
        >
          <template #icon>
            <icon-mono-person :variant="'default'" />
          </template>
          Assign
        </action-bar-default>
        <action-bar-default
          v-if="!isAllArchived && workflow20"
          :active="activePopover === 'stage'"
          @click="openPopover('stage')"
        >
          <template #icon>
            <icon-duotone-idle :variant="activePopover === 'stage' ? 'selected' : 'default'" />
          </template>
          <template #popover>
            <context-menu-popover-stage
              :show="activePopover === 'stage'"
              @discard-annotations="discardAnnotations"
              @set-stage="setStage"
            />
          </template>
          Stage
        </action-bar-default>
        <action-bar-default
          v-if="!isAllArchived && !workflow20"
          :disabled="'disabled'"
          v-tooltip="{
            content:
              'You can move items to stages when a workflow is attached to this dataset.'
          }"
        >
          <template #icon>
            <icon-duotone-idle :variant="'default'" />
          </template>
          Stage
        </action-bar-default>
        <action-bar-default
          id="action-folder"
          :active="activePopover === 'folder'"
          @click="openPopover('folder')"
          context-type="folder"
        >
          <template #icon>
            <icon-duotone-view-folder
              :variant="activePopover === 'folder' ? 'selected' : 'default'"
            />
          </template>
          <template #popover>
            <context-menu-popover-folder
              :show="activePopover === 'folder'"
              @set-folder="(folder) => setToExistingFolder(folder)"
              @create-folder="(normalizedPath) => setToNewFolder(normalizedPath)"
              :active="activePopover === 'folder'"
            />
          </template>
          Folder
        </action-bar-default>
        <action-bar-default
          id="action-priority"
          @click="openPopover('priority')"
          :active="activePopover === 'priority'"
          context-type="priority"
        >
          <template #icon>
            <icon-mono-priority :variant="activePopover === 'priority' ? 'selected' : 'default'" />
          </template>
          <template #popover>
            <context-menu-popover-priority
              :show="activePopover === 'priority'"
              @set-priority="(priority) => setPriority(priority)"
            />
          </template>
          Priority
        </action-bar-default>
        <action-bar-danger
          id="action-danger"
          :mode="isAllArchived ? 'delete' : 'archive'"
          @click="onDangerAction"
        />
      </div>
      <delete-confirmation-dialog
        name="delete-items"
        :loading="isProcessing"
        :title="deleteDialogTitle"
        :detail="deleteDialogDetail"
        :button-text="deleteDialogButton"
        cancel-button-text="No, don't delete"
        @confirmed="onDeleteItems"
      />
      <delete-confirmation-dialog
        name="delete-items"
        :loading="isProcessing"
        :title="deleteDialogTitle"
        :detail="deleteDialogDetail"
        :button-text="deleteDialogButton"
        cancel-button-text="No, don't delete"
        @confirmed="onDeleteItems"
      />
    </div>
  </fade-transition>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  SetupContext,
  ref,
  Ref,
  watch
} from 'vue'

import { IconDuotoneViewFolder, IconDuotoneIdle } from '@/assets/icons/V2/Duotone'
import { IconMonoPerson, IconMonoPriority, IconMonoStep } from '@/assets/icons/V2/Mono'
import { DeleteConfirmationDialog } from '@/components/Common/DeleteConfirmationDialog/V2'
import FadeTransition from '@/components/Transitions/Fade.vue'
import { useModal } from '@/composables'
import {
  DatasetPayload,
  V2DatasetItemPayload,
  MembershipPayload,
  V2DatasetFolderPayload,
  V2WorkflowStagePayload
} from '@/store/types'
import { pluralize } from '@/utils/pluralize'

import ActionBarDanger from './ActionBarElement/ActionBarDanger.vue'
import ActionBarDefault from './ActionBarElement/ActionBarDefault.vue'
import ActionBarRestore from './ActionBarElement/ActionBarRestore.vue'
import ActionBarSelect from './ActionBarElement/ActionBarSelect.vue'
import ContextMenuPopoverAssign from './Popover/ContextMenuPopoverAssign/ContextMenuPopoverAssign.vue'
import ContextMenuPopoverFolder from './Popover/ContextMenuPopoverFolder/ContextMenuPopoverFolder.vue'
import ContextMenuPopoverPriority from './Popover/ContextMenuPopoverPriority/ContextMenuPopoverPriority.vue'
import ContextMenuPopoverStage from './Popover/ContextMenuPopoverStage/ContextMenuPopoverStage.vue'
import { useMenuItemAction } from './useMenuItemAction'

/**
 * @Component ManagementContextMenu
 * ~ V2 Component for Dataset Management.
 *
 * The component is very easy to use and doesn't require any additional tweaks.
 * For usage just import and call whatever you want on the emitted functions.
 * On each popover the component will return an individual function.
 * If you need help or tips on implementation check the story of this component. You'll see
 * all existing emitted functions and its arguments there
 * @param {Number} dataset dataset
 * @param {Boolean} datasetItems dataset items for management
 * */

export default defineComponent({
  name: 'ManagementContextMenu',
  components: {
    FadeTransition,
    ActionBarDefault,
    ActionBarSelect,
    ActionBarDanger,
    ActionBarRestore,
    DeleteConfirmationDialog,
    ContextMenuPopoverAssign,
    ContextMenuPopoverFolder,
    ContextMenuPopoverPriority,
    ContextMenuPopoverStage,
    IconMonoPerson,
    IconMonoStep,
    IconMonoPriority,
    IconDuotoneViewFolder,
    IconDuotoneIdle
  },
  props: {
    dataset: {
      required: true,
      type: Object as PropType<DatasetPayload>
    },
    datasetItems: {
      type: Array as PropType<V2DatasetItemPayload[]>,
      default: () => []
    }
  },
  setup (props, context: SetupContext) {
    const modal = useModal()
    const activePopover: Ref<string | null> = ref(null)
    const itemsDataset: Ref<V2DatasetItemPayload[]> = ref(props.datasetItems)
    const menuAction = useMenuItemAction(
      context,
      props.dataset,
      itemsDataset
    )

    const { isAllArchived, isAllSelected, selectedCount,
      isProcessing, workflow20, hasProcessingItems } = menuAction

    watch(menuAction.selectedCount, (selectedCount) => {
      if (selectedCount === 0) {
        activePopover.value = null
      }
    })

    watch(() => props.datasetItems, (items) => {
      itemsDataset.value = items
    })

    const assignDisabled = computed(() => {
      return (
        selectedCount.value === 0 ||
        !workflow20.value ||
        hasProcessingItems.value
      )
    })

    const assignTooltip = computed(() => {
      if (selectedCount.value === 0) {
        return 'Select some items before assigning.'
      }

      if (hasProcessingItems.value) {
        return 'Cannot assign. Some of the selected items are uploading or processing.'
      }

      if (!workflow20.value) {
        return 'You can move items to stages when a workflow is attached to this dataset.'
      }
      return null
    })

    const openPopover = (type: string): void => {
      if (activePopover.value === type) {
        activePopover.value = null
        return
      }
      activePopover.value = type
    }

    const closePopover = (): void => {
      activePopover.value = null
    }

    const onDangerAction = async (): Promise<void> => {
      closePopover()
      if (isAllArchived.value) {
        modal.show('delete-items')
      } else {
        await menuAction.archiveItems()
      }
    }

    const onRestore = async (): Promise<void> => {
      closePopover()
      await menuAction.restoreItems()
    }

    const onSelect = (): void => {
      menuAction.onSelectAll(!menuAction.isAllSelected.value)
    }

    const onDeleteItems = async (): Promise<void> => {
      await menuAction.deleteItems()
    }

    const deleteDialogTitle = computed(() => {
      return pluralize(menuAction.selectedCount.value, 'Delete Item?', 'Delete Items?', false)
    })

    const deleteDialogButton = computed(() => {
      return pluralize(menuAction.selectedCount.value, 'Delete Item', 'Delete Items', false)
    })

    const deleteDialogDetail = computed(() => {
      const numeric = pluralize(menuAction.selectedCount.value, 'item', 'items')
      return `Are you sure you want to delete ${numeric}?`
    })
    const assign = async (member: MembershipPayload): Promise<void> => {
      closePopover()
      await menuAction.assign(member)
    }

    const setToExistingFolder = async (folder: V2DatasetFolderPayload): Promise<void> => {
      closePopover()
      await menuAction.moveToFolder(folder.path)
    }

    const setToNewFolder = async (folder: string): Promise<void> => {
      closePopover()
      await menuAction.moveToFolder(folder)
    }

    const setPriority = async (priority: number): Promise<void> => {
      closePopover()
      await menuAction.addPriority(priority)
    }

    const setStage = async (stage: V2WorkflowStagePayload): Promise<void> => {
      closePopover()
      await menuAction.setStage(stage)
    }

    const discardAnnotations = async (): Promise<void> => {
      closePopover()
      await menuAction.discardAnnotations()
    }

    return {
      activePopover,
      assign,
      closePopover,
      discardAnnotations,
      isAllArchived,
      isAllSelected,
      isProcessing,
      onDangerAction,
      onRestore,
      onSelect,
      openPopover,
      onDeleteItems,
      deleteDialogTitle,
      deleteDialogButton,
      deleteDialogDetail,
      selectedCount,
      setToExistingFolder,
      setToNewFolder,
      setPriority,
      setStage,
      workflow20,
      assignDisabled,
      assignTooltip
    }
  }
})
</script>

<style lang="scss" scoped>
.action-bar {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  height: 44px;
  width: fit-content;

  background: $colorSurfaceElevate;
  border: 1px solid $colorStrokeStrong;
  border-radius: 48px;

  box-shadow: $effectShadowsSM;

  z-index: 99999;
}

.action-bar__label {
  @include typography(md-1, inter, 500);
  color: $colorContentDefault;
  text-align: center;

  margin-left: 16px;
  margin-right: 10px;
}

.action-bar__wrapper {
  position: relative;
  left: 1px;
  height: 44px;

  display: inline-grid;
  align-items: center;
  grid-template-columns: repeat(6, auto);
  gap: 2px;
  background: $colorSurfaceDefault;
  border: 1px solid $colorStrokeStrong;
  border-radius: 48px;
  box-shadow: $effectShadowsSM;

  padding: 0px 4px;
}
</style>
