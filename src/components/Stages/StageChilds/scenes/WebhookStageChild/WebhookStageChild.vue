<template>
  <div class="webhook">
    <webhook-node
      class="webhook__node"
      :stage="stage"
      :scale="scale"
      variant="succeeded"
    />
    <webhook-node
      class="webhook__node"
      :stage="stage"
      :scale="scale"
      variant="failed"
    />
    <div class="webhook__content">
      <div
        v-if="hasValidUrl"
        class="webhook__content__url"
      >
        <icon-mono-link class="webhook__content__url__icon" />
        <span class="webhook__content__url__label">
          {{ url }}
        </span>
      </div>
      <div
        v-else
        class="webhook__content__no-url"
      >
        <custom-button
          class="webhook__content__no-url__button"
          size="medium"
          flair="rounded"
          variant="outline"
          full-width
        >
          Set URL
          <icon-mono-chevron-right class="webhook__content__no-url__button__icon" />
        </custom-button>
        <icon-mono-warn-inverted
          v-tooltip="warnTooltip"
          class="webhook__content__no-url__warn"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { IconMonoChevronRight, IconMonoLink, IconMonoWarnInverted } from '@/assets/icons/V2/Mono'
import { CustomButton } from '@/components/Common/Button/V2'
import WebhookNode from '@/components/Stages/StageChilds/scenes/WebhookStageChild/WebhookNode.vue'
import { V2WebhookStagePayload } from '@/store/types/V2WorkflowStagePayload'
import { validUrl } from '@/utils/regex'

export default defineComponent({
  name: 'WebhookStageChild',
  components: {
    WebhookNode,
    CustomButton,
    IconMonoChevronRight,
    IconMonoLink,
    IconMonoWarnInverted
  },
  props: {
    scale: { type: Number, required: true },
    stage: { required: true, type: Object as () => V2WebhookStagePayload }
  },
  setup (props) {
    const url = computed(() => {
      return props.stage.config.url
    })

    const hasValidUrl = computed((): boolean => {
      return !!url.value && validUrl(url.value)
    })

    const warnTooltip = computed(() => {
      return { content: `This stage need a ${!url.value ? '' : 'valid'} url` }
    })

    return {
      url,
      hasValidUrl,
      warnTooltip,
    }
  }
})
</script>

<style lang="scss" scoped>
.webhook {
  &__content {
    padding: 12px;

    &__url {
      @include row;

      &__icon {
        color: $colorContentSecondary;
      }

      &__label {
        max-width: calc(100% - 36px);
        margin-left: 4px;
        @include typography(md-1, inter, 500);
        @include ellipsis(1, md-1);
        color: $colorContentEmphasis;
      }
    }

    &__no-url {
      $size: 36px;
      padding-bottom: $size / 2;

      &__button {
        color: $colorContentDefault;

        &__icon {
          margin-left: 4px;
          color: $colorContentSecondary;
        }
      }

      &__warn {
        position: absolute;
        bottom: -#{$size / 2};
        left: calc(50% - #{$size / 2});
        height: $size;
        width: $size;
        padding: 8px;
        border-radius: 50%;
        background: $colorStatusNegative;
      }
    }
  }
}
</style>
