<template>
  <toggle-button
    class="top-bar__toggle-annotations"
    :class="{ 'top-bar__toggle-annotations--on': on }"
    :on="on"
    @toggle="toggle"
  >
    <icon-mono-hide v-if="on" />
    <icon-mono-eye v-else />

    <template #tooltip>
      <b class="top-bar__toggle-annotations__tooltip">
        Toggle Annotations <span class="tooltip__hotkey">H</span>
      </b>
    </template>
  </toggle-button>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { IconMonoEye, IconMonoHide } from '@/assets/icons/V2/Mono'

import ToggleButton from './ToggleButton.vue'

@Component({
  name: 'annotation-toggle',
  components: { IconMonoEye, IconMonoHide, ToggleButton }
})
export default class AnnotationToggle extends Vue {
  @State(state => state.workview.renderAnnotations)
  on!: boolean

  toggle (): void {
    this.$store.commit('workview/TOGGLE_ANNOTATIONS')
  }
}
</script>

<style lang="scss" scoped>
.top-bar__toggle-annotations {
  :deep(svg) {
    pointer-events: none;
    width: 20px;

    path {
      fill: $colorContentTertiary;
      stroke: $colorContentTertiary;
    }
  }
}

.top-bar__toggle-annotations__tooltip {
  @include row;
  align-items: center;
}
</style>
