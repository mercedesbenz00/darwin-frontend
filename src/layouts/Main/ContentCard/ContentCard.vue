<template>
  <component
    :is="tag"
    class="content-card"
  >
    <div
      class="content-card__title"
    >
      <slot name="title" />
    </div>
    <div
      class="content-card__body"
    >
      <slot />
    </div>
  </component>
</template>

<script lang = "ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'content-card'
})
export default class ContentCard extends Vue {
  tag: 'div' = 'div'
}
</script>

<style lang="scss" scoped>
.content-card {
  @include col;
  @include fullsize;
  height: 100%;
  margin: 16px 16px 16px 0;
  border-radius: 12px !important;
  box-shadow: $shadowLightXS;
  border: 1px solid $colorBorderLight;
  overflow: hidden;

  &__title {
    @include typography(xxl, Inter, bold);
    color: $color90Black;
    padding: 0;
    background: $colorSurfaceDefault;
    border-bottom: 1px solid $colorBorderLight;
  }

  &__body {
    @include typography(xxl, Inter, bold);
    height: 100%;
    color: $color90Black;
    padding: 0;
    background: $colorSurfaceElevate;
    overflow-y: auto;
    overflow-x: hidden;
  }
}
</style>
