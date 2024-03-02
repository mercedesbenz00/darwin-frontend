<template>
  <div
    ref="container"
    class="annotation-section"
  >
    <div class="annotation-section__labels">
      <label class="annotation-section__label">
        {{ title }}&nbsp;<i v-if="optional">(optional)</i>
      </label>
      <slot name="label" />
    </div>
    <slot />
    <div
      v-if="error"
      class="annotation-section__error"
    >
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({ name: 'annotation-class-section' })
export default class AnnotationClassSection extends Vue {
  @Prop({ required: true })
  title!: string

  @Prop({ type: Boolean, default: false })
  optional!: boolean

  @Prop({ required: false })
  error?: string

  $refs!: {
    container: HTMLDivElement
  }

  scrollTo () {
    this.$refs.container.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style lang="scss" scoped>
.annotation-section__labels {
  width: 100%;
  margin: 0 0 9px 0;
  @include row--distributed;
}

.annotation-section__label {
  @include typography(md-1, default, bold);
  color: $colorAliceNight;
  @include noSelect;

  i {
    font-style: italic;
  }
}

.annotation-section__error {
  margin-top: 5px;
  @include typography(sm, default, bold);
  color: $colorPink;
}
</style>
