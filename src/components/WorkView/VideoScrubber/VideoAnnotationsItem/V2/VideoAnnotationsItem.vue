<template>
  <!--
    note that props x and w are not set here. Instead, we rely on a watcher
    to position the element manually.
  -->
  <vue-draggable-resizable
    ref="draggableRef"
    class="video-annotations-item__draggable"
    parent
    axis="x"
    :grid="grid"
    :handles="['mr', 'ml']"
    :min-width="3"
    :w="width"
    :key="`${annotation.id}_${y}`"
    :y="y"
    :h="height"
    :active="active"
    :draggable="!isViewReadonly"
    :resizable="!isViewReadonly"
    @dragstop="onDragged"
    @resizing="onResizing"
    @resizestop="onResized"
    @mouseleave.native="onMouseLeave"
    @mouseover.native="onMouseOver"
  >
    <template #ml>
      <div
        v-tooltip="{
          content: `Frame ${startIndexForTooltip}`,
          delay: { show: 0, hide: 0 },
          trigger: 'manual',
          show: cursorOnLeftHandle
        }"
        class="video-annotations-item__ml"
        @mouseleave="cursorOnLeftHandle = resizing || false"
        @mouseover="cursorOnLeftHandle = true"
      >
        <extender-icon class="video-annotations-item__ml__icon" />
      </div>
    </template>
    <template #mr>
      <div
        v-tooltip="{
          content: `Frame ${endIndexForTooltip}`,
          delay: { show: 0, hide: 0 },
          trigger: 'manual',
          show: cursorOnRightHandle
        }"
        class="video-annotations-item__mr"
        @mouseleave="cursorOnRightHandle = resizing || false"
        @mouseover="cursorOnRightHandle = true"
      >
        <extender-icon class="video-annotations-item__mr__icon" />
      </div>
    </template>

    <video-annotations-item-annotation
      :active="active"
      :annotation="annotation"
      @click="onClick"
      @contextmenu="$emit('contextmenu', $event)"
      @dblclick="onDblClick"
      @delete-key-frame="deleteKeyFrame"
      @select-key-frame="selectKeyFrame"
    />
  </vue-draggable-resizable>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  watch,
  nextTick
} from 'vue'
import VueDraggableResizable from 'vue-draggable-resizable'
import { Vue } from 'vue-property-decorator'

import VideoAnnotationsItemAnnotation from '@/components/WorkView/VideoScrubber/VideoAnnotationsItem/VideoAnnotationsItemAnnotation.vue'
import ExtenderIcon from '@/components/WorkView/VideoScrubber/VideoAnnotationsItem/assets/extender.svg?inline'
import {
  ANNOTATION_ITEM_HEIGHT,
  ANNOTATION_ITEM_HEIGHT_WITH_BORDER
} from '@/components/WorkView/VideoScrubber/consts'
import { useStore, useTheme } from '@/composables'
import {
  useActiveView,
  useCurrentFrameIndex,
  useEditorV2,
  useViewReadonly
} from '@/composables/useEditorV2'
import { changeAnnotationClass } from '@/engineV2/actions'
import { Annotation } from '@/engineV2/models'

