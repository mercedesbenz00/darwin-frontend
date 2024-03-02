<template>
  <gallery-context-menu v-if="isSelecting">
    <gallery-context-menu-check-item
      :value="isAllSelected"
      :label="isAllSelected ? 'DESELECT ALL' : 'SELECT ALL'"
      class="classes-context-menu__select"
      @click="onSelectAll"
    />
    <gallery-context-menu-item
      color="pink"
      :disabled="!$can('delete_annotation_class')"
      :label="`DELETE ${selectedCount} SELECTED`"
      :tooltip="!$can('delete_annotation_class') && 'You do not have permissions for this action'"
      @click="showDeleteModal"
    >
      <trash-icon-old class="classes-context-menu__delete" />
    </gallery-context-menu-item>
    <delete-classes-confirmation-dialog
      ref="deleteConfirmationDialog"
      :selected-classes="selectedClasses"
    />
  </gallery-context-menu>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { CopyIcon, TrashIconOld } from '@/assets/icons/V1'
import { DeleteClassesConfirmationDialog }
  from '@/components/Classes/DeleteClassesConfirmationDialog'
import GalleryContextMenu from '@/components/Common/Gallery/GalleryContextMenu.vue'
import GalleryContextMenuCheckItem from '@/components/Common/Gallery/GalleryContextMenuCheckItem.vue'
import GalleryContextMenuItem from '@/components/Common/Gallery/GalleryContextMenuItem.vue'
import { AnnotationClassPayload, TeamPayload } from '@/store/types'

/**
 * Renders a context menu in dataset management data tabs (base and video).
 *
 * Handles actions on selected items.
 */
@Component({
  name: 'classes-context-menu',
  components: {
    CopyIcon,
    GalleryContextMenu,
    GalleryContextMenuItem,
    GalleryContextMenuCheckItem,
    DeleteClassesConfirmationDialog,
    TrashIconOld
  }
})
export default class ClassesContextMenu extends Vue {
  @Prop({ required: true })
  classes!: AnnotationClassPayload[]

  @State(state => state.team.currentTeam)
  currentTeam!: TeamPayload

  @State(state => state.aclass.classSelected)
  classSelected!: { [key: number]: boolean }

  get selectedClasses (): AnnotationClassPayload[] {
    return this.classes.filter(aclass => this.classSelected[aclass.id])
  }

  get selectedCount (): number {
    return this.selectedClasses.length
  }

  get isAllSelected (): boolean {
    return this.classes.length === this.selectedCount
  }

  get isSelecting (): boolean {
    return this.selectedCount > 0
  }

  $refs!: Vue['$refs'] & {
    deleteConfirmationDialog: DeleteClassesConfirmationDialog
  }

  showDeleteModal () {
    this.$refs.deleteConfirmationDialog.showDeleteModal()
  }

  onSelectAll (selected: boolean) {
    this.updateAllSelections(selected)
  }

  updateAllSelections (selected: boolean) {
    this.$store.dispatch(
      'aclass/setClassSelections',
      { selections: this.classes.map(aclass => ({ id: aclass.id, selected })) }
    )
  }
}
</script>

<style lang="scss" scoped>
.classes-context-menu__delete {
  color: $colorCrimsonLight;
}

.classes-context-menu__select {
  min-width: 190px;
}
</style>
