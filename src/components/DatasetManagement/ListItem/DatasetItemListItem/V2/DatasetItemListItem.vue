<template>
  <table-row
    :table-id="tableId"
    :row="row"
    class="table-item__clickable"
  >
    <table-item
      :table-id="tableId"
      :col="0"
      role="button"
      @click.prevent="$emit('select', { selected: rowSelected })"
    >
      <div class="checkbox__wrapper">
        <check-box-v2
          :value="rowSelected"
          name="rowSelected"
          @change="({ id, name, checked }) => $emit('select', { id, name, checked })"
        />
      </div>
      <div class="thumbnail__wrapper">
        <thumbnails
          variant="mini"
          :data="[thumbnailUrl]"
          :max="1"
        />
      </div>
      <p class="data__label">
        {{ data.name }}
      </p>
    </table-item>
    <table-item
      :table-id="tableId"
      :col="1"
      @click="$emit('select', { selected: rowSelected })"
    >
      <status-cell
        name=""
        :status="data.status"
      >
        {{ friendlyStatus }}
      </status-cell>
    </table-item>
    <table-item
      :table-id="tableId"
      :col="2"
      @click="$emit('select', { selected: rowSelected })"
    >
      <div
        class="badge__wrapper"
        v-if="!!tags"
      >
        <badge
          v-for="(tag, index) in tags"
          :key="index"
          :label="tag.name"
        />
      </div>
    </table-item>
    <table-item
      :table-id="tableId"
      :col="3"
      @click="$emit('select', { selected: rowSelected })"
    >
      <p class="row__label">
        {{ createdAt }}
      </p>
    </table-item>
    <table-item
      :table-id="tableId"
      :col="4"
      @click="$emit('select', { selected: rowSelected })"
    >
      <p class="row__label">
        {{ modifiedAt }}
      </p>
    </table-item>
    <table-item
      :table-id="tableId"
      :col="5"
      @click="$emit('select', { selected: rowSelected })"
    >
      <p class="row__label">
        {{ filesizeInfo }}
      </p>
    </table-item>
    <table-item-menu
      class="item-menu"
      :data="data"
      @click-item="onMenuAction"
    >
      <template #trigger>
        <row-menu
          :table-id="tableId"
          :row="row"
        />
      </template>
      <template #other>
        <component
          v-if="activePopover"
          :is="getContextMenuPopover()"
          :show="true"
          @on-action-assign="(member) => $emit('on-action-assign', member)"
          @on-action-stage="(stage) => $emit('on-action-stage', stage)"
          @on-action-folder="(folder) => $emit('on-action-folder', folder)"
          @on-action-folder-create="
            (normalizedPath) => $emit('on-action-folder-create', normalizedPath)
          "
          @on-action-priority="(priority) => $emit('on-action-priority', priority)"
        />
      </template>
    </table-item-menu>
  </table-row>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import Badge from '@/components/Common/Badge/Badge.vue'
import CheckBoxV2 from '@/components/Common/CheckBox/V2/CheckBox.vue'
import StatusCell from '@/components/Common/Table/V2/Cells/DatasetManagement/StatusCell/StatusCell.vue'
import RowMenu from '@/components/Common/Table/V2/RowMenu/RowMenu.vue'
import TableItem from '@/components/Common/Table/V2/TableItem/TableItem.vue'
import TableItemMenu from '@/components/Common/Table/V2/TableItemMenu/TableItemMenu.vue'
import TableRow from '@/components/Common/Table/V2/TableRow/TableRow.vue'
import Thumbnails from '@/components/Common/Thumbnails/Thumbnails.vue'
import ContextMenuPopoverAssign from '@/components/DatasetManagement/ContextMenu/ManagementContextMenu/V2/Popover/ContextMenuPopoverAssign/ContextMenuPopoverAssign.vue'
import ContextMenuPopoverFolder from '@/components/DatasetManagement/ContextMenu/ManagementContextMenu/V2/Popover/ContextMenuPopoverFolder/ContextMenuPopoverFolder.vue'
import ContextMenuPopoverPriority from '@/components/DatasetManagement/ContextMenu/ManagementContextMenu/V2/Popover/ContextMenuPopoverPriority/ContextMenuPopoverPriority.vue'
import ContextMenuPopoverStage from '@/components/DatasetManagement/ContextMenu/ManagementContextMenu/V2/Popover/ContextMenuPopoverStage/ContextMenuPopoverStage.vue'
import { AnnotationClassPayload, RootState, V2DatasetItemPayload } from '@/store/types'
import { getDatasetItemStatusLabel } from '@/store/types/DatasetItemStatus'
import { formatFileSize, formatRawDate } from '@/utils'

/**
 * @Component DatasetItemListItem
 * ~ Any description
 * @param {string} prop
 * */

@Component({
  name: 'dataset-item-list-item',
  components: {
    Badge,
    Thumbnails,
    TableRow,
    TableItem,
    StatusCell,
    CheckBoxV2,
    RowMenu,
    TableItemMenu,
    ContextMenuPopoverAssign,
    ContextMenuPopoverStage,
    ContextMenuPopoverFolder,
    ContextMenuPopoverPriority
  }
})
export default class DatasetItemListItem extends Vue {
  @Prop({ required: true, type: String })
  tableId!: string

  @Prop({ required: false, type: Number })
  row!: number

  @Prop({ required: true })
  data!: V2DatasetItemPayload

  @State((state: RootState) => state.aclass.classesById)
  classesById!: Record<number, AnnotationClassPayload>

  activePopover: string | null = null

  get rowSelected (): boolean {
    if (this.$store.state.dataset.selectedAll) { return true }
    return this.$store.state.dataset.selectedV2ItemIds.includes(this.data.id)
  }

  get thumbnailUrl (): string | null {
    return this.data.slots[0]?.thumbnail_url || null
  }

  get filesizeInfo (): string {
    let totalBytes = 0

    this.data.slots.forEach(file => {
      totalBytes += file.size_bytes
    })

    return formatFileSize(totalBytes)
  }

  get tags (): AnnotationClassPayload[] {
    // return this.data.labels.map(id => this.classesById[id])
    return []
  }

  get modifiedAt (): string {
    return formatRawDate(this.data.updated_at, 'DD / MM / YY')
  }

  get createdAt (): string {
    return formatRawDate(this.data.inserted_at, 'DD / MM / YY')
  }

  get friendlyStatus (): string {
    return getDatasetItemStatusLabel(this.data.status)
  }

  getContextMenuPopover (): string {
    if (this.activePopover) {
      return `context-menu-popover-${this.activePopover}`
    }
    return ''
  }

  onMenuAction (itemId: string): void {
    this.activePopover = itemId
  }
}
</script>

<style lang="scss" scoped>
.thumbnail__wrapper {
  display: block;
  width: 34px;
  height: 28px;
}

.data__label {
  @include typography(md-1, inter, 500);
  @include ellipsis(1, md-1);

  text-align: left;
  color: $colorNeutralsLight900;
  margin-left: 10px;
}

.badge__wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;

  & > div {
    &:not(:last-child) {
      margin-right: 2px;
    }
  }
}

.checkbox__wrapper {
  display: block;
  width: 16px;
  height: 16px;

  margin-right: 8px;
}

.row__label {
  @include typography(md-1, inter, 500);
  color: $colorNeutralsLight900;
}

.table-item__clickable {
  cursor: pointer;
}

.item-menu {
  position: relative;
}
</style>
