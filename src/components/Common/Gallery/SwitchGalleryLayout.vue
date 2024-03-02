<template>
  <div class="switch-layout">
    <icon-button @click="onViewMode(VIEW_MODE.CARD)">
      <card-mode-icon
        class="switch-layout__mode"
        :class="{'switch-layout__mode--active': value === VIEW_MODE.CARD}"
      />
    </icon-button>

    <icon-button @click="onViewMode(VIEW_MODE.LIST)">
      <list-mode-icon
        class="switch-layout__mode"
        :class="{'switch-layout__mode--active': value === VIEW_MODE.LIST}"
      />
    </icon-button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { CardModeIcon, ListModeIcon } from '@/assets/icons/V1'
import IconButton from '@/components/Common/Button/V1/IconButton.vue'

import { VIEW_MODE } from './types'

@Component({
  name: 'switch-gallery-layout',
  components: { CardModeIcon, IconButton, ListModeIcon }
})
export default class SwitchGalleryLayout extends Vue {
  @Prop({ required: true, default: VIEW_MODE.CARD })
  value!: VIEW_MODE

  VIEW_MODE = VIEW_MODE
  onViewMode (newViewMode: VIEW_MODE) {
    this.$emit('input', newViewMode)
    this.$emit('change', newViewMode)
  }
}
</script>

<style lang="scss" scoped>
.switch-layout {
  @include row;
  justify-content: flex-start;
  align-items: center;
}

.switch-layout__mode {
  width: 15px;
  height: 15px;
  cursor: pointer;
  color: $colorAliceNight;
}

.switch-layout__mode--active {
  color: $color90Black;
}
</style>
