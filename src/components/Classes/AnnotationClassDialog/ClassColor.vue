<template>
  <div class="annotation-input__color">
    <v-popover
      trigger="manual"
      popover-class="tooltip--white popover--colors"
      placement="right"
      :open.sync="open"
    >
      <div
        class="color-picker"
        :class="{ 'color-picker--none': color === 'auto' }"
        :style="{ background: color }"
        @click="open = true"
      >
        <select-color-icon
          v-if="color === 'auto'"
          class="color-picker__icon"
        />
      </div>
      <template slot="popover">
        <color-picker
          :colors="colors"
          @select="onSelectColor"
        />
      </template>
    </v-popover>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, Ref } from 'vue'

import ColorPicker from '@/components/Classes/ColorPicker/ColorPicker.vue'
import { annotationClassColors as v2AnnotationClassColors } from '@/utilsV2'

import SelectColorIcon from './assets/select-color.svg?inline'

export default defineComponent({
  name: 'ClassColor',
  components: { ColorPicker, SelectColorIcon },
  props: {
    color: { default: 'auto', type: String }
  },
  setup (props, { emit }) {
    const open: Ref<boolean> = ref(false)

    const colors = computed(() => {
      return v2AnnotationClassColors
    })

    const onSelectColor = (value: string): void => {
      emit('update:color', value)
      open.value = false
    }

    return {
      open,

      colors,
      onSelectColor
    }
  }
})
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style src="./assets/color-popover.scss" lang="scss"></style>

<style lang="scss" scoped>
$color-cell-size: 36px;

.annotation-input__color {
  width: $color-cell-size;
  height: $color-cell-size;

  .color-picker {
    width: $color-cell-size;
    height: $color-cell-size;
    border-radius: $border-radius-default;
    transition: all .1s ease;
    cursor: pointer;

    &:hover {
      transform: scale(1.1);
    }

    &--none {
      @include row--center;
      background: $colorAliceShade;
      box-shadow: inset 0px 2px 10px rgba(145, 169, 192, 0.3);
    }

    &__icon {
      width: 16px;
      object-fit: contain;
    }
  }
}
</style>
