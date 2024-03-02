<template>
  <div
    v-if="overlayText"
    class="tool-option-overlay"
  >
    <span>{{ overlayText }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { RootState } from '@/store/types'

@Component({ name: 'tool-option-overlay' })
export default class ToolOptionOverlay extends Vue {
  @State((state: RootState) => state.ui.workviewOverlayText)
  overlayText!: string | null
}
</script>

<style lang="scss" scoped>
.tool-option-overlay {
  position: absolute;
  width: fit-content;
  left: 0;
  right: 0;
  bottom: 150px;
  margin: 0 auto;

  @include row--center;

  transition: all .2s ease-in-out;
  pointer-events: none;

  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(145, 169, 192, 0.5);
  border-radius: 5px;
  padding: 12px 20px;

  @include typography(md-1, default, bold);
  color: $colorWhite;
}
</style>
