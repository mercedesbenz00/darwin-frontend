<template>
  <div
    class="avatar"
    :class="{ 'avatar--initials': !url }"
  >
    <img
      v-if="url"
      ref="imgRef"
      :key="url"
      v-lazy="url"
      class="avatar__icon"
      :style="style"
    >
    <div
      v-else
      class="avatar__icon avatar__initials"
      :style="style"
    >
      {{ initials }}
    </div>
    <div
      v-if="$slots.badge"
      class="avatar__badge"
    >
      <slot name="badge" />
    </div>
  </div>
</template>

<script lang="ts">
import { VueReactiveListener } from 'vue-lazyload'
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import { getShortenedName, getColorHash } from '@/utils'

const RETRY_ATTEMPTS = 10
const RETRY_INTERVAL = 10000 // 10s

@Component({ name: 'avatar' })
export default class Avatar extends Vue {
  @Prop({ required: true })
  name!: string

  @Prop({ required: false })
  id!: string

  @Prop({ required: false, default: 35 })
  size!: number

  @Prop({ required: false, default: null })
  url!: string | null

  get avatarColor () {
    return getColorHash(this.id + this.name.trim())
  }

  get initials () {
    return getShortenedName(this.name.trim())
  }

  get style () {
    const scaledSize = this.size * this.$theme.getCurrentScale()
    return {
      ...(this.url ? {} : { background: this.avatarColor }),
      width: `${scaledSize}px`,
      height: `${scaledSize}px`,
      fontSize: `${scaledSize * 0.4}px`
    }
  }

  retryAttempts: number = RETRY_ATTEMPTS
  failedUrl: string = ''
  intervalHandler: ReturnType<typeof setTimeout> | null = null

  $refs!: {
    imgRef: HTMLImageElement
  }

  @Watch('url', { immediate: true })
  onUrlChange () {
    this.$Lazyload.$off('error', this.onLazyError)
    this.$Lazyload.$once('error', this.onLazyError)
    this.$Lazyload.$on('loaded', this.onLazyLoaded)
  }

  onLazyLoaded (listener: VueReactiveListener) {
    if (!this.intervalHandler) { return }
    if (this.url !== listener.src) { return }

    clearInterval(this.intervalHandler)
    this.intervalHandler = null
  }

  onLazyError (listener: VueReactiveListener) {
    if (this.failedUrl === listener.src) { return }
    this.failedUrl = listener.src
    this.retryAttempts = RETRY_ATTEMPTS

    this.intervalHandler = setInterval(() => {
      this.retryAttempts = this.retryAttempts - 1

      // reset the vue-lazyload's attempt to 0 so that it will try loading again
      listener.attempt = 0
      this.$Lazyload.lazyLoadHandler()

      if (this.retryAttempts <= 0 && this.intervalHandler) {
        clearInterval(this.intervalHandler)
      }
    }, RETRY_INTERVAL)
  }
}
</script>

<style lang="scss" scoped>
.avatar {
  display: grid;
  align-items: center;
  justify-content: center;
}

.avatar__icon,
.avatar__initials,
.avatar__badge {
  grid-row: 1;
  grid-column: 1;
}

.avatar__badge {
  justify-self: end;
  align-self: end;
  height: 8px;
  width: 8px;
}

.avatar__icon,
.avatar__initials {
  border-radius: 50%;
  overflow: hidden;
  @include noSelect;

  display: grid;
  align-items: center;
  justify-content: center;
}

.avatar__icon {
  object-fit: cover;
}

.avatar__initials {
  @include typography(md-1, default, bold);
  text-transform: uppercase;
  background: $colorAliceShade;
  color: $colorWhite;
}
</style>
