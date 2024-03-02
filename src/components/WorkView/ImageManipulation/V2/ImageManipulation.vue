<template>
  <div class="image-manipulation">
    <preset-manipulator />
    <expansion-panels class="image-manipulation__expansion">
      <expansion-panel
        id="annotation"
        active-by-default
      >
        <template #header>
          <div class="header">
            Annotation
          </div>
        </template>

        <template #content>
          <div class="content">
            <fill-opacity-manipulator />
            <border-opacity-manipulator />
          </div>
        </template>
      </expansion-panel>
    </expansion-panels>

    <expansion-panels class="image-manipulation__expansion">
      <expansion-panel
        id="color"
        active-by-default
      >
        <template #header>
          <div class="header">
            Color
          </div>
        </template>

        <template #content>
          <div class="content">
            <image-brightness-manipulator />
            <image-contrast-manipulator />
            <image-saturate-manipulator />
          </div>
        </template>
      </expansion-panel>
    </expansion-panels>

    <expansion-panels
      v-if="showWindowLevels"
      class="image-manipulation__expansion image-manipulation__expansion--windowing"
    >
      <expansion-panel
        id="level"
        active-by-default
      >
        <template #header>
          <div class="header">
            Windows Levels
          </div>
        </template>

        <template #content>
          <div class="content">
            <window-level-manipulator
              :auto-recompute="isSidebarOpen"
            />
          </div>
        </template>
      </expansion-panel>
    </expansion-panels>

    <expansion-panels class="image-manipulation__expansion">
      <expansion-panel
        id="filter"
        active-by-default
      >
        <template #header>
          <div class="header">
            Image Filters
          </div>
        </template>

        <template #content>
          <div class="content">
            <template v-if="showWindowLevels">
              <color-map-manipulator />
            </template>
            <invert-image-manipulator />
            <pixel-view-manipulator />
          </div>
        </template>
      </expansion-panel>
    </expansion-panels>
    <label
      class="image-manipulation__tip"
    >Note: Image manipulation metrics don’t change the source image properties.</label>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

import { ExpansionPanels, ExpansionPanel } from '@/components/Common/ExpansionPanels'
import { useActiveView } from '@/composables/useEditorV2'

import BorderOpacityManipulator from './Manipulators/BorderOpacityManipulator.vue'
import ColorMapManipulator from './Manipulators/ColorMapManipulator.vue'
import FillOpacityManipulator from './Manipulators/FillOpacityManipulator.vue'
import ImageBrightnessManipulator from './Manipulators/ImageBrightnessManipulator.vue'
import ImageContrastManipulator from './Manipulators/ImageContrastManipulator.vue'
import ImageSaturateManipulator from './Manipulators/ImageSaturateManipulator.vue'
import InvertImageManipulator from './Manipulators/InvertImageManipulator.vue'
import PixelViewManipulator from './Manipulators/PixelViewManipulator.vue'
import PresetManipulator from './Manipulators/PresetManipulator.vue'
import WindowLevelManipulator from './Manipulators/WindowLevelManipulator.vue'

export default defineComponent({
  name: 'ImageManipulation',
  components: {
    BorderOpacityManipulator,
    ColorMapManipulator,
    ExpansionPanels,
    ExpansionPanel,
    FillOpacityManipulator,
    ImageBrightnessManipulator,
    ImageContrastManipulator,
    ImageSaturateManipulator,
    InvertImageManipulator,
    PixelViewManipulator,
    PresetManipulator,
    WindowLevelManipulator
  },
  props: {
    isSidebarOpen: { required: true, type: Boolean, default: false }
  },
  setup () {
    const showWindowLevels = computed((): boolean => {
      const { fileManager } = useActiveView().value
      return !fileManager.isTiled
    })

    return {
      showWindowLevels
    }
  }
})
</script>

<style lang="scss" scoped>
.image-manipulation {
  padding: 20px 20px;
}

.image-manipulation__tip {
  @include typography(md, default);
  color: $colorNeutralsLight50;
}

.image-manipulation__expansion {
  margin-bottom: 8px;
}

.image-manipulation__expansion--windowing {
  :deep(.expansion-panel__content) {
    padding-bottom: 16px;
  }
}

:deep(.expansion-panel__header) {
  background-color: $colorAliceFade;
  padding: 8px 12px 8px 8px;
  margin: 0 -20px;
}

.header {
  font-size: 13px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: $defaultSpace / 2;
  padding-left: 8px;
}

.content {
  margin-top: 8px;
}
</style>
