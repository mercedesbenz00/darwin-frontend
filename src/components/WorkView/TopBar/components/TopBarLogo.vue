<template>
  <div class="top-bar__logo">
    <icon-button
      v-tooltip="tooltip"
      class="top-bar__logo__button"
      size="small"
      tag="router-link"
      exact
      :to="backUrl"
    >
      <img
        v-if="teamLogo"
        :src="teamLogo"
        class="top-bar__logo__button__img top-bar__logo__button__img--normal"
      >
      <logo-icon
        v-else
        class="top-bar__logo__button__img top-bar__logo__button__img--logo"
      />
      <back-icon
        class="top-bar__logo__button__img top-bar__logo__button__img--hover"
      />
    </icon-button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Location } from 'vue-router'
import { State } from 'vuex-class'

import { IconButton } from '@/components/Common/Button/V2'
import { LogoIcon, BackIcon } from '@/components/WorkView/TopBar/assets/icons'
import { WorkviewState } from '@/store/modules/workview/state'
import { RootState, TeamPayload } from '@/store/types'
import { TooltipOptions } from '@/types'
import { resolveWorkviewLocation } from '@/utils'

@Component({
  name: 'top-bar-logo',
  components: { IconButton, LogoIcon, BackIcon }
})
export default class TopBarLogo extends Vue {
  @State(state => state.team.currentTeam)
  currentTeam!: TeamPayload

  @State((state: RootState) => state.workview.dataset)
  dataset!: WorkviewState['dataset']

  @State((state: RootState) => state.workview.tutorialMode)
  tutorialMode!: boolean

  get tooltip (): TooltipOptions {
    return {
      content: '<b>Back</b>',
      placement: 'right',
      delay: { show: 300 }
    }
  }

  get teamLogo (): string {
    if (!this.currentTeam || !this.currentTeam.image) { return '' }
    return this.currentTeam.image.thumbnail_url || this.currentTeam.image.url
  }

  get backUrl (): Location {
    const { dataset, tutorialMode } = this
    if (!dataset) { return { path: '/' } }
    if (tutorialMode) { return { path: '/datasets' } }

    return resolveWorkviewLocation(this.$route, dataset)
  }
}
</script>

<style lang="scss" scoped>
$logoWidth: 44px;

.top-bar__logo {
  @include col--center;
  width: $logoWidth;
  height: $logoWidth;

  &__button {
    @include row--center;
    background-color: $colorSurfaceInverted;
    background-color: red;
    padding: 0;
    max-width: $logoWidth;
    max-height: $logoWidth;
    overflow: hidden;
    border-radius: 50%;
    cursor: pointer;

    &:hover:not(:disabled),
    &:active:not(:disabled) {
      .top-bar__logo__button__img {
        &--normal,
        &--logo {
          display: none;
        }

        &--hover {
          display: block;
        }
      }
    }

    .top-bar__logo__button__img {
      &--normal,
      &--logo {
        display: block;
      }

      &--logo,
      &--hover {
        border-radius: 100%;
      }

      &--normal {
        display: block;
        width: 32px;
        height: 32px;
        object-fit: cover;
        border-radius: 8px;
      }

      &--hover {
        display: none;
      }
    }
  }
}
</style>
