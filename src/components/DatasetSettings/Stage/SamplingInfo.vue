<template>
  <info class="info">
    <div class="info__popover">
      <p>Percentage chance of being picked for the next stage (rather than skipping it).</p>
      <p>Stage % affects all images, while User % affects images assigned to that user.</p>
      <p>
        NOTE: These two % multiply together, so if a Stage is at 50%, and User1
        is at 50%, there is a 25% chance User1's images will be picked for the
        upcoming stage.
      </p>
    </div>
  </info>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import Info from '@/components/Common/Info.vue'

@Component({ name: 'sampling-info', components: { Info } })
export default class SamplingInfo extends Vue { }
</script>

<style lang="scss" scoped>
.info__popover {
  max-width: 18rem;
  text-align: center;
  line-height: 150%;
  padding: .5rem;
}
</style>
