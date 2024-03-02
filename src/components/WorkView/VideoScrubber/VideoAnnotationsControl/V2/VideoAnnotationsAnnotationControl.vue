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
import { computed, defineComponent } from 'vue'

import { TrashIconOld } from '@/assets/icons/V1'
import SwitchButton from '@/components/Common/SwitchButton.vue'
import { InterpolationAlgorithm } from '@/engine/interpolate'
import { updateAnnotationData } from '@/engineV2/actions'
import { Editor } from '@/engineV2/editor'
import { Annotation } from '@/engineV2/models'

import VideoAnnotationsAnnotationToggle from './VideoAnnotationsAnnotationToggle.vue'
import VideoAnnotationsKeyframeButton from './VideoAnnotationsKeyframeButton.vue'

export default defineComponent({
  name: 'VideoAnnotationsAnnotationControl',
  components: {
    SwitchButton,
    VideoAnnotationsAnnotationToggle,
    VideoAnnotationsKeyframeButton,
    TrashIconOld
  },
  props: {
    editor: { required: true, type: Object as () => Editor }
  },
  setup (props) {

    const selectedAnnotation = computed((): Annotation | undefined =>
      props.editor.activeView.annotationManager.selectedAnnotation
    )

    const isTagAnnotation = computed((): boolean => {
      if (!selectedAnnotation.value) { return true }
      return selectedAnnotation.value.type === 'tag'
    })

    const selectedAnnotationData = computed((): Annotation['data'] | null => {
      if (!selectedAnnotation.value) { return null }
      if (!selectedAnnotation.value.isVideoAnnotation()) { return null }
      const annotationData = selectedAnnotation.value.data
      return annotationData
    })

    const interpolationEnabled = computed({
      get () {
        if (!selectedAnnotationData.value) { return false }
        return selectedAnnotationData.value.interpolated === true
      },
      set (val: boolean) {
        if (!selectedAnnotation.value || !selectedAnnotationData.value) { return }
        const action = updateAnnotationData(
          props.editor.activeView,
          selectedAnnotation.value,
          selectedAnnotationData.value,
          { ...selectedAnnotationData.value, interpolated: val }
        )
        props.editor.actionManager.do(action)
      },
    })

    // Similarly to `interpolationEnabled`, `interpolationAlgorithm` can be used
    // in a v-model-based tag (e.g. dropdown menu) to specify the interpolation algorithm
    const interpolationAlgorithm = computed({
      get () {
        if (!selectedAnnotationData.value) { return false }
        return selectedAnnotationData.value.interpolate_algorithm
      },
      set (val: InterpolationAlgorithm) {
        if (!selectedAnnotation.value || !selectedAnnotationData.value) { return }
        const action = updateAnnotationData(
          props.editor.activeView,
          selectedAnnotation.value,
          selectedAnnotationData.value,
          { ...selectedAnnotationData.value, interpolate_algorithm: val }
        )
        props.editor.actionManager.do(action)
      },
    })

    const onRemove = (): void => {
      if (!selectedAnnotation.value) { return }

      props.editor.activeView.annotationManager.deleteAnnotationAction(selectedAnnotation.value)
    }

    return {
      selectedAnnotation,
      isTagAnnotation,
      interpolationEnabled,
      interpolationAlgorithm,
      onRemove
    }
  }
})
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
