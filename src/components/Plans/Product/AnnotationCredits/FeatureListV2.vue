<template>
  <ul class="feature-list">
    <li
      v-for="(feature, index) of features"
      :key="index"
      class="feature-list__feature"
    >
      <div class="feature-list__feature__label">
        <bullet-on-icon
          v-if="feature.enabled"
          class="feature-list__feature__bullet"
        />
        <bullet-off-icon
          v-else
          class="feature-list__feature__bullet"
        />
        <span>{{ feature.label }}</span>
      </div>
      <div
        v-if="feature.or"
        class="feature-list__feature__or"
      >
        OR
      </div>
    </li>
  </ul>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { PlanFeature } from '@/components/Plans/Product/utils'

import BulletOffIcon from './assets/bullet_off.svg?inline'
import BulletOnIcon from './assets/bullet_on.svg?inline'

@Component({
  name: 'feature-list',
  components: { BulletOffIcon, BulletOnIcon }
})
export default class FeatureListV2 extends Vue {
  @Prop({ required: true })
  features!: PlanFeature[]
}
</script>

<style lang="scss" scoped>
.feature-list {
  list-style-type: none;
  padding: 0;
}

.feature-list__feature {
  @include typography(md-1, headlines, normal);
  min-height: 30px;
  color: $color90Black;
}

.feature-list__feature__label {
  @include row;
  align-items: center;
  height: 20px;
}

.feature-list__feature__bullet {
  margin-right: 3px;
}

.feature-list__feature__or {
  width: fit-content;
  @include typography(xs, default, bold);
  color: $colorAliceNight;
  padding: 0 5px;
  margin: 3px 0 3px 35px;
  background: $colorAliceShadow;
  border: 1px solid $colorAliceNight;
  border-radius: 5px;
}
</style>
