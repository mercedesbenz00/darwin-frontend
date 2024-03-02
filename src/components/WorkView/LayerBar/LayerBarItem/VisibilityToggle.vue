<template>
  <button
    class="visibility-icon"
    :class="{ 'visibility-icon--visible': annotation.isVisible }"
    @click.stop="toggleAnnotation"
    @dblclick.stop
  >
    <icon-12-hide />
  </button>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { Icon12Hide } from '@/assets/icons/V2/12'
import { StageAnnotation } from '@/store/modules/workview/types'

@Component({
  name: 'visibility-toggle',
  components: { Icon12Hide }
})
export default class VisibilityToggle extends Vue {
  @Prop({ required: true })
  annotation!: StageAnnotation

  toggleAnnotation (): void {
    this.$store.commit('workview/TOGGLE_ANNOTATION_VISIBILITY', this.annotation)
  }
}
</script>

<style lang="scss" scoped>
.visibility-icon {
  padding: 0;
  @include row--center;
  background: transparent;

  &:hover, &:active {
    :deep(svg) path {
      fill: $colorInteractivePrimaryDefault;
      stroke: $colorInteractivePrimaryDefault;
    }
  }

  svg {
    color: $color90Black;
    width: 80%;
  }
}

.visibility-icon--visible {
  svg {
    fill: $colorAliceNight;
  }
}
</style>
