<template>
  <div class="background">
    <slot />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({})
</script>

<style lang="scss" scoped>
.background {
  position: absolute;
  @include fullsize;
  background: $colorSecondaryLight2;
}

.auth.header {
  @include row--distributed;
  padding: 15px;
  position: relative;
}

.logins {
  @include row--center;
}

.logins__description {
  @include typography(md, default);
  line-height: 18px;

  text-align: center;
  color: $colorSecondaryLight;
  z-index: 999;
}

.logins__link {
  @include typography(md, headlines, bold);
  margin-left: 10px;
  letter-spacing: 0.06em;
  color: $colorPrimaryDark;
  text-transform: uppercase;
  z-index: 999;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.center__content {
  @include col--center;
  @include fullsize;
  position: absolute;
}
</style>
