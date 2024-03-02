<template>
  <modal
    name="tracker-offline-modal"
    transition="pop-out"
    width="30%"
    :height="275 * $theme.getCurrentScale()"
    :classes="['tracker-offline-modal']"
    :click-to-close="false"
  >
    <div class="tracker-offline__content">
      <div class="tracker-offline__content__icon">
        <warning-icon class="tracker-offline__content__icon__warning" />
      </div>
      <div class="tracker-offline__content__title">
        Your connection was interrupted
      </div>
      <div class="tracker-offline__content__subtitle">
        We can't reach you. Please refresh to reconnect.
      </div>
      <custom-button
        class="tracker-offline__content__button"
        size="large"
        color="primary"
        flair="rounded"
        full-width
        @click="reload"
      >
        <span class="tracker-offline__content__button__label">
          Reconnect
        </span>
      </custom-button>
    </div>
  </modal>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { CustomButton } from '@/components/Common/Button/V2'
import { WarningIcon } from '@/components/WorkView/TopBar/assets/icons'
import { WorkviewTrackerStatus } from '@/store/modules/workviewTracker'
import { RootState } from '@/store/types'

@Component({ name: 'tracker-offline-modal', components: { WarningIcon, CustomButton } })
export default class TrackerOfflineModal extends Vue {
  @State((state: RootState) => state.workviewTracker.status)
  trackerStatus!: WorkviewTrackerStatus

  errorDurationTimer: ReturnType<typeof setTimeout> | null = null

  @Watch('trackerStatus', { immediate: true })
  onTrackerStatusChange (
    currentStatus: WorkviewTrackerStatus,
    prevStatus: WorkviewTrackerStatus
  ): void {
    if (currentStatus !== 'error') {
      if (this.errorDurationTimer) {
        clearTimeout(this.errorDurationTimer)
      }
      this.errorDurationTimer = null
      this.$modal.hide('tracker-offline-modal')
      return
    }

    if (prevStatus === 'error') { return }

    this.errorDurationTimer = setTimeout(() => {
      this.$modal.show('tracker-offline-modal')
    }, 10000)
  }

  reload (): void {
    window.location.reload()
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.tracker-offline-modal {
  overflow: visible;
}
</style>

<style lang="scss" scoped>
.tracker-offline {
  &__content {
    @include col--center;
    background: $colorWhite;
    gap: 8px;
    padding: 16px;
    border-radius: 12px;
    box-shadow: $effectShadowsLG;

    &__icon {
      @include row--center;
      align-items: center;
      height: 48px;
      width: 48px;
      margin-bottom: 8px;
      background-color: $colorStatusNegativeSurface;
      border-radius: 50%;

      &__warning {
        height: 18px;
        width: 18px;
      }
    }

    &__title {
      @include typography(lg-1, inter, 500);
      color: $colorContentDefault;
    }

    &__subtitle {
      @include typography(lg, inter, 300);
      color: $colorContentSecondary;
    }

    &__button {
      margin-top: 24px;

      &__label {
        @include typography(md-1, inter, 500);
      }
    }
  }
}
</style>
