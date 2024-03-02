<template>
  <div class="overlay">
    {{ text }}
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

/**
 * Used to style a div overlayed on top of workview center,
 * which renders the skipped/discarded/rejected/archived message.
 *
 * To maintain reusability between new and classic workflow, this accepts a text prop.
 *
 * TODO:
 *
 * Once classic worview is done, we should use selected stage instance
 * and dataset item from state, to infer what should be rendered.
 *
 * We should also pass styling to workflow.
 */
@Component({ name: 'skip-reason-overlay' })
export default class SkipReasonOverlay extends Vue {
  @Prop({ required: true, type: String })
  text!: string
}

</script>

<style lang="scss" scoped>
.overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 10px 20px;
  border-radius: 5px;
  border: 2px solid $colorWhite;
  @include typography(xl, default, bold);
  background: rgba(255, 40, 117, 0.5);
  color: $colorWhite;
}
</style>
