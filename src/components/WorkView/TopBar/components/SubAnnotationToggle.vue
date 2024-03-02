<template>
  <toggle-button
    class="top-bar__toggle-sub-annotations"
    :class="{ 'top-bar__toggle-sub-annotations--on': on }"
    :on="on"
    @toggle="toggle"
  >
    <icon-mono-centroid />

    <template #tooltip>
      <b class="top-bar__toggle-sub-annotations__tooltip">
        Toggle Sub Annotations <span class="tooltip__hotkey">SHIFT+H</span>
      </b>
    </template>
  </toggle-button>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { IconMonoCentroid } from '@/assets/icons/V2/Mono'

import ToggleButton from './ToggleButton.vue'

@Component({
  name: 'sub-annotation-toggle',
  components: { IconMonoCentroid, ToggleButton }
})
export default class SubAnnotationToggle extends Vue {
  @State(state => state.workview.renderSubAnnotations)
  on!: boolean

  toggle (): void {
    this.$store.commit('workview/TOGGLE_SUBANNOTATIONS')
  }
}
</script>

<style lang="scss" scoped>
.top-bar__toggle-sub-annotations {
  :deep(svg) {
    pointer-events: none;
    height: 15px;

    rect {
      stroke: $colorContentTertiary;
    }
  }
}

.top-bar__toggle-sub-annotations__tooltip {
  @include row;
  align-items: center;
}
</style>
