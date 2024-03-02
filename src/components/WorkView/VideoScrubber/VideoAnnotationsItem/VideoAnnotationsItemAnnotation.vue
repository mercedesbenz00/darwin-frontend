<template>
  <div
    v-if="mainAnnotationType"
    class="video-item-annotation"
    :class="{
      'video-item-annotation--active': active,
      'video-item-annotation--disabled': disabled,
      'video-item-annotation--selected': isSelected
    }"
    :style="typeStyle"
    @click.stop="$event => $emit('click', $event)"
    @dblclick.stop="$event => $emit('dblclick', $event)"
    @contextmenu.prevent="$event => $emit('contextmenu', $event)"
  >
    <hr
      v-if="keyframesCount > 1"
      class="video-item-annotation__keyframeline"
      :style="hrStyle"
    >
    <span class="video-item-annotation__name">{{ name }}</span>
    <type-icon
      class="video-item-annotation__icon"
      :type="annotationTypeName"
      :color="color"
    />
    <video-annotations-item-keyframe
      v-for="(key, index) of keyframes"
      :key="`keyframe${index}`"
      :annotation="annotation"
      :keyframe-index="key"
      :position="keyframesCount > 1 && subkeyframesCount > 0 ? 1 : 0"
      @select="$emit('select-key-frame', key)"
      @delete="$emit('delete-key-frame', key)"
    />
    <video-annotations-item-keyframe
      v-for="(key, index) of subkeyframes"
      :key="`subkeyframe${index}`"
      is-subkey
      :annotation="annotation"
      :keyframe-index="key"
      :position="keyframesCount > 1 && subkeyframesCount > 0 ? -1 : 0"
      @select="$emit('select-key-frame', key)"
      @delete="$emit('delete-key-frame', key)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import TypeIcon from '@/components/Common/AnnotationType/TypeIcon.vue'
import { Annotation } from '@/engine/models'
import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import { AnnotationTypePayload } from '@/store/types'
import { rgbaToHSLA, hslaString, modifyHSLA } from '@/utils'

import VideoAnnotationsItemKeyframe from './VideoAnnotationsItemKeyframe.vue'

@Component({
  name: 'video-annotations-item-annotation',
  components: { TypeIcon, VideoAnnotationsItemKeyframe }
})
export default class VideoAnnotationsItemAnnotation extends Vue {
  @Prop({ required: true })
  annotation!: Annotation

  @Prop({ required: true, type: Boolean })
  active!: boolean

  @Getter('mainAnnotationTypeForClass', { namespace: 'aclass' })
  mainAnnotationTypeForClass!: (aClass: AnnotationClass) => AnnotationTypePayload

  get mainAnnotationType (): AnnotationTypePayload | null {
    return this.annotation.annotationClass
      ? this.mainAnnotationTypeForClass(this.annotation.annotationClass)
      : null
  }

  get name (): string {
    return this.annotation.annotationClass!.name
  }

  get annotationTypeName (): string | null {
    return this.mainAnnotationType?.name || null
  }

  get color (): string {
    return this.annotation.annotationClass!.colorRGBAstring
  }

  get isSelected (): boolean {
    return this.annotation.isSelected
  }

  get disabled (): boolean {
    return !this.annotation.isVisible
  }

  get keyframes (): string[] {
    if (!this.annotation?.data?.frames) { return [] }

    return Object.keys(this.annotation.data.frames)
  }

  get subkeyframes (): string[] {
    return Object.keys(this.annotation.data.sub_frames || {})
  }

  get keyframesCount (): number {
    return this.keyframes.length
  }

  get subkeyframesCount (): number {
    return this.subkeyframes.length || 0
  }

  get typeStyle () {
    const hsla = rgbaToHSLA(this.annotation.annotationClass!.color)
    const { active, color, isSelected } = this
    const hoverColor = hslaString(modifyHSLA(hsla, { l: Math.min(hsla.l * 1.9, 90) }))
    const defaultColor = hslaString(modifyHSLA(hsla, { l: Math.min(hsla.l * 2, 95) }))
    const boxShadows: string[] = []

    if (isSelected) {
      const selectedBoxShadow = `inset 0 0 0 1px ${color}`
      boxShadows.push(selectedBoxShadow)
    }
    if (active) {
      const activeBoxShadow = '0 0 0 1px rgba(145, 169, 192, 0.3)'
      boxShadows.push(activeBoxShadow)
    }

    return {
      // By default, show the original color
      // When hover or dragging or selected, show darker color
      background: active ? hoverColor : defaultColor,
      borderColor: color,
      color: this.color,
      boxShadow: boxShadows.join(', ')
    }
  }

  get hrStyle () {
    return {
      top: `${this.keyframesCount && this.subkeyframesCount ? '32%' : '50%'}`
    }
  }
}
</script>

<style lang="scss" scoped>
.video-item-annotation {
  @include row;
  align-items: center;
  height: 100%;
  padding: 1px 0;

  border-radius: 3px;
  border-width: 1px;
  border-style: solid;

  position: relative;
  @include noSelect;
  cursor: pointer;
  overflow: hidden;
  transition: background .2s ease-in-out;

  @include respondTo(1366px) {
    border-radius: 6px;
  }
}

.video-item-annotation--disabled {
  opacity: 0.3;
}

.video-item-annotation__name {
  position: relative;
  display: inline-block;
  margin: 1px 3px 1px 4px;
  max-width: 100%;
  @include ellipsis(1, md);
  @include typography(md);
  font-size: 0.75rem;
  line-height: 1rem;
}

.video-item-annotation__icon {
  position: relative;
  width: 18px;
  height: 18px;
  min-width: 18px;
  margin-right: 4px;
}

.video-item-annotation__keyframeline {
  position: absolute;
  transform: translateY(-50%);
  right: 0;
  left: 0;
  height: 2px;
  border: none;
  margin: 0;
  background-image: radial-gradient(#ffffff 0.5px, transparent 0.5px);
  background-position: 0 0;
  background-size: 2px 2px;
}
</style>
