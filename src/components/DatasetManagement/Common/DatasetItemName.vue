<template>
  <div
    v-tooltip.bottom="'Copy Filename'"
    class="dataset-item-name"
    @click.stop.prevent="copyToClipboard"
  >
    <p class="dataset-item-name__label">
      {{ name }}
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { copy as copyToClipboard } from '@/utils'

@Component({ name: 'dataset-title' })
export default class DatasetTitle extends Vue {
  @Prop({ required: true })
  name!: string

  async copyToClipboard (): Promise<void> {
    if (!this.name) { return }

    try {
      await copyToClipboard(this.name)
    } catch (e: unknown) {
      const warning =
        "Couldn't copy Filename to clipboard. Please select the text and copy it manually."
      return this.$toast.warning({
        duration: 1500,
        meta: {
          title: warning
        }
      })
    }

    this.$toast.info({
      duration: 1500,
      meta: {
        title: 'Filename copied to clipboard.'
      }
    })
  }
}
</script>
