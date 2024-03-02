<template>
  <div
    class="template-card"
    :class="{
      'template-card--selected': selected,
    }"
    @click="$emit('click', id)"
  >
    <div class="template-card__image">
      <img
        src="/static/imgs/default-workflow-template.svg"
      >
    </div>
    <div class="template-card__title">
      <header-3>{{ name }}</header-3>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent
} from 'vue'

import Header3 from '@/components/Common/Header3.vue'

/**
 * @Component Rendering a workflow template card that could be selected
 */
export default defineComponent({
  name: 'TemplateCard',
  components: {
    Header3
  },
  props: {
    name: {
      type: String,
      required: true
    },
    selected: {
      type: Boolean,
      required: false
    },
    id: {
      type: Number,
      required: true
    }
  }
})
</script>

<style lang="scss" scoped>
.template-card {
  display: inline-block;
  gap: 20px;
  border: 2px solid $colorBorderLight;
  border-radius: 12px;
  cursor: pointer;

  &--selected {
    border-color: $colorInteractivePrimaryDefault;
  }
  &__image {
    padding: 20px;
    display: flex;
    justify-content: center;
  }

  &__title > h3 {
    padding: 20px;
    font-weight: 500 !important;
    color: $colorContentDefault;
  }

  &__title {

    &::before {
      content: '';
      display: block;
      width: 100%;
      border-bottom: 1px solid $colorAliceNight;
    }
  }
}
</style>
