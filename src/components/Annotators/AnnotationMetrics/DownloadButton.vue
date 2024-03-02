<template>
  <button
    v-tooltip="downloadTooltip"
    type="button"
    class="download"
    :disabled="disabled"
    @click="onClick"
  >
    <download-icon />
  </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { DownloadIcon } from '@/assets/icons/V1'

@Component({ name: 'download-button', components: { DownloadIcon } })
export default class DownloadButton extends Vue {
  @Prop({ required: false, type: Boolean, default: false })
  disabled!: boolean

  get downloadTooltip () {
    if (!this.disabled) {
      return { content: 'Download' }
    }
    return { content: 'You don\'t have the permissions to download data' }
  }

  onClick () {
    this.$emit('click')
  }
}
</script>

<style lang="scss" scoped>
.download {
  border-radius: 50%;
  background: transparent;
  @include row;
  align-items: center;
  padding: 10px;

  transition: background-color .2s ease;

  &:disabled {
    opacity: .3;
  }
}

.download:not([disabled]):hover {
  background: $colorSecondaryLight2;
}

.download > * {
  width: 24px;
  height: 24px;
}
</style>
