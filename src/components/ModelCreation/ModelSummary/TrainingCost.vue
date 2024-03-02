<template>
  <div class="cost">
    <div class="cost__label">
      Training Cost
    </div>
    <div class="cost__value">
      <span class="cost__value__amount">{{ cost }}</span>
      /minute
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { formatSubCredit, CREDIT_RATIO, COST_PER_MINUTE } from '@/utils'

@Component({ name: 'training-cost' })
export default class TrainingCost extends Vue {
  readonly cost = formatSubCredit(COST_PER_MINUTE / CREDIT_RATIO)
}
</script>

<style lang="scss" scoped>
.cost {
  display: grid;
  grid-template-rows: auto auto;

  @include typography(md-1, Mulish);
  color: $colorAliceNight;

  justify-content: end;
  justify-items: end;

  .cost__value {
    padding: 10px 0;
    font-size: 18px;

    .cost__value__amount {
      font-weight: bold;;
      font-size: 35px;
      color: $colorBlack;
    }
  }
}

</style>
