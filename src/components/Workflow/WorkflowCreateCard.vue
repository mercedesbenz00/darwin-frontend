<template>
  <component
    :is="tag"
    class="workflow-create-card"
  >
    <div class="workflow-create-card__upside">
      <div class="mock" />
      <div class="mock" />
      <div class="mock" />
    </div>
    <div class="workflow-create-card__details">
      <div class="workflow-create-card__details__row workflow-create-card__details__row__first">
        <div
          class="workflow-create-card__details__status"
        >
          <div class="mock" />
        </div>
      </div>
      <div class="workflow-create-card__details__row workflow-create-card__details__row__second">
        <div class="mock" />
      </div>
    </div>
    <div
      class="workflow-create-card__actions"
    >
      <custom-button
        color="primary"
        size="large"
        flair="rounded"
        style="width: 100%;"
        tag="router-link"
        :to="route"
      >
        <span class="workflow-create-card__actions__content">
          <span class="icon">
            <plus-icon style="width: auto;" />
          </span>
          <span class="label">
            Create Workflow
          </span>
        </span>
      </custom-button>
    </div>
    <div
      class="workflow-create-card__downside"
    >
      <div class="mock" />
      <div class="mock" />
      <div class="mock" />
      <div class="mock mock-progress" />
    </div>
  </component>
</template>

<script lang = "ts">
import { Component, Vue } from 'vue-property-decorator'
import { RawLocation } from 'vue-router'

import { PlusIcon } from '@/assets/icons/V1'
import { CustomButton } from '@/components/Common/Button/V2'

@Component({ name: 'workflow-create-card', components: { PlusIcon, CustomButton } })
export default class WorkflowCreateCard extends Vue {
  route: RawLocation = { path: '/workflows/new-workflow' }
  tag: string = 'div'
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.tooltip--workflow-card {
  &[x-placement^="top"] {
    margin-bottom: 7px;
  }
}
</style>

<style lang="scss" scoped>
.workflow-create-card {
  @include col;
  display: inline-flex;
  flex: 1 1 auto;
  min-width: 320px !important;
  padding: 10px;
  background: $colorWhite;
  border-radius: 12px;
  border: 1px solid $colorNeutralsLight300;
  box-shadow: $shadowLightXS;
  position: relative;
  cursor: pointer;

  .mock {
    background-color: $colorSurfaceElevate;
    border-radius: 8px;
  }

  &__upside {
    @include row;
    width: 100%;
    height: 100px;
    border-radius: 12px 12px 0 0;
    position: relative;
    gap: 2px;

    .mock {
      width: 33.33%;
      height: 100px;
      border-radius: 0;

      &:first-child {
        border-radius: 8px 0 0 8px;
      }

      &:last-child {
        border-radius: 0 8px 8px 0;
      }
    }
  }

  &__details {
    position: relative;
    @include typography(md, inter);
    align-items: center;
    padding: 8px 0 0;
    line-height: 20px;

    &__row {
      position: relative;

      &__first {
        .mock {
          width: 20%;
          height: 24px;
        }
      }

      &__second {
        padding-top: 8px;

        .mock {
          width: 100%;
          height: 24px;
        }
      }
    }
  }

  &__actions {
    @include row--center;
    padding: 8px 0 0;
    @include typography(md, inter);
    line-height: 20px;

    &__content {
    @include row--center;
      .icon {
        position: relative;
        @include col--center;
        height: 12px;
        max-width: 12px;
        margin-left: 4px;
      }

      .label {
        margin-left: 12px;
        text-transform: capitalize;
      }
    }
  }

  &__downside {
    @include row--wrap;
    justify-content: space-between;
    flex: 1;
    padding-top: 8px;
    position: relative;
    overflow: hidden;
    gap: 2px;

    .mock {
      width: calc(33.33% - 2px);
      height: 48px;

      &-progress {
        margin-top: 8px;
        width: 100%;
        height: 8px;
      }
    }
  }
}
</style>
