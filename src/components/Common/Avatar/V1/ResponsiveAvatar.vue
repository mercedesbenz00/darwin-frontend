<template>
  <div class="avatar">
    <img
      v-if="url"
      :key="url"
      v-lazy="url"
      class="avatar__icon"
    >
    <div
      v-else
      class="avatar__icon avatar__initials"
      :style="{ background: avatarColor }"
    >
      <svg viewBox="0 0 100 100">
        <text
          x="50%"
          y="49%"
          fill="currentColor"
          font-size="50"
          text-anchor="middle"
          dominant-baseline="central"
        >{{ initials }}</text>
      </svg>
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
import { Component, Vue, Prop } from 'vue-property-decorator'

import { getShortenedName, getColorHash } from '@/utils'

@Component({ name: 'responsive-avatar' })
export default class ResponsiveAvatar extends Vue {
  @Prop({ required: false, default: '' })
  id!: string

  @Prop({ required: true })
  name!: string

  @Prop({ required: false, default: null })
  url!: string | null

  get avatarColor () {
    return getColorHash(this.id + this.name.trim())
  }

  get initials () {
    return getShortenedName(this.name.trim())
  }
}
</script>

<style lang="scss" scoped>
.avatar {
  position: relative;
  display: grid;
  align-items: stretch;
  justify-content: stretch;
  height: 100%;
  width: 100%;

  @include typography(md-1, default, bold);
  text-transform: uppercase;
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
  height: 50%;
  width: 50%;
}

.avatar__icon,
.avatar__initials {
  height: 100%;
  width: 100%;
  border-radius: 50%;
  overflow: hidden;
  @include noSelect;

  display: grid;
  align-items: center;
  justify-content: center;
}

.avatar__initials svg {
  height: 100%;
  width: 100%;
}

.avatar__initials text {
  fill: $colorWhite;
}
</style>
