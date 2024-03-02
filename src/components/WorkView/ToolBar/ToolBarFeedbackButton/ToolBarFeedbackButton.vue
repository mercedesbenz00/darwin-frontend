<template>
  <component
    :id="id"
    :is="tag"
    class="feedback-trigger-wrapper"
    :href="route"
    target="_blank"
  >
    <icon-button
      v-tooltip="tooltip"
      class="feedback__button"
      :class="{ clickable: !active }"
      size="small"
      flair="super-soft"
      :disabled="active"
      color="transparent"
    >
      <feedback-icon />
    </icon-button>
    <slot />
  </component>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { IconButton } from '@/components/Common/Button/V2'
import { BillingInfoPayload } from '@/store/modules/billing/types'
import { TooltipOptions } from '@/types'

import { FeedbackIcon } from './assets/icons'

/**
 * Used to render feedback button and associated popover form in the workview toolbar
 *
 * When the sidebar is minimized, it should render tooltip on hover
 */
@Component({
  name: 'tool-bar-feedback-button',
  components: { IconButton, FeedbackIcon }
})
export default class ToolBarFeedbackButton extends Vue {
  readonly route: string = 'https://v7-community.circle.so/'

  @State(state => state.billing.billingInfo)
  billingInfo!: BillingInfoPayload

  get active (): boolean {
    return (this.$intercom && this.$intercom.visible) || false
  }

  get showCommunitySupport (): boolean {
    return this.billingInfo?.freemium || false
  }

  get tag (): string {
    const { showCommunitySupport } = this
    if (showCommunitySupport) {
      return 'a'
    }
    return 'div'
  }

  get label (): string {
    const { showCommunitySupport } = this
    if (showCommunitySupport) {
      return 'Community Support'
    }
    return 'Support / Feedback'
  }

  get id (): string {
    const { showCommunitySupport } = this
    if (showCommunitySupport) {
      return 'feedback-trigger-disabled'
    }
    return 'feedback-trigger'
  }

  get tooltip (): TooltipOptions | undefined {
    if (this.active) { return undefined }

    return {
      content: this.label,
      placement: 'right',
      offset: 15 * this.$theme.getCurrentScale()
    }
  }
}
</script>

<style lang="scss" scoped>
.feedback-trigger-wrapper {
  min-height: 36px;
  min-width: 36px;
  @include row--center;
  align-items: center;
}
</style>
