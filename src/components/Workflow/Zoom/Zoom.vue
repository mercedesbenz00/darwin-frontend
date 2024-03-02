<template>
  <div class="zoom__container">
    <div
      class="zoom__wrapper zoom__wrapper--in"
      :class="{'zoom__wrapper--disabled': isMax }"
      @click.stop="$emit('inc')"
    >
      <icon-mono-plus />
    </div>
    <div
      class="zoom__wrapper zoom__wrapper--out"
      :class="{'zoom__wrapper--disabled': isMin }"
      @click.stop="$emit('dec')"
    >
      <icon-mono-minus />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { IconMonoMinus, IconMonoPlus } from '@/assets/icons/V2/Mono'

export default defineComponent({
  name: 'Zoom',
  components: {
    IconMonoMinus,
    IconMonoPlus
  },
  props: {
    isMax: { type: Boolean },
    isMin: { type: Boolean }
  }
})

</script>

<style lang="scss" scoped>
.zoom__container {
  position: absolute;
  top: 8px;
  left: 8px;

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(2, 31px);
  grid-row-gap: 1px;

  width: 32px;
  height: 65px;
  border-radius: 10px;

  padding: 1px;
  background: $colorNeutralsLight300;

  box-shadow: $shadowLightXS;

  z-index: var(--z-workflow-zoom);
}

.zoom__wrapper {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
  background: $colorNeutralsLightWhite;

  cursor: pointer;

  &--in {
    border-top-left-radius: 9px;
    border-top-right-radius: 9px;
  }

  &--out {
    border-bottom-left-radius: 9px;
    border-bottom-right-radius: 9px;
  }

  color: $colorContentSecondary;

  &:hover:not(.zoom__wrapper--disabled) {
    color: $colorContentDefault;
  }

  &--disabled {
    color: $colorContentDisabled;
    pointer-events: none;
  }
}
</style>
