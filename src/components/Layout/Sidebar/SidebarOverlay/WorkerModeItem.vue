<template>
  <div
    :class="{ 'worker-mode-item': true, 'worker-mode-item--enabled': enabled }"
    @click.stop="toggleWorkerMode"
  >
    <active-annotators-icon
      class="worker-mode-item__icon"
      v-if="enabled"
    />
    <annotators-icon
      class="worker-mode-item__icon"
      v-else
    />
    <div class="worker-mode-item__text">
      Worker Mode
    </div>
    <toggle :value="enabled" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { ActiveAnnotatorsIcon, AnnotatorsIcon } from '@/assets/icons/V1/sidebar'
import Toggle from '@/components/Common/Toggle/V1/Toggle.vue'
import { RootState } from '@/store/types'

@Component({
  name: 'worker-mode-item',
  components: { ActiveAnnotatorsIcon, AnnotatorsIcon, Toggle }
})
export default class WorkerModeItem extends Vue {
  @State((state: RootState) => state.ui.workerMode)
  readonly enabled!: boolean

  toggleWorkerMode (): void {
    this.$store.dispatch('ui/toggleWorkerMode')
  }
}
</script>

<style lang="scss" scoped>
.worker-mode-item {
  @include row;
  align-items: center;
  padding: 22px 16px;

  &__icon {
    width: 16px;
    height: 16px;
    margin-right: 8px;
    color: $colorAliceNight;
  }

  &__text {
    @include typography(md-1, headlines);
    flex: 1 0 0;
    margin-right: 8px;
    color: $colorSecondaryLight;
  }

  &--enabled &__text {
    color: $colorFeatherLight;
  }

}
</style>
