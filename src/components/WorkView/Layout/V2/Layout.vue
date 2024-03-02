<template>
  <div
    class="layout"
    :class="[layoutTypeClass]"
  >
    <layouts-view
      :class="{
        'layout__view-single--active': viewsList.length === 1
      }"
      v-for="view in viewsList"
      :key="view.id"
      :view="view"
      @on-action="onViewFocus(view.id)"
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  ref,
  defineComponent,
  watch,
  onBeforeUnmount
} from 'vue'

import { useEditorLayout } from '@/composables/useEditorV2'
import { LayoutConfig } from '@/engineV2/layout'
import { View } from '@/engineV2/views'

import LayoutsView from './LayoutsView.vue'

export default defineComponent({
  name: 'Layout',
  components: {
    LayoutsView
  },
  setup () {
    const layout = useEditorLayout()

    const viewsList = ref<View[]>([])

    const type = computed((): LayoutConfig['type'] => {
      return layout.value.layoutConfig?.type || 'simple'
    })

    const layoutTypeClass = computed((): string => {
      switch (type.value) {
      case 'vertical': return 'layout--vertical'
      case 'horizontal': return 'layout--horizontal'
      case 'grid': {
        const gridClass = 'layout--grid'
        const viewsListLength = viewsList.value.length
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
    })

    const onViewFocus = (viewId: View['id']): void => {
      const view = layout.value.views.get(viewId)
      if (!view) { return }

      if (!view.isActive) { layout.value.setActiveView(view) }
    }

    watch(() => layout.value, newLayout => {
      viewsList.value = newLayout.viewsList
    }, { immediate: true })

    onBeforeUnmount(() => {
      viewsList.value = []
    })

    return {
      viewsList,
      layoutTypeClass,
      onViewFocus
    }
  }
})
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
}
</style>
