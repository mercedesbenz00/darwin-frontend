<template>
  <transition name="fade">
    <div
      v-if="selectedAnnotation"
      class="video-annotations-annotation-control"
    >
      <div
        class="annotation-control__non-tag"
        :class="{ 'annotation-control__non-tag--disabled': isTagAnnotation }"
      >
        <div class="annotation-control__interpolate">
          <label>Interpolate</label>
          <switch-button v-model="interpolationEnabled" />
        </div>
        <video-annotations-keyframe-button :editor="editor" />
      </div>
      <video-annotations-annotation-toggle :editor="editor" />
      <button
        class="annotation-control__trash"
        @click.stop="onRemove"
      >
        <trash-icon-old />
      </button>
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { TrashIconOld } from '@/assets/icons/V1'
import SwitchButton from '@/components/Common/SwitchButton.vue'
import { updateAnnotationData } from '@/engine/actions'
import { Editor } from '@/engine/editor'
import { InterpolationAlgorithm } from '@/engine/interpolate'
import { Annotation } from '@/engine/models'

import VideoAnnotationsAnnotationToggle from './VideoAnnotationsAnnotationToggle.vue'
import VideoAnnotationsKeyframeButton from './VideoAnnotationsKeyframeButton.vue'

@Component({
  name: 'video-annotations-annotation-control',
  components: {
    SwitchButton,
    VideoAnnotationsAnnotationToggle,
    VideoAnnotationsKeyframeButton,
    TrashIconOld
  }
})
export default class VideoAnnotationsAnnotationControl extends Vue {
  @Prop({ required: true })
  editor!: Editor

  get selectedAnnotation (): Annotation | undefined {
    return this.editor.selectedAnnotation
  }

  get isTagAnnotation (): boolean {
    if (!this.selectedAnnotation) { return true }
    return this.selectedAnnotation.type === 'tag'
  }

  get selectedAnnotationData (): Annotation['data'] | null {
    if (!this.selectedAnnotation) { return null }
    if (!this.selectedAnnotation.isVideoAnnotation()) { return null }
    const annotationData = this.selectedAnnotation.data
    return annotationData
  }

  get interpolationEnabled (): boolean {
    if (!this.selectedAnnotationData) { return false }
    return this.selectedAnnotationData.interpolated === true
  }

  set interpolationEnabled (val: boolean) {
    if (!this.selectedAnnotation || !this.selectedAnnotationData) { return }
    const action = updateAnnotationData(
      this.editor,
      this.selectedAnnotation,
      this.selectedAnnotationData,
      { ...this.selectedAnnotationData, interpolated: val }
    )
    this.editor.actionManager.do(action)
  }

  // Similarly to `interpolationEnabled`, `interpolationAlgorithm` can be used
  // in a v-model-based tag (e.g. dropdown menu) to specify the interpolation algorithm
  get interpolationAlgorithm (): InterpolationAlgorithm {
    if (!this.selectedAnnotationData) { return }
    return this.selectedAnnotationData.interpolate_algorithm
  }

  set interpolationAlgorithm (val: InterpolationAlgorithm) {
    if (!this.selectedAnnotation || !this.selectedAnnotationData) { return }
    const action = updateAnnotationData(
      this.editor,
      this.selectedAnnotation,
      this.selectedAnnotationData,
      { ...this.selectedAnnotationData, interpolate_algorithm: val }
    )
    this.editor.actionManager.do(action)
  }

  onRemove (): void {
    if (!this.selectedAnnotation) { return }

    this.editor.activeView.removeAnnotation(this.selectedAnnotation)
  }
}
</script>

<style lang="scss" scoped>
.video-annotations-annotation-control {
  @include row--center;
  background: $colorAliceShade;
  padding: 0 5px;
  border-radius: 5px 0 0 0;

  &[data-disabled="true"] {
    pointer-events: none;

    & > * {
      opacity: .8;
    }
  }

  & > * {
    margin: 0 3px;
  }
}

.annotation-control__non-tag {
  @include row--center;
}

.annotation-control__non-tag--disabled {
  pointer-events: none;
  opacity: .8;
}

.annotation-control__interpolate {
  @include row--center;
  margin-right: 6px;

  label {
    @include typography(md);
    color: $color90Black;
    margin-right: 5px;
  }
}

.annotation-control__trash {
  @include row--center;
  width: 20px;
  height: 20px;
  border-radius: 20px;
  padding: 3px;
  background: none;
  cursor: pointer;

  &:hover {
    background: $colorAliceShade;
  }

  &:active {
    background: $colorAliceShadow;
  }
}
</style>
