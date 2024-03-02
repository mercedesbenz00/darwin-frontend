<template>
  <info>
    If active, your (partner) team will be billed for the invited team's usage of
    neural network model training and inference. Ensure you have included these costs in
    your relationship, or have the means to bill for them. If un-checked, te team will not
    be able to use neural networks until they enter their billing details.
  </info>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Info from '@/components/Common/Info.vue'

export default defineComponent({ name: 'ClientInviteInfo', components: { Info } })
</script>
