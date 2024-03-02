<template>
  <div class="copy-block">
    <label class="copy-block__label">{{ label }}</label>
    <div
      class="copy-block__input"
      :class="`copy-block__input--${contentClassName}`"
    >
      <p>{{ content }}</p>
      <button
        class="copy-block__icon"
        @click="onClick"
      >
        <icon-mono-copy />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { IconMonoCopy } from '@/assets/icons/V2/Mono'
import { copy as copyToClipboard } from '@/utils'

@Component({ name: 'copy-block', components: { IconMonoCopy } })
export default class CopyBlock extends Vue {
  @Prop({ required: true })
  content!: string

  @Prop({ default: '' })
  label!: string

  get contentClassName (): string {
    if (this.content && this.content.startsWith('https://')) {
      return 'url'
    }
    return 'default'
  }

  async onClick (): Promise<void> {
    try {
      await copyToClipboard(this.content)
    } catch (e: unknown) {
      const warning =
        "Couldn't copy content to clipboard. Please select the text and copy it manually."
      return this.$store.dispatch('toast/warning', { content: warning })
    }

    const notification = `${this.label} copied to clipboard`
    this.$store.dispatch('toast/notify', { content: notification })
  }
}
</script>

<style lang="scss" scoped>
.copy-block {
  @include col;
  margin-top: 8px;
}

.copy-block__label {
  margin-bottom: 4px;
  color: $colorContentSecondary;
  @include typography(md-1, inter);
}

.copy-block__input {
  display: flex;
  padding: 10px 8px;
  border-radius: 8px;
  @include typography(md-1, inter, 500);
  background: $colorSurfaceRaise;
  align-items: center;
  &>p {
    display: -webkit-box;
   -webkit-line-clamp: 3;
   -webkit-box-orient: vertical;
    white-space: normal;
  }
}
.copy-block__icon {
  margin-left: auto;
  cursor: pointer;
  flex-shrink: 0;

  position: relative;
  @include row;
  align-items: center;
  background: transparent;
  padding: 4px;
  border-radius: 6px;

  transition: background-color .2s ease;
  transition: box-shadow .2s ease;

  svg {
    width: 100%;
    height: 100%;
  }

  &:hover {
    background: $colorIconButtonHover;
  }
  &:active {
    background: $colorIconButtonPressed;
  }
}

.copy-block__input--default {
  color: $colorContentEmphasis;
}
.copy-block__input--url {
  color: $colorInteractivePrimaryDefault;
}
</style>
