<template>
  <div
    class="layout__view"
    :class="{
      'layout__view--active': isActive && hasMultipleViews
    }"
    @mousewheel="$emit('on-action')"
    @mousedown="$emit('on-action')"
  >
    <div
      v-loading="isLoading"
      class="layout__main-area"
      :loading-options="{ delay: '0.5s', label: null }"
    >
      <annotation-overlays :view="view" />
      <measure-overlays :view="view" />
      <mobile-buttons-overlay :editor="view.editor" />
      <view-component :view="view" />
      <comment-icons :view-id="view.id" />

      <component
        :is="name"
        v-for="({ id, name, props }) in view.components"
        :key="id"
        v-bind="props"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  onBeforeUnmount,
  computed,
  ref,
  watch
} from 'vue'

import AnnotationOverlays from '@/components/WorkView/AnnotationOverlay/V2/AnnotationOverlays.vue'
import CommentIcons from '@/components/WorkView/Comment/V2/CommentIcons.vue'
import MeasureOverlays from '@/components/WorkView/MeasureOverlay/V2/MeasureOverlays.vue'
import MobileButtonsOverlay from '@/components/WorkView/MobileButtonsOverlay/MobileButtonsOverlay.vue'
import ViewComponent from '@/components/WorkView/View'
import { useActiveView } from '@/composables/useEditorV2'
import { View } from '@/engineV2/views'

export default defineComponent({
  name: 'LayoutsView',
  components: {
    AnnotationOverlays,
    MeasureOverlays,
    MobileButtonsOverlay,
    CommentIcons,
    ViewComponent
  },
  props: {
    view: {
      required: true,
      type: Object as () => View
    }
  },
  setup (props) {
    const activeView = useActiveView()

    const isActive = ref(false)
    const isLoading = ref(true)

    onMounted(() => {
      const loadingHandler = (isLoadingState: boolean): void => {
        isLoading.value = isLoadingState
      }

      props.view.on('loading:changed', loadingHandler)
      onBeforeUnmount(() => {
        props.view.off('loading:changed', loadingHandler)
      })
    })

    watch(() => activeView.value, (activeView: View) => {
      isActive.value = activeView.id === props.view.id
    }, { immediate: true })

    const hasMultipleViews = computed(() => props.view.editor.viewsList.length > 1)

    return {
      hasMultipleViews,
      isActive,
      isLoading
    }
  }
})
</script>

<style lang="scss" scoped>
.layout__view {
  position: relative;
  width: 100%;

  &::before {
    content: "";
    z-index: var(--workview-center-main-active-indicator);
    position: absolute;
    left: 1rem;
    top: 1rem;
    display: block;
    width: .5rem;
    height: .5rem;
    border-radius: 50%;
    background: $colorBlue;
    opacity: 0;
    transition: opacity .2s ease-in-out;
  }

  :deep(canvas) {
    @include noSelect;
    position: absolute;
    z-index: -1;
    width: 100%;
    height: 100%;
  }

  &.layout__view--active {
    &::after {
      content: "";
      z-index: var(--workview-center-main-active-indicator);
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      border: 2px solid $colorBlue;
      pointer-events: none;
      box-sizing: border-box;
    }

    &::before {
      opacity: 1;
    }
  }
}

.layout__main-area {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: var(--workview-center-main-area);
}
</style>
