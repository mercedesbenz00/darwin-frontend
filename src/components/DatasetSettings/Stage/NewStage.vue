<template>
  <stage-template
    :deletable="false"
    :movable="false"
    class="stage-create"
  >
    <template #body>
      <label class="stage-create__label">+ ADD STAGE</label>
      <div class="stage-create__types">
        <round-drop-shadow-button
          v-tooltip="{ content: 'Add an Annotate stage' }"
          class="stage-create__type stage-create__type--annotate"
          @click="createAnnotateStage"
        >
          <annotate-round-icon />
        </round-drop-shadow-button>

        <round-drop-shadow-button
          v-tooltip="{ content: 'Add a Review stage' }"
          class="stage-create__type stage-create__type--review"
          @click="createReviewStage"
        >
          <review-round-icon />
        </round-drop-shadow-button>

        <round-drop-shadow-button
          v-if="modelStageEnabled"
          v-tooltip="{ content: 'Add a Model stage' }"
          class="stage-create__type stage-create__type--model"
          @click="createModelStage"
        >
          <model-round-icon />
        </round-drop-shadow-button>

        <round-drop-shadow-button
          v-if="codeStageEnabled"
          v-tooltip="{ content: 'Add a Code Stage' }"
          class="stage-create__type stage-create__type--code"
          @click="createCodeStage"
        >
          <code-round-icon />
        </round-drop-shadow-button>
        <round-drop-shadow-button
          v-tooltip="{ content: 'Add a Consensus Stage' }"
          class="stage-create__type stage-create__type--test"
          @click="createTestStageSet"
        >
          <test-round-icon />
          <upgrade-tfa-icon
            v-if="!blindStageEnabled"
            class="stage-create__type__upgrade"
          />
        </round-drop-shadow-button>
      </div>
    </template>
  </stage-template>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import AnnotateRoundIcon from '@/assets/icons/V1/annotateRound.svg?inline'
import CodeRoundIcon from '@/assets/icons/V1/codeRound.svg?inline'
import ModelRoundIcon from '@/assets/icons/V1/modelRound.svg?inline'
import ReviewRoundIcon from '@/assets/icons/V1/reviewRound.svg?inline'
import TestRoundIcon from '@/assets/icons/V1/testRound.svg?inline'
import UpgradeTfaIcon from '@/assets/icons/V1/upgrade-tfa.svg?inline'
import RoundDropShadowButton from '@/components/Common/Button/V1/RoundDropShadowButton.vue'
import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import StageTemplate from '@/components/DatasetSettings/Stage/StageTemplate.vue'
import { StageType } from '@/store/types'

@Component({
  name: 'new-stage',
  components: {
    AnnotateRoundIcon,
    CheckBox,
    CodeRoundIcon,
    ModelRoundIcon,
    ReviewRoundIcon,
    RoundDropShadowButton,
    StageTemplate,
    TestRoundIcon,
    UpgradeTfaIcon
  }
})
export default class NewStage extends Vue {
  createAnnotateStage (): void {
    this.emitCreate(StageType.Annotate)
  }

  createReviewStage (): void {
    this.emitCreate(StageType.Review)
  }

  createModelStage (): void {
    this.emitCreate(StageType.Model)
  }

  createCodeStage (): void {
    this.emitCreate(StageType.Code)
  }

  get blindStageEnabled (): boolean {
    return this.$featureEnabled('BLIND_STAGE')
  }

  createTestStageSet (): void {
    if (!this.blindStageEnabled) {
      this.$router.push({ query: { ...this.$route.query, settings: 'plans', upgrade: 'business' } })
      const content =
        'This feature is only available for business and enterprise teams. Upgrade to use it.'
      this.$store.dispatch('toast/notify', { content })
      return
    }

    this.emitCreate(StageType.Test)
  }

  emitCreate (type: StageType): void {
    this.$emit('create', type)
  }

  get modelStageEnabled (): boolean {
    return this.$featureEnabled('MODEL_STAGE')
  }

  get codeStageEnabled (): boolean {
    return this.$featureEnabled('CODE_STAGE')
  }
}
</script>

<style lang="scss" scoped>
.stage-create :deep(.stage__body) {
  display: grid;
  grid-template-rows: auto auto;
  row-gap: 20px;
  align-content: center
}

.stage-create__label {
  @include typography(lg-1, default, bold);
  color: $colorAliceNight;
  justify-self: center;
  text-align: center;
}

.stage-create__types {
  display: grid;

  grid-template-columns: auto auto;
  column-gap: 10px;
  row-gap: 10px;

  justify-content: center;
}

.stage-create__type {
  width: 40px;
  height: 40px;
  border: 2px solid $colorAliceShade;
  display: grid;
}

.stage-create__type > * {
  grid-area: 1 / 1 / 1 / 1
}

.stage-create__type__upgrade {
  transform: translate(30%, -30%) scale(2);
}
</style>
