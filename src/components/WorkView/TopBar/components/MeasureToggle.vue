<template>
  <toggle-button
    class="top-bar__toggle-measures"
    :class="{ 'top-bar__toggle-measures--on': on }"
    :on="on"
    @toggle="toggle"
  >
    <icon-mono-measurements />

    <template #tooltip>
      <b class="top-bar__toggle-measures__tooltip">
        Toggle Measurements <span class="tooltip__hotkey">{{ hotkeyInfo }}</span>
      </b>
    </template>
  </toggle-button>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { IconMonoMeasurements } from '@/assets/icons/V2/Mono'
import { RootState } from '@/store/types'
import { onMacOS } from '@/utils'

import ToggleButton from './ToggleButton.vue'

@Component({
  name: 'measures-toggle',
  components: { IconMonoMeasurements, ToggleButton }
})
export default class MeasuresToggle extends Vue {
  @State((state: RootState) => state.workview.renderMeasures)
  on!: boolean

  get hotkeyInfo (): string {
    return onMacOS() ? '⌘ + M' : 'CTRL + M'
  }

  toggle (): void {
    this.$store.commit('workview/TOGGLE_MEASURES')
  }
}
</script>

<style lang="scss" scoped>
.top-bar__toggle-measures {
  :deep(svg) {
    pointer-events: none;
    width: 20px;
    path {
      fill: $colorContentTertiary;
      stroke: $colorContentTertiary;
    }
  }
}

.top-bar__toggle-measures__tooltip {
  @include row;
  align-items: center;
}
</style>
