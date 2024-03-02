<template>
  <div class="clearbit-logo">
    <img
      v-if="logoUrl && !error"
      :src="logoUrl"
      class="clearbit-logo__img"
      @load="onLoad"
      @error="onError"
    >
    <slot v-else />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import { getClearbitLogo } from '@/utils/image'

/**
 * This component renders the company logo from company url
 * When image loading fails, it also provide fallback options with slots.
 * https://clearbit.com/logo
 */
@Component({ name: 'clearbit-logo' })
export default class ClearbitLogo extends Vue {
  @Prop({ default: null, type: String })
  companyUrl!: string | null

  get logoUrl () {
    return getClearbitLogo(this.companyUrl)
  }

  error: boolean = false

  @Watch('logoUrl')
  onClearbitSourceChange () {
    if (!this.logoUrl) {
      this.error = true
      this.$emit('error')
    } else {
      this.error = false
    }
  }

  onLoad () {
    this.error = false
    this.$emit('load', this.logoUrl)
  }

  onError () {
    this.error = true
    this.$emit('error')
  }
}
</script>

<style lang="scss" scoped>
.clearbit-logo {
  @include row--center;
}

.clearbit-logo__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  overflow: hidden;
}
</style>
