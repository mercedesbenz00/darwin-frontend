<template>
  <div
    class="layout"
    :class="[layoutTypeClass]"
  >
    <div
      v-for="view in editor.viewsList"
      :key="view.id"
      class="layout__view"
      :class="{
        'layout__view--active': view.isActive && editor.viewsList.length > 1,
        'layout__view-single--active': editor.viewsList.length === 1
      }"
      @mousewheel="onViewFocus(view)"
      @mousedown="onViewFocus(view)"
    >
      <div
        v-loading="view.isImageLoading"
        class="layout__main-area"
        :loading-options="{ delay: '0.5s', label: null }"
      >
        <annotation-overlays :view="view" />
        <measure-overlays :view="view" />
        <mobile-buttons-overlay :editor="editor" />
        <view-component :view="view" />
        <comment-icons :view="view" />

        <component
          :is="name"
          v-for="({ id, name, props }) in view.components"
          :key="id"
          v-bind="props"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import AnnotationOverlays from '@/components/WorkView/AnnotationOverlay/AnnotationOverlays.vue'
import CommentIcons from '@/components/WorkView/Comment/V1/CommentIcons.vue'
import MeasureOverlays from '@/components/WorkView/MeasureOverlay/MeasureOverlays.vue'
import MobileButtonsOverlay from '@/components/WorkView/MobileButtonsOverlay/MobileButtonsOverlay.vue'
import ViewComponent from '@/components/WorkView/View'
import { Editor } from '@/engine/editor'
import { DatasetVideoLayout, View } from '@/store/types'

@Component({
  name: 'layout',
  components: {
    AnnotationOverlays,
    MeasureOverlays,
    MobileButtonsOverlay,
    CommentIcons,
    ViewComponent
  }
})
export default class Layout extends Vue {
  @Prop({ required: true, type: Object as () => Editor })
  editor!: Editor

  get type (): DatasetVideoLayout['name'] {
    return this.editor.layout.layoutConfig?.type || 'single'
  }

  get layoutTypeClass (): string {
    switch (this.type) {
    case 'vertical': return 'layout--vertical'
    case 'horizontal': return 'layout--horizontal'
    case 'grid': {
      const gridClass = 'layout--grid'
      const viewsListLength = this.editor.viewsList.length
      if (viewsListLength <= 4) {
        return `${gridClass} layout--grid--2`
      }

      if (viewsListLength <= 9) {
        return `${gridClass} layout--grid--3`
      }

      return `${gridClass} layout--grid--4`
    }
    default: return ''
    }
  }

  onViewFocus (view: View): void {
    if (!view.isActive) {
      this.editor.layout.setActiveView(view)
    }
  }
}
</script>

<style lang="scss" scoped>
.layout {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  width: 100%;
  height: 100%;

  &.layout--horizontal {
    grid-template-columns: 1fr 1fr;
  }

  &.layout--vertical {
    grid-template-rows: 1fr 1fr;
  }

  &.layout--grid {
    grid-template-columns: repeat(auto-fill, minmax(33%, 1fr));
    grid-template-rows: 1fr;
    grid-auto-rows: 1fr;

    &.layout--grid--2 {
      grid-template-columns: repeat(auto-fill, minmax(50%, 1fr));
    }
    &.layout--grid--4 {
      grid-template-columns: repeat(auto-fill, minmax(25%, 1fr));
    }
  }

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
}

.layout__main-area {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: var(--workview-center-main-area);
}
</style>
