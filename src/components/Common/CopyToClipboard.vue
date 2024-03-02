<template>
  <button
    class="copy"
    @click="copyToClipboard"
  >
    <img
      src="/static/imgs/clipboard.svg"
      :alt="title"
      :title="title"
    >
  </button>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { copy as copyToClipboard } from '@/utils'

@Component({ name: 'copy-to-clipboard' })
export default class CopyToClipboard extends Vue {
  @Prop({ required: false, default: 'Copy to clipboard', type: String })
  title!: string

  @Prop({ required: true, type: String })
  value!: string

  async copyToClipboard (): Promise<void> {
    if (!this.value) { return }

    try {
      await copyToClipboard(this.value)
    } catch (e: unknown) {
      const warning =
        "Couldn't copy content to clipboard. Please select the text and copy it manually."
      return this.$store.dispatch('toast/warning', { content: warning })
    }

    const notification = 'Copied content to clipboard.'
    this.$store.dispatch('toast/notify', { content: notification })
  }
}
</script>

<style lang="scss" scoped>
.copy {
  background: transparent;
}
</style>
