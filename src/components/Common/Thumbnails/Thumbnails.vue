<template>
  <div
    class="thumbnails__row"
    :class="`thumbnails__row--${variant}`"
  >
    <template
      v-for="(thumbnail, idx) in thumbnails"
    >
      <div
        v-if="thumbnail"
        :key="`thumbnail-${idx}`"
        :class="'thumbnails__row__img'"
      >
        <img
          v-lazy="thumbnail"
        >
      </div>
    </template>
    <span
      v-if="thumbnails.length === 0"
      class="thumbnails__row--empty"
    >
      No data inside
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { ThumbnailVariant } from '@/components/Common/Thumbnails/types'

@Component({ name: 'thumbnails' })
export default class Thumbnails extends Vue {
  @Prop({ type: Array, required: true })
  data!: string[]

  @Prop({ type: Number, default: 3 })
  max!: number

  @Prop({ type: String, default: ThumbnailVariant.SMALL })
  variant!: ThumbnailVariant

  get thumbnails (): string[] {
    if (!this.data || this.data.length === 0) { return [] }
    return this.data
      .slice()
      .splice(0, this.max)
  }
}
</script>

<style lang="scss" scoped>
.thumbnails__row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  gap: 2px;
  background-color: $colorSurfaceRaise;

  &--mini {
    gap: 1px;
    border-radius: 4px;

    &,
    .thumbnails__row {
      height: 28px;
    }
  }

  &--small {
    &,
    .thumbnails__row {
      height: 58px;
    }
  }

  &--big {
    &,
    .thumbnails__row {
      height: 72px;
    }
  }

  &__img {
    flex: 1 1 auto;
    height: 100%;

    & > img {
      display: block;
      object-fit: cover;

      &[lazy='loaded'] {
        opacity: 0;
        animation-name: fadein;
        animation-duration: .3s;
        animation-iteration-count: 1;
        animation-fill-mode: forwards;
        animation-direction: normal;
        animation-timing-function: ease-out;

        @keyframes fadein {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      }
    }
  }

  .thumbnails__row--empty {
    position: absolute;
    @include col;
    @include fullsize;
    align-items: center;
    justify-content: center;
    background: $colorSurfaceRaise;
    color: $colorContentSecondary;
    @include typography(md, default);
    border-radius: 8px;
    border-collapse: separate;
  }
}
</style>
