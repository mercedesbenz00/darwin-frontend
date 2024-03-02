<template>
  <div class="edit-plan-teaser">
    <div class="edit-plan-teaser__title">
      {{ amount > 0 ? planName : 'Cancel Plan' }}
    </div>
    <div class="edit-plan-teaser__icon-wrapper">
      <lottie-animation
        :path="cancelPlanLottie"
        class="edit-plan-teaser__icon"
        :class="{ 'edit-plan-teaser__icon--active': amount === 0 }"
      />
      <lottie-animation
        v-for="item of lottieFiles"
        :key="item.plan"
        :path="item.lottiePath"
        class="edit-plan-teaser__icon"
        :class="{ 'edit-plan-teaser__icon--active': amount > 0 && item.plan === plan }"
      />
    </div>
  </div>
</template>

<script lang="ts">
import LottieAnimation from 'lottie-vuejs/src/LottieAnimation.vue'
import { Component, Prop, Vue } from 'vue-property-decorator'

import { resolveDisplayPlanName, SubscriptionPlanName } from '@/components/Plans/Product/utils'

@Component({
  name: 'edit-plan-teaser',
  components: { LottieAnimation }
})
export default class AnnotationCredits extends Vue {
  @Prop({ required: true, type: Number })
  amount!: number

  @Prop({ required: true })
  plan!: SubscriptionPlanName

  get planName () {
    return resolveDisplayPlanName(this.plan)
  }

  get cancelPlanLottie () {
    return 'static/imgs/lotties/plans/cancel-plan.json'
  }

  get lottieFiles () {
    return ['freemium', 'team', 'business', 'enterprise'].map(plan => ({
      plan,
      lottiePath: `static/imgs/lotties/plans/${plan}.json`
    }))
  }
}
</script>

<style lang="scss" scoped>
.edit-plan-teaser {
  width: 40%;
  @include col;
  align-items: center;
  padding: 10px 42px 0 0;
}

.edit-plan-teaser__title {
  @include typography(xxl, default, bold);
  text-align: center;
  color: $color90Black;
  text-transform: capitalize;
}

.edit-plan-teaser__icon-wrapper {
  flex: 1;
  width: 100%;
  @include row--center;
  position: relative;
}

.edit-plan-teaser__icon {
  position: absolute;
  opacity: 0;

  &--active {
    opacity: 1;
  }
}

img.edit-plan-teaser__icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
