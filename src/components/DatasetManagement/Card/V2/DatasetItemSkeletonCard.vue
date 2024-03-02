<template>
  <card
    class="skeleton-card"
    :disable-hover="true"
  >
    <template #card-thumbnail>
      <div class="skeleton-card__thumbnail" />
    </template>
    <template #details>
      <div class="skeleton-card__info">
        <div class="skeleton-card__info--date" />
        <div class="skeleton-card__info--seq" />
      </div>
      <div
        class="skeleton-card__title"
      />
    </template>
  </card>
</template>

<script lang="ts">
import {
  defineComponent
} from 'vue'

import Card from './Card.vue'
/**
 * Used to render dataset items in dataset management.
 *
 * Used when gallery is in card mode.
 */
export default defineComponent({
  name: 'DatasetItemSkeletonCard',
  components: { Card }
})
</script>

<style lang="scss" scoped>
.skeleton-card {
  &__info {
    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;
    height: auto;

    & > p {
      transition: color 150ms ease;
      margin-top: 2px;

      @include typography(sm, inter, 500);
      color: $colorNeutralsLight500;
    }
  }

  .skeleton-card__info {
    width: 60px;
    height: 20px;
  }

  .skeleton-card__thumbnail {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    background: linear-gradient(270deg, #F9FAFA 0.13%, #EEEFF1 100%);
  }
  .skeleton-card__title {
    height: 12px;
    width: 50%;
  }
  .skeleton-card__info--date,
  .skeleton-card__info--seq,
  .skeleton-card__title {
    background: linear-gradient(270deg, #F9FAFA 0.13%, #EEEFF1 100%);
  }
  .skeleton-card__info--date {
    width: 40px;
    height: 8px;
  }
}
</style>
