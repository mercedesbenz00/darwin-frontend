<template>
  <div
    class="avatar"
    :class="{ 'avatar--initials': !url }"
  >
    <img
      v-if="url"
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
import { defineComponent, ref, computed, watch } from 'vue'
import { VueReactiveListener } from 'vue-lazyload'

import { useTheme, useLazyload } from '@/composables'
import { getShortenedName, getColorHash } from '@/utils'

const RETRY_ATTEMPTS = 10
const RETRY_INTERVAL = 10000 // 10s

export default defineComponent({
  name: 'Avatar',
  props: {
    name: { type: String, required: true },
    id: { type: [String, Number], default: '' },
    size: { default: 35, type: Number },
    url: { default: null, type: String }
  },
  setup (props) {
    const theme = useTheme()

    const avatarColor = computed(() => getColorHash(props.id?.toString() + props.name.trim()))
    const initials = computed(() => getShortenedName(props.name.trim()))

    const Lazyload = useLazyload()

    const style = computed(() => {
      const scaledSize = props.size * theme.getCurrentScale()
      return {
        ...(props.url ? {} : { background: avatarColor.value }),
        width: `${scaledSize}px`,
        height: `${scaledSize}px`,
        fontSize: `${scaledSize * 0.4}px`
      }
    })

    const retryAttempts = ref(RETRY_ATTEMPTS)
    const failedUrl = ref('')
    const intervalHandler = ref<ReturnType<typeof setTimeout> | null>(null)

    const onLazyLoaded = (listener: VueReactiveListener): void => {
      if (!intervalHandler.value) { return }
      if (props.url !== listener.src) { return }

      clearInterval(intervalHandler.value)
      intervalHandler.value = null
    }

    const onLazyError = (listener: VueReactiveListener): void => {
      if (failedUrl.value === listener.src) { return }
      failedUrl.value = listener.src
      retryAttempts.value = RETRY_ATTEMPTS

      intervalHandler.value = setInterval(() => {
        retryAttempts.value = retryAttempts.value - 1

        // reset the vue-lazyload's attempt to 0 so that it will try loading again
        listener.attempt = 0
        Lazyload.lazyLoadHandler()

        if (retryAttempts.value <= 0 && intervalHandler.value) {
          clearInterval(intervalHandler.value)
        }
      }, RETRY_INTERVAL)
    }

    watch(() => props.url, () => {
      Lazyload.$off('error', onLazyError)
      Lazyload.$once('error', onLazyError)
      Lazyload.$on('loaded', onLazyLoaded)
    }, { immediate: true })

    return {
      style,
      initials
    }
  }
})
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