export default defineComponent({
  name: 'VideoAnnotationsItem',
  components: { ExtenderIcon, VideoAnnotationsItemAnnotation, VueDraggableResizable },
  props: {
    annotation: { required: true, type: Object as () => Annotation },
    yIndex: { required: true, type: Number }
  },
  setup (props, { emit }) {
    const { resolveEditor } = useEditorV2()
    const editor = resolveEditor()
    if (!editor) { throw new Error('Editor was not injected into the app') }

    const activeView = useActiveView()
    const isViewReadonly = useViewReadonly(activeView)

    const currentFrameIndex = useCurrentFrameIndex(activeView)

    const { state, getters } = useStore()
    const theme = useTheme()

    const hover = ref(false)
    const resizing = ref(false)

    const tabletCompensation = computed(() => getters['ui/tabletCompensation'])
    const frameLineWidth = computed(() => state.ui.workviewVideoFrameLineWidth)

    const height = computed((): number => {
      return ANNOTATION_ITEM_HEIGHT * theme.getCurrentScale() * tabletCompensation.value
    })

    /**
     * These 2 variables is used to keep the `hover` status of
     * left/right resize handlers.
     *
     * When mouseleave, these will be false unless it is resizing atm.
     * When mouseover, these will be true.
     */
    const cursorOnLeftHandle = ref<boolean>(false)
    const cursorOnRightHandle = ref<boolean>(false)

    const draggableRef = ref<Vue & {
      changeWidth: (w: number) => void
      checkParentSize: () => void
      moveHorizontally: (x: number) => void
    }>()

    const itemHeightWithBorder = computed(() => {
      return ANNOTATION_ITEM_HEIGHT_WITH_BORDER * theme.getCurrentScale() * tabletCompensation.value
    })

    /**
     * Dimensions of the draggable/resizable grid as [x, y]
     */
    const grid = computed(() => [frameLineWidth.value, itemHeightWithBorder.value])

    /**
     * First frame of item
     */
    const startIndex = computed(() => {
      const { segments } = props.annotation.data
      if (Number.isFinite(segments?.[0]?.[0])) {
        return segments[0][0]
      }

      return currentFrameIndex.value
    })

    /**
     * Last frame of item
     */
    const endIndex = computed((): number => {
      let index = currentFrameIndex.value

      const { segments } = props.annotation.data

      if (!segments) { return 0 }

      const lastSegmentIndex = segments.length - 1
      if (Number.isFinite(segments?.[lastSegmentIndex]?.[1])) {
        index = segments[lastSegmentIndex][1]
      }

      // For segment end index equal 'null`, last frame index expected as value
      if (segments?.[lastSegmentIndex]?.[1] === null) {
        return activeView.value.lastFrameIndex + 1
      }

      // Ensure min segment length to be 1
      return Math.max(index, startIndex.value + 1)
    })

    /**
     * If annotation is selected/hovered/resizing, true
     * Else, false
     */
    const active = computed((): boolean => {
      return props.annotation.isSelected || resizing.value || hover.value
    })

    const isVisible = computed((): boolean => {
      return props.annotation.isVisible
    })

    /** Top edge of item */
    const y = computed((): number => {
      return itemHeightWithBorder.value * props.yIndex
    })

    /** Left edge of item */
    const x = computed((): number => {
      return startIndex.value * frameLineWidth.value
    })

    /** Width of item */
    const width = computed((): number => {
      return (endIndex.value - startIndex.value) * frameLineWidth.value
    })

    /** Compouned computed, exists purely so we can create a watcher for it */
    const position = computed((): { width: number, x: number } => {
      return { width: width.value, x: x.value }
    })

    const scrollToPosition = (): void => {
      const { width, x } = position.value
      if (!draggableRef.value) { return }
      draggableRef.value.checkParentSize()
      draggableRef.value.moveHorizontally(x)
      draggableRef.value.changeWidth(width)
    }

    /**
     * The parent size is dynamically set and relies on the same basic prop.
     *
     * Due to order of computation for various watchers across multiple components,
     * we cannot rely on props for `vue-draggable-observable`.
     *
     * Instead, we call functions on the component itself, to set the UI manually.
     * This is using unofficial features and is prone to breaking, so we should
     * monitor and aim to move away from it.
     */
    watch(position, () => {
      nextTick(() => scrollToPosition())
    }, { immediate: true })

    watch(() => props.annotation.isSelected, () => {
      if (!props.annotation.isSelected) { return }

      nextTick(() => {
        if (!draggableRef.value) { return }

        draggableRef.value.$el.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        })
      })
    }, { immediate: true })

    const onMouseLeave = (): void => {
      if (!isVisible.value) { return }
      hover.value = false
    }

    const onMouseOver = (): void => {
      if (!isVisible.value) { return }
      hover.value = true
    }

    /** Holds future start index of the annotation during resize */
    const newStartIndex = ref<number | null>(null)
    /** Holds future end index of the annotation during resize */
    const newEndIndex = ref<number | null>(null)

    /**
     * Handles "resizing" event emitted by vue-draggable-resizable
     *
     * This one is being called while resize is happening, not after it's done,
     * so it's used to store temporary values, to update UI.
     *
     * In this case, we use the event to store what the new start and end indices
     * of the frame would be if resizing were to stop now.
     *
     * @param {number} x Left edge of the resized element
     * @param {number} y Top edge of the resized element
     * @param {number} w Width of the resized element
     * @param {number} h Height of the resized element
     */
    const onResizing = (x: number, y: number, w: number): void => {
      resizing.value = true
      newStartIndex.value = Math.round(x / frameLineWidth.value)
      newEndIndex.value = Math.round((x + w) / frameLineWidth.value)
    }

    /**
     * Computs contents for a tooltip being shown when hovering the start of the
     * annotation. Tooltip shows what the current frame number is, or what it
     * would be, if currently resizing and the resize ends here.
     */
    const startIndexForTooltip = computed((): number => {
      return newStartIndex.value !== null ? newStartIndex.value : startIndex.value
    })

    /**
     * Computs contents for a tooltip being shown when hovering the end of the
     * annotation. Tooltip shows what the current frame number is, or what it
     * would be, if currently resizing and the resize ends here.
     */
    const endIndexForTooltip = computed((): number => {
      return newEndIndex.value !== null ? newEndIndex.value : endIndex.value
    })

    /**
     * Handles "resized" event emitted by vue-draggable-resizable.
     *
     * Note that the params are different from the "dragged" event.
     *
     * @param {number} x Left edge of the resized element
     * @param {number} y Top edge of the resized element
     * @param {number} w Width of the resized element
     * @param {number} h Height of the resized element
     */
    const onResized = (x: number, y: number, w: number): void => {
      if (activeView.value.readonly) { return }

      resizing.value = false
      cursorOnLeftHandle.value = false
      cursorOnRightHandle.value = false
      const startIndex = Math.round(x / frameLineWidth.value)
      const endIndex = Math.round(startIndex + w / frameLineWidth.value)
      emit(
        'update-annotation-segments',
        props.annotation,
        [startIndex, endIndex]
      )
    }

    /**
     * Handles "dragged" event emitted by vue-draggable-resizable
     *
     * Note that the params are different from the "resized" event
     *
     * @param {number} x Left edge of the resized element
     * @param {number} y Top edge of the resized element
     */
    const onDragged = (x: number): void => {
      if (activeView.value.readonly) { return }

      const startIndex = Math.round(x / frameLineWidth.value)
      const endIndex = Math.round(startIndex + width.value / frameLineWidth.value)
      emit(
        'update-annotation-segments',
        props.annotation,
        [startIndex, endIndex]
      )
    }

    const onClick = (): void => {
      activeView.value.annotationManager.selectAnnotation(props.annotation.id)
    }

    const onDblClick = async (): Promise<void> => {
      const annotationClass = await editor.value.classDialog
        .requestUserSelectClass(props.annotation.type, props.annotation.classId)

      if (!annotationClass) { return }

      editor.value.actionManager.do(changeAnnotationClass(
        activeView.value.annotationManager,
        props.annotation,
        annotationClass
      ))
    }

    const deleteKeyFrame = (key: string): void => {
      if (activeView.value.readonly) { return }

      emit('delete-key-frame', props.annotation, parseInt(key))
    }

    const selectKeyFrame = (key: string): void => {
      editor.value.jumpToFrame(parseInt(key))
      activeView.value.annotationManager.selectAnnotation(props.annotation.id)
    }

    return {
      width,
      grid,
      y,
      height,
      active,
      onDragged,
      onResizing,
      onResized,
      onMouseLeave,
      onMouseOver,
      startIndexForTooltip,
      cursorOnLeftHandle,
      cursorOnRightHandle,
      resizing,
      endIndexForTooltip,
      onClick,
      onDblClick,
      deleteKeyFrame,
      selectKeyFrame,
      draggableRef,
      isViewReadonly
    }
  }
})
</script>

<style lang="scss" scoped>
.video-annotations-item__draggable {
  position: absolute;
  top: 0;
  left: 0;
  border: none;

  &.active {
    z-index: 10 !important;
  }
}

:deep(.video-annotations-item__draggable) {
  .handle {
    width: 1rem;
    height: 100%;
    padding: 0;
    border: none;
    background: transparent;
    outline: none;
    z-index: 10;
  }

  .handle-ml,
  .handle-mr {
    top: 50%;
    margin-top: 0;
  }

  .handle-ml {
    left: 0;
    transform: translate(-100%, -50%);
  }

  .handle-mr {
    right: 0;
    transform: translate(100%, -50%);
  }
}

.video-annotations-item__ml,
.video-annotations-item__mr {
  display: grid;
  align-items: center;
  height: 100%;
}

.video-annotations-item__ml {
  justify-content: end;
}
.video-annotations-item__mr {
  justify-content: start;
}

.video-annotations-item__ml__icon,
.video-annotations-item__mr__icon {
  max-width: 100%;
  height: 10px;

  &:focus {
    outline: none;
  }

  @include respondTo(1366px) {
    height: 100%;
  }
}

.video-annotations-item__mr__icon {
  transform: rotateZ(180deg);
}
</style>
