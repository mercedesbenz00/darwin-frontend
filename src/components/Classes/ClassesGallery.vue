<template>
  <div class="classes-content">
    <gallery
      :items="classes"
      :fixed-column-count="cols"
      :card-proportion="0.9"
      :view-mode="viewMode"
      :empty-message="emptyMessage"
      :loaded="!loading || classes.length > 0"
      :preferred-list-item-height="65"
      @select-all="setAllSelections"
    >
      <template #card="{ item: aClass }">
        <class-card
          :annotation-class="aClass"
          :dataset="dataset"
          :selected="classSelected[aClass.id]"
          :is-selecting="isSelecting"
          @select="onClassCardSelect($event, aClass)"
          @shift-select="onShiftSelect($event, aClass)"
          @add-to-dataset="addToDataset(aClass)"
          @remove-from-dataset="removeFromDataset(aClass)"
          @edit="onEditPickedClass(aClass)"
          @delete="onShowDeleteOneModal(aClass)"
        />
      </template>
      <template #list-item="{ item: aClass }">
        <class-list-item
          :annotation-class="aClass"
          :dataset="dataset"
          :selected="classSelected[aClass.id]"
          :is-selecting="isSelecting"
          @select="onClassCardSelect($event, aClass)"
          @shift-select="onShiftSelect($event, aClass)"
          @add-to-dataset="addToDataset(aClass)"
          @remove-from-dataset="removeFromDataset(aClass)"
          @edit="onEditPickedClass(aClass)"
          @delete="onShowDeleteOneModal(aClass)"
        />
      </template>
    </gallery>
    <delete-classes-confirmation-dialog
      ref="deleteConfirmationDialog"
      :selected-classes="selectedPickedClasses"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { DeleteClassesConfirmationDialog }
  from '@/components/Classes/DeleteClassesConfirmationDialog'
import Gallery from '@/components/Common/Gallery/Gallery.vue'
import { VIEW_MODE } from '@/components/Common/Gallery/types'
import { addToDataset } from '@/store/modules/aclass/actions/addToDataset'
import { removeFromDataset } from '@/store/modules/aclass/actions/removeFromDataset'
import {
  AnnotationClassPayload,
  DatasetPayload,
  RootState,
  StoreActionPayload,
  TeamPayload
} from '@/store/types'

import ClassCard from './ClassCard.vue'
import ClassListItem from './ClassListItem.vue'

@Component({
  name: 'classes-gallery',
  components: {
    ClassCard,
    ClassListItem,
    DeleteClassesConfirmationDialog,
    Gallery
  }
})
export default class ClassesGallery extends Vue {
  @Prop({ required: true })
  classes!: AnnotationClassPayload[]

  @Prop({ type: Boolean, default: false })
  loading!: boolean

  @Prop({ type: Object as () => DatasetPayload, default: null })
  dataset!: DatasetPayload | null

  @Prop({ type: String })
  emptyMessage!: string

  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload

  @State((state: RootState) => state.aclass.classSelected)
  classSelected!: { [key: number]: boolean }

  @State((state: RootState) => state.aclass.classesTabViewMode)
  viewMode!: VIEW_MODE

  pickedClass: AnnotationClassPayload | null = null
  lastSelected: AnnotationClassPayload | null = null
  cols: number = 4

  $refs!: Vue['$refs'] & {
    deleteConfirmationDialog: DeleteClassesConfirmationDialog
  }

  get selectedClasses (): AnnotationClassPayload[] {
    return this.classes.filter(aclass => this.classSelected[aclass.id])
  }

  get selectedCount (): number {
    return this.selectedClasses.length
  }

  get isSelecting (): boolean {
    return this.selectedCount > 0
  }

  get selectedPickedClasses (): AnnotationClassPayload[] {
    return this.pickedClass ? [this.pickedClass] : []
  }

  onClassCardSelect (evt: { id: number, selected: boolean }, aclass: AnnotationClassPayload) {
    this.lastSelected = evt.selected ? aclass : null
    this.$store.dispatch('aclass/setClassSelections', {
      selections: [{
        id: evt.id,
        selected: evt.selected
      }]
    })
  }

  /**
   * Triggers when a user holds shift while selecting or deselecting an image
   */
  onShiftSelect (evt: { id: number, selected: boolean }, aclass: AnnotationClassPayload) {
    if (this.lastSelected === null) { return this.onClassCardSelect(evt, aclass) }

    const lastSelectedIndex = this.classes.indexOf(this.lastSelected)
    const currentSelectedIndex = this.classes.indexOf(aclass)
    const lowerBound = Math.min(lastSelectedIndex, currentSelectedIndex, this.classes.length - 1)
    const upperBound = Math.max(lastSelectedIndex, currentSelectedIndex, 0)

    const selections = []
    for (let i = lowerBound; i <= upperBound; i++) {
      selections.push({ id: this.classes[i].id, selected: true })
    }

    this.$store.dispatch('aclass/setClassSelections', { selections })
  }

  onShowDeleteOneModal (aClass: AnnotationClassPayload) {
    this.pickedClass = aClass
    this.$refs.deleteConfirmationDialog.showDeleteOneModal(aClass)
  }

  onEditPickedClass (aclass: AnnotationClassPayload) {
    this.$emit('edit', aclass)
  }

  addToDataset (annotationClass: AnnotationClassPayload) {
    const { dataset } = this
    if (!dataset) { return }
    const payload: StoreActionPayload<typeof addToDataset> = {
      annotationClass,
      dataset
    }
    this.$store.dispatch('aclass/addToDataset', payload)
  }

  removeFromDataset (annotationClass: AnnotationClassPayload) {
    const { dataset } = this
    if (!dataset) { return }
    const payload: StoreActionPayload<typeof removeFromDataset> = {
      annotationClass,
      dataset
    }
    this.$store.dispatch('aclass/removeFromDataset', payload)
  }

  setAllSelections (selected: boolean) {
    this.$store.dispatch(
      'aclass/setClassSelections',
      { selections: this.classes.map(aclass => ({ id: aclass.id, selected })) }
    )
  }
}
</script>

<style lang="scss" scoped>
.classes-content {
  width: 100%;
  height: 100%;
  margin: 0;
  position: relative;
  @include col--center;
}
</style>
