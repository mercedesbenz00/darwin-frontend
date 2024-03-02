<template>
  <div
    class="mapped-class"
    :class="{ 'mapped-class--unmapped': isUnmapped, 'mapped-class--focused': selectFocused}"
  >
    <div class="mapped-class__model-class-label">
      <annotation-class-icon
        class="mapped-class__icon mapped-class__icon-title"
        :type="modelClass.type"
      />
      <span class="mapped-class__label">{{ modelClass.name }}</span>
    </div>
    <div class="mapped-class__annotation-class-name">
      <annotation-class-icon
        class="mapped-class__icon mapped-class__icon-title"
        :klass="annotationClass"
      />
      <class-select
        v-model="annotationClass"
        :model-class="modelClass"
        @focus="onSelectFocus"
        @blur="onSelectBlur"
        class="mapped-class__class_select"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'

import AnnotationClassIcon from '@/assets/icons/V2/Duotone/AnnotationClassIcon.vue'
import { AnnotationClassPayload, TrainingClass } from '@/store/types'

import ClassSelect from './ClassSelect.vue'

@Component({
  name: 'mapped-class',
  components: { AnnotationClassIcon, ClassSelect }
})
export default class MappedClass extends Vue {
  @Prop({ type: Object as () => AnnotationClassPayload, required: false })
  value?: AnnotationClassPayload

  @Prop({ type: Object as () => TrainingClass, required: true })
  readonly modelClass!: TrainingClass

  annotationClass?: AnnotationClassPayload | null = null
  selectFocused: boolean = false

  @Watch('annotationClass')
  onAnnotationClassChanged (newValue?: AnnotationClassPayload): void {
    this.$emit('update', newValue)
  }

  get isUnmapped (): boolean {
    return !this.value
  }

  get iconStyle (): object {
    if (!this.annotationClass) {
      return {}
    }

    return {
      '--first-color': this.annotationClass.metadata._color,
      '--stroke-opacity': 1,
      '--fill-opacity': 0.12
    }
  }

  onSelectFocus (): void {
    this.selectFocused = true
  }

  onSelectBlur (): void {
    this.selectFocused = false
  }

  mounted (): void {
    this.annotationClass = this.value
  }

  updated (): void {
    this.annotationClass = this.value
  }
}
</script>

<style lang="scss" scoped>
.mapped-class {
  border-radius: 10px;
  background-color: $colorSurfaceRaise;

  &__model-class-label,
  &__annotation-class-name {
    display: flex;
    padding: 8px;
  }

  &__icon {
    flex: 0 0 auto;
    max-height: 20px;
    margin-right: 4px;
  }

  &__label {
    flex: 1 0 auto;
    display: block;

  }
  &__annotation-class-name {
    align-items: center;
    border: 1px solid $colorStrokeStrong;
    border-radius: inherit;
    background-color: $colorSurfaceDefault;
    padding: 0 8px;
  }

  &--focused &__annotation-class-name {
    border-color: $colorVividBlue;
  }

  &--unmapped {
    color: $colorContentSecondary;
  }

  &__class_select {
    width: 100%;
  }
}
</style>
