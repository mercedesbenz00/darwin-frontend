<template>
  <div class="products">
    <client-pane v-if="isClient" />
    <annotation-credits
      v-else
      @billing-error="$event => $emit('billing-error', $event)"
    />
    <credit-summary />
    <storage-summary />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { TeamPayload } from '@/store/modules/admin/types'
import { RootState } from '@/store/types'

import AnnotationCredits from './Product/AnnotationCredits/AnnotationCredits.vue'
import ClientPane from './Product/ClientPane.vue'
import CreditSummary from './Product/Usage/CreditSummary.vue'
import StorageSummary from './Product/Usage/StorageSummary.vue'

@Component({
  name: 'products-v3',
  components: {
    AnnotationCredits,
    ClientPane,
    CreditSummary,
    StorageSummary
  }
})
export default class ProductsV3 extends Vue {
  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload

  get isClient (): boolean {
    return this.currentTeam.managed_status === 'client'
  }
}
</script>

<style lang="scss" scoped>
.products {
  @include col;
  row-gap: 20px;
}
</style>
