<template>
  <div class="classes-content">
    <gallery-with-separator
      ref="gallery"
      :items="classes"
      :fixed-column-count="cols"
      :card-proportion="0.9"
      :view-mode="viewMode"
      :empty-message="emptyMessage"
      :loaded="!loading || allClasses.length > 0"
      :preferred-list-item-height="65"
      @select-all="setAllSelections"
      @scroll-above-separator="$emit('scroll-above-separator')"
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
      <template #separator>
        <slot name="separator" />
      </template>
    </gallery-with-separator>
    <delete-classes-confirmation-dialog
      ref="deleteConfirmationDialog"
      :selected-classes="selectedPickedClasses"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import ClassesGallery from '@/components/Classes/ClassesGallery.vue'
import GalleryWithSeparator from '@/components/Dataset/DatasetDetail/GalleryWithSeparator.vue'
import { AnnotationClassPayload } from '@/store/types'

@Component({
  name: 'classes-gallery-with-separator',
  extends: ClassesGallery,
  components: {
    GalleryWithSeparator
  }
})
export default class ClassesGalleryWithSeparator extends Vue {
  $refs!: {
    gallery?: Vue & GalleryWithSeparator
  }

  @Prop({ required: true, type: Array as () => AnnotationClassPayload[][] })
  classes!: AnnotationClassPayload[][]

  @Prop({ type: String })
  emptyMessage!: string

  get allClasses (): AnnotationClassPayload[] {
    return this.classes.flat()
  }

  public scrollToSeparator (): void {
    if (this.$refs.gallery) {
      this.$refs.gallery.scrollToSeparator()
    }
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
