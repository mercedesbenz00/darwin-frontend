<template>
  <vue-draggable-resizable
    class="bottom-drawer"
    :class="{'bottom-drawer--collapsed': collapsed}"
    active
    axis="y"
    class-name-handle="bottom-drawer__handler"
    prevent-deactivation
    :draggable="false"
    :handles="['tm']"
    :h="height"
    :min-height="scaledMinHeight"
    :max-height="scaledMaxHeight"
    :resizable="resizable"
  >
    <bottom-drawer-toggle-button
      :name="name"
      :collapsed="collapsed"
      @click="toggleBar"
    />
    <div class="bottom-drawer__wrapper">
      <slot />
    </div>
  </vue-draggable-resizable>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  Ref,
  ref,
  onMounted
} from 'vue'
import VueDraggableResizable from 'vue-draggable-resizable'

import { useGA, useTheme } from '@/composables'

import {BottomDrawerToggleButton} from './components/BottomDrawerToggleButton'
import { BottomDrawerProps } from './types'

/**
 * @Component BottomDrawer
 * ~ A collapsible drawer that can be placed at the bottom of an element.
 * ~ Defines a slot to hold items in.
 * @param {string} name The name of the bottom drawer (image carousel|video annotation),
 * used for the toggle button tooltip
 * @param {boolean} resizable If the bottom drawer it's resizable using
 * `vue-draggable-resizable` DnD feature
 * @param {number} initialHeight The initial height of the non-collapsed bottom-drawer
 * @param {number} maxHeight Max resizable height of the bottom-drawer
 */
export default defineComponent({
  name: 'BottomDrawer',
  components: {
    BottomDrawerToggleButton,
    VueDraggableResizable
  },
  props: {
    name: { type: String, default: 'bottom-bar' },
    resizable: { type: Boolean, default: false },
    initialHeight: { type: Number, default: 80 },
    minHeight: { type: Number, default: 56 },
    maxHeight: { type: Number, default: 250 }
  },
  setup (props: BottomDrawerProps, { emit }) {
    const theme = useTheme()
    const ga = useGA()
    const collapsed: Ref<boolean> = ref(false)
    const height: Ref<number> = ref(80)

    const scaledMinHeight = computed((): number => {
      return props.minHeight * theme.getCurrentScale()
    })

    const scaledMaxHeight = computed((): number => {
      return props.maxHeight * theme.getCurrentScale()
    })

    const openBar = (): void => {
      const newHeight = props.initialHeight - (props.initialHeight === 80 ? 24 : 0)
      height.value = newHeight * theme.getCurrentScale()
    }

    const toggleBar = (): void => {
      collapsed.value = !collapsed.value

      // if the height of the drawer is 2 and we open the drawer,
      // it should adjust the height to be resizable
      if (!collapsed.value && height.value <= 2) { openBar() }
      ga.event('workview', collapsed.value
        ? 'close_bottom_bar'
        : 'open_bottom_bar')
      
      emit('toggle', collapsed.value)
    }

    onMounted(() => {
      openBar()
    })

    return {
      collapsed,
      height,
      scaledMinHeight,
      scaledMaxHeight,
      openBar,
      toggleBar
    }
  }
})
</script>

<style lang="scss" scoped>
.bottom-drawer {
  @include row--distributed;
  width: 100% !important; // vue-draggable-resizable sets inline styles and we need to override it
  position: relative;
  bottom: 0;
  background-color: $colorGriteDark;
  z-index: 2;
  transition: height .2s ease-out;
  transform: none !important;
  border: none;
  border-top: 1px solid $colorBorderLight;

  &__wrapper {
    @include row;
    @include fullsize;
    height: 100%;
    width: 100%;
  }

  &__toggle {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: -15px;
    z-index: 2;
  }

  &:deep(.bottom-drawer__handler) {
    position: absolute;
    width: 100%;
    height: 2px;
    border: none;
    background: transparent;
    z-index: var(--workview-bottom-bar-handler-toggle);
    cursor: ns-resize;

    &:hover,
    &:active {
      background: $colorInteractivePrimaryDefault;
    }
  }

  &--collapsed {
    height: 0 !important;
  }
}
</style>
