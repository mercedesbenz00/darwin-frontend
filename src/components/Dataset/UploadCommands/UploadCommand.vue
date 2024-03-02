<template>
  <div class="upload-command">
    <label class="upload-command__label">{{ label }}</label>
    <div
      class="upload-command__command"
      @click="onClick"
    >
      $&nbsp;{{ command }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { copy as copyToClipboard } from '@/utils'

@Component({ name: 'upload-command' })
export default class UploadCommand extends Vue {
  @Prop({ required: true })
  data!: { command: string, label: string }

  get command (): string {
    return this.data.command
  }

  get label (): string {
    return this.data.label
  }

  async onClick (): Promise<void> {
    try {
      await copyToClipboard(this.command)
    } catch (e: unknown) {
      const warning =
        "Couldn't copy content to clipboard. Please select the text and copy it manually."
      return this.$store.dispatch('toast/warning', { content: warning })
    }

    const notification = 'Command copied to clipboard'
    this.$store.dispatch('toast/notify', { content: notification })
  }
}
</script>

<style lang="scss" scoped>
.upload-command {
  @include col;
}

.upload-command__label {
  margin-bottom: 7px;
  color: $colorAliceNight;
  @include typography(md-1);
}

.upload-command__command {
  padding: 7px 10px;
  color: $color90Black;
  @include typography(md);
  cursor: pointer;
  background: $colorAliceShade;
}
</style>
