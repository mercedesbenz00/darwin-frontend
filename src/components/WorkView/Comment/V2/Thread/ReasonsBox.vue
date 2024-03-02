<template>
  <div>
    <h4 class="title">
      Reason
    </h4>
    <ul class="reasons">
      <ReasonItem />
      <ReasonItem />
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import ReasonItem from './ReasonItem.vue'

export default defineComponent({
  name: 'ReasonsBox',
  components: { ReasonItem }
})
</script>

<style lang="scss" scoped>
@import '@/uiKit/assets/index.scss';

.title {
  @include typographyRegularBody25;
  color: $colorNeutralsLight500;
}

.reasons {
  display: flex;
  justify-content: start;
  flex-wrap: wrap;
  margin: 0;
  padding: 0;
  margin-top: $spacing-3;
  gap: $spacing-2;

  :deep(li) {
    list-style: none;
  }
}
</style>
