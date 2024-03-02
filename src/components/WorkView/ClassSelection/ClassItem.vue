<template>
  <button
    class="class-item"
    :class="{'class-item--selected': isSelected}"
    @click="$emit('select', annotationClass)"
    @dblclick="$emit('save', annotationClass)"
    @keydown.enter.stop="$emit('save', annotationClass)"
  >
    <div
      v-if="annotationClass.imageURL"
      class="class-item__image-container"
    >
      <img
        :key="annotationClass.imageURL"
        v-lazy="annotationClass.imageURL"
        class="class-item__image"
      >
    </div>
    <div
      v-else
      class="class-item__initials"
      :style="{background: annotationClass.colorRGBAstring}"
    >
      {{ initials }}
    </div>
    <div class="class-item__label-container">
      <span class="class-item__label">{{ annotationClass.displayName }}</span>
      <span
        class="class-item__color-indicator"
        :style="{backgroundColor: annotationClass.colorRGBAstring}"
      />
    </div>
  </button>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import { getShortenedName } from '@/utils'

@Component({ name: 'class-item' })
export default class ClassItem extends Vue {
  @Prop({ required: true, type: Object as () => AnnotationClass })
  annotationClass!: AnnotationClass

  @Prop({ required: false, default: null })
  selectedClass!: AnnotationClass | null

  get isSelected (): boolean {
    const { annotationClass, selectedClass } = this
    return !!selectedClass &&
      annotationClass.name.toLowerCase() === selectedClass.name.toLowerCase()
  }

  get initials (): string {
    return getShortenedName(this.annotationClass.displayName)
  }
}
</script>

<style lang="scss" scoped>
.class-item {
  position: relative;
  border-radius: 5px;
  padding: 0;
  width: 100%;
  @include row--distributed--center;
  box-shadow: $shadowS;

  &.class-item--selected,
  &:hover {
    &::after {
      content: '';
      position: absolute;
      left: -4px;
      top: -4px;
      right: -4px;
      bottom: -4px;
      background-color: $colorPrimaryLight;
      z-index: -1;
      border-radius: 8px;
    }
  }
}

.class-item__image-container,
.class-item__label {
  margin-right: 20px;
}

.class-item__image-container {
  @include square(60px);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $colorSecondaryLight;
  border-bottom-left-radius: 5px;
  border-top-left-radius: 5px;
}

.class-item__image {
  height: 100%;
}

.class-item__initials {
  @include square(60px);
  @include typography(xl, default, bold);
  overflow: hidden;
  @include row--center;
  color: $colorWhite;
  border-bottom-left-radius: 5px;
  border-top-left-radius: 5px;
}

.class-item__label-container {
  @include row--center;
  width: calc(100% - 80px);
}

.class-item__label {
  @include ellipsis(2, lg);
  flex: auto;
  text-align: left;
  color: $colorSecondaryDark1;
  word-break: break-all;
}

.class-item__color-indicator {
  width: 20px;
  min-width: 20px;
  height: 8px;
  border-radius: 50px;
  margin-right: 24px;
}
</style>
