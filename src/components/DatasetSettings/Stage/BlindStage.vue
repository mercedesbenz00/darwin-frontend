<template>
  <div class="blind">
    <div class="blind__annotate">
      <annotate-stage
        :has-sampling="false"
        :actors="actors"
        :stage="annotateStage"
        :deletable="true"
        @change="stage => $emit('change', stage)"
        @delete="stage => $emit('delete', stage)"
      />
      <div
        v-for="addon in parallelStages"
        :key="addon.number"
        class="blind__annotate__addon"
      >
        <annotate-round-icon class="blind__annotate__addon__icon" />
        <delete-button @click="removeParallelStage" />
      </div>
    </div>
    <div class="blind__chevron-add">
      <stage-spacer>
        <chevron-right-icon />
      </stage-spacer>
      <div
        class="blind__chevron-add__add-icon"
      >
        <span>+</span>
        <round-drop-shadow-button
          v-tooltip="{ content: 'Add a Parallel Stage' }"
          @click="addParallelStage"
        >
          <annotate-round-icon />
        </round-drop-shadow-button>
      </div>
    </div>
    <test-stage
      :stage="testStage"
      class="blind__test"
      @change="stage => $emit('change', stage)"
    />
    <stage-spacer class="blind__pass-line-container" />
    <stage-spacer class="blind__pass-container">
      <feather-light-pill class="blind__pass-container__pill">
        Pass
      </feather-light-pill>
    </stage-spacer>
    <stage-spacer class="blind__fail-line-container" />
    <stage-spacer class="blind__fail-container">
      <pink-pill class="blind__fail-container__pill">
        Fail
      </pink-pill>
    </stage-spacer>
    <review-stage
      class="blind__review"
      :actors="actors"
      :deletable="false"
      :has-sampling="false"
      :movable="false"
      :stage="reviewStage"
      @change="stage => $emit('change', stage)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import AnnotateRoundIcon from '@/assets/icons/V1/annotateRound.svg?inline'
import DeleteButton from '@/components/Common/Button/V1/DeleteButton.vue'
import RoundDropShadowButton from '@/components/Common/Button/V1/RoundDropShadowButton.vue'
import FeatherLightPill from '@/components/Common/Pill/FeatherLightPill.vue'
import PinkPill from '@/components/Common/Pill/PinkPill.vue'
import ChevronRightIcon from '@/components/DatasetSettings/assets/chevron-right.svg?inline'
import { StageActor } from '@/components/DatasetSettings/utils'
import {
  AnnotateStageTemplatePayload,
  StageType,
  TestStageTemplatePayload,
  WorkflowStageTemplatePayload
} from '@/store/types'

import AnnotateStage from './AnnotateStage.vue'
import ReviewStage from './ReviewStage.vue'
import StageSpacer from './StageSpacer.vue'
import TestStage from './TestStage.vue'

const containsExpectedTypes = (stages: WorkflowStageTemplatePayload[]): boolean => {
  return stages[0].type === StageType.Annotate &&
    stages[1].type === StageType.Test &&
    stages[2].type === StageType.Review
}

@Component({
  name: 'blind-stage',
  components: {
    AnnotateRoundIcon,
    AnnotateStage,
    ChevronRightIcon,
    DeleteButton,
    FeatherLightPill,
    PinkPill,
    ReviewStage,
    RoundDropShadowButton,
    StageSpacer,
    TestStage
  }
})
export default class BlindStage extends Vue {
  @Prop({
    required: true,
    type: Array as () => WorkflowStageTemplatePayload[],
    validator: (stages) => containsExpectedTypes(stages)
  })
  stages!: WorkflowStageTemplatePayload[]

  get annotateStage (): AnnotateStageTemplatePayload {
    const stage = this.stages[0]
    if (stage.type === StageType.Annotate) { return stage }
    throw new Error('First of a set of blind stages is not "annotate"')
  }

  get testStage (): TestStageTemplatePayload {
    const stage = this.stages[1]
    if (stage.type === StageType.Test) { return stage }
    throw new Error('Second of a set of blind stages is not "test"')
  }

  get reviewStage (): WorkflowStageTemplatePayload {
    const stage = this.stages[2]
    if (stage.type === StageType.Review) { return stage }
    throw new Error('Third of a set of blind stages is not "review"')
  }

  /**
   * Determines if the component is deletable.
   * Should render a delete button in the top right, if enabled.
   */
  @Prop({ required: false, default: false, type: Boolean })
  deletable!: boolean

  @Prop({ required: true, type: Array as () => StageActor[] })
  actors!: StageActor[]

  get parallelStages (): {number: number}[] {
    const count = this.annotateStage.metadata.parallel
    if (!count || count <= 1) { throw new Error('This is not a blind stage') }
    return Array.from(new Array(count - 1)).map((val, index) => ({ number: index }))
  }

  addParallelStage (): void {
    const updated = {
      ...this.annotateStage,
      metadata: {
        ...this.annotateStage.metadata,
        parallel: (this.annotateStage.metadata.parallel || 1) + 1
      }
    }

    this.$emit('change', updated)
  }

  removeParallelStage (): void {
    const updated = {
      ...this.annotateStage,
      metadata: {
        ...this.annotateStage.metadata,
        parallel: (this.annotateStage.metadata.parallel || 2) - 1
      }
    }

    this.$emit('change', updated)
  }
}
</script>

<style lang="scss" scoped>
@import "./scroll.scss";
$blindReviewStageHeight: calc(
  var(--stage-template-card-height) - 40px
);

.blind {
  display: grid;
  grid-template-rows: var(--stage-template-card-footer-height) 1fr;
  grid-template-areas: "annotate chevron test pass-line pass-line"
                       "annotate chevron test fail-line review";
  justify-content: start;
  column-gap: 4px;
}

.blind .stage {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.blind__annotate {
  grid-area: annotate;
  display: grid;
  grid-auto-flow: column;
}

.blind__annotate__addon {
  padding: 5px;
  border: 2px solid $colorAliceShadow;
  border-left: none;
  background: $colorAliceBlue;
}

.blind__annotate__addon:last-child {
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
}

.blind__annotate__addon__icon {
  height: 20px;
  width: 20px;
}

.blind__chevron-add {
  grid-area: chevron;
  display: grid;
  grid-template-rows: auto 1fr;
  justify-items: center;
}

.blind__chevron-add__add-icon {
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  column-gap: 4px;
}

.blind__chevron-add__add-icon span {
  font-weight: bold;
  color: $colorAliceNight;
}

.blind__chevron-add__add-icon button {
  height: 30px;
  width: 30px;
}

.blind__test {
  grid-area: test;
}

.blind__review {
  grid-area: review;
  height: $blindReviewStageHeight;
}

.blind__review :deep(.review__body) {
  @include scroll(true, $blindReviewStageHeight);
  align-self: end;
}

.blind__pass-container,
.blind__pass-line-container {
  grid-area: pass-line;
}

.blind__fail-container,
.blind__fail-line-container {
  grid-area: fail-line;
  width: 30px;
}

.blind__pass-container__pill,
.blind__fail-container__pill {
  align-self: center;
  justify-self: start;
  width: 30px;
}

.blind__pass-line-container::after,
.blind__fail-line-container::after {
  content: "";
  background:$colorAliceShadow;
  height: 2px;
  margin-left: -4px;
  margin-right: -4px;

  align-self: center;
  justify-self: stretch;
}

.blind__pass-line-container {
  margin-right: -10px;
}

</style>
