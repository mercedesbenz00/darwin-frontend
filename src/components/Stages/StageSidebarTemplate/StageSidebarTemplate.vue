<template>
  <div
    ref="rootEl"
    :class="{ disabled: !!isDisabled }"
    class="stage-container"
    :id="type + 'stage-sidebar-root'"
  >
    <button
      :disabled="!!isDisabled"
      class="stage-wrapper"
      :class="{ 'stage-dragging': isDragging }"
      @mousedown="onMouseDown"
    >
      <slot name="icon">
        <div role="presentation" />
      </slot>
      {{ isDragging ? '' : themeAttrs.stageTitle }}
    </button>
  </div>
</template>

<script lang="ts">
import { Transform } from 'panzoom'
import { computed, defineComponent, ref } from 'vue'

import { useStore, useToast } from '@/composables'
import { StageType } from '@/store/types'
import { stageTheme } from '@/utils/workflowStageTheme'

/**
 * Ref: https://www.figma.com/file/mPYCyjB3sYoVnWQrv8oFes/V7-Workflows-2.0?node-id=1603%3A94342
 * StageSidebarTemplate
 *
 * Display themed Stage inside canvas.
 * Component will create an clone of itself and append it below itself
 * on the DOMTree `onMouseDown()` & `onDrag()`.
 * `onMouseUp()` or more like, `onDragEnd()`. The component will emit the action
 * and passed needed data to the parent component
 * such as coordinates (X, Y), a droppable bool and the type.
 * The type is needed to indicate which stage needs to be created after end of dragging.
 */

export default defineComponent({
  name: 'StageSidebarTemplate',
  props: {
    type: { type: String as () => StageType, required: true },
    transform: { type: Object as () => Transform, required: true }
  },
  setup (props, { emit }) {
    const rootEl = ref<HTMLElement | null>(null)
    let rootClone: HTMLElement | null = null
    const dropOffsetTop: number = 52
    const elementWidth: number = 240
    const isDragging = ref(false)

    const store = useStore()
    const workflow = computed(() => store.state.v2Workflow.editedWorkflow)

    const themeAttrs = computed(() => stageTheme[props.type])

    const isDisabled = computed<boolean>(() => {
      const stageAmount =
        workflow.value?.stages.filter((stage) => stage.type === props.type).length || 0

      return themeAttrs.value.stageLimit === -1 ? false : stageAmount >= themeAttrs.value.stageLimit
    })

    const toast = useToast()

    const onMouseMove = (e: MouseEvent): void => {
      if (!rootClone) { return }

      const x = e.clientX
      const y = e.clientY

      rootClone.style.setProperty('top', `${y}px`)
      rootClone.style.setProperty('left', `${x}px`)

      const target = e.target as HTMLDivElement
      const el = target.closest('#playground-content')
      const scale = el?.id !== 'playground-content' ? 1 : props.transform.scale

      rootClone.style.setProperty('transform', `scale(${scale})`)
    }

    const onMouseUp = (e: MouseEvent): void => {
      isDragging.value = false

      document.body.removeEventListener('mousemove', onMouseMove)
      document.body.removeEventListener('mouseup', onMouseUp)

      if (!rootClone) { return }
      rootClone.remove()

      // step 2 - verify drop is valid

      const target = e.target as HTMLDivElement | null
      if (!target) { return }
      const el = target.closest('#playground-content')
      if (!el) {
        toast.warning({
          duration: 3000,
          meta: { title: 'You can not drop that stage here.' }
        })
        return
      }

      // step 3 - emit proper event

      const x = (e.clientX - props.transform.x - elementWidth) / props.transform.scale
      const y = (e.clientY - props.transform.y - dropOffsetTop) / props.transform.scale

      emit('on-drag-end', {
        type: props.type,
        droppable: x > 0 && y > 0,
        x,
        y
      })
    }

    const onMouseDown = (): void => {
      if (!rootEl.value) { return }
      isDragging.value = true
      document.body.addEventListener('mousemove', onMouseMove)
      document.body.addEventListener('mouseup', onMouseUp)

      rootClone = rootEl.value.cloneNode(true) as HTMLElement
      if (!rootClone) { return }

      rootClone.style.setProperty('width', '180px')
      rootClone.style.setProperty('z-index', '999999')
      rootClone.style.setProperty('position', 'fixed')
      rootClone.style.setProperty('--highlightColor', themeAttrs.value.highlightColor)
      rootClone.setAttribute('id', `${rootClone?.getAttribute('id')}_clone`)
      rootClone.style.setProperty('--o', '1')
      // this ensures the target of the mouseup event (end of the drag) wont be
      // the element we're dragging and will in fact be the element we drag on to
      rootClone.style.setProperty('pointer-events', 'none')
      rootClone.ownerDocument.body.appendChild(rootClone)

      emit('on-drag-start')
    }

    return {
      isDisabled,
      isDragging,
      rootEl,
      onMouseDown,
      themeAttrs
    }
  }
})
</script>

<style lang="scss" scoped>
.stage-container {
  position: relative;
  display: block;
  width: 100%;
  height: 52px;
  min-height: 52px;
  box-sizing: border-box;
  box-shadow: $shadowLightXXS;
  background: $colorNeutralsLightWhite;
  border: 1px solid $colorNeutralsLight300;
  border-radius: 8px;
  cursor: inherit;
  transition: transform .3s ease;
  transform-origin: top left;
}

.disabled {
  background: $colorNeutralsLight100;
  border: 1px solid $colorNeutralsLight400;
}

.stage-wrapper {
  transition: background 125ms ease;

  display: grid;
  grid-gap: 8px;
  grid-template-columns: 20px 1fr;
  align-items: center;

  text-align: left;
  width: 100%;
  height: 100%;
  background: transparent;
  border-radius: 8px;

  cursor: inherit;

  min-width: 212px;
  padding: 0 16px;

  @include typography(md-1, inter, 500);
  color: $colorNeutralsLight700;

  &:disabled {
    color: $colorNeutralsLight900;
    cursor: not-allowed;
  }
}

.stage-dragging {
  background: $colorNeutralsLight300;

  & > * {
    display: none;
  }
}
</style>
