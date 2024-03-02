<template>
  <stage-template
    class="review"
    :class="{'review--rates': hasSampling}"
  >
    <template #header>
      <review-round-icon class="review__header__icon" />
      <stage-title
        :value="name"
        @change="updateName"
      />
      <move-handler v-if="movable" />
      <delete-button
        v-if="deletable"
        @click="$emit('delete')"
      />
      <sampling-rate
        v-if="hasSampling"
        class="review__base-sampling rates-asside"
        :value="baseSamplingRate"
        @change="updateBaseSamplingRate"
      />
    </template>
    <template #header-asside />
    <template #body>
      <div class="review__body rates-container">
        <div class="rates-row">
          <input-field
            v-model="search"
            placeholder="Search users"
          />
          <sampling-info
            v-if="hasSampling"
            class="review__search-row__info"
          />
        </div>
        <div class="review__body__list scroll">
          <div class="review__body__list__item rates-row scroll__row">
            <assignability-toggle
              :assignable-to="assignableTo"
              @change="setAssignableTo"
            />
            <sampling-rate
              v-if="hasSampling"
              class="review__user-sampling"
              :value="userSamplingRate"
              :disabled="manualAssignment"
              @change="updateUserSamplingRate"
            />
          </div>
          <div
            v-for="data of filteredSelectionData"
            :key="data.member.user_id"
            class="review__body__list__item rates-row scroll__row"
          >
            <annotator-score-popover :actor="data">
              <annotator-toggle
                :class="{ 'review__body__list__item__toggle--fade': !manualAssignment }"
                :member="data.member"
                :selected="data.selected"
                :sampling-rate="data.samplingRate"
                @select="toggleStageAssignee(data)"
              />
            </annotator-score-popover>
            <sampling-rate
              v-if="hasSampling"
              class="review__annotator-sampling"
              :value="data.samplingRate"
              :disabled="!(manualAssignment && data.selected)"
              @change="rate => updateAssigneeSamplingRate(data, rate)"
            />
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <check-box
        id="readonly"
        name="readonly"
        label="Read-only"
        :value="readonly"
        @change="toggleReadonly"
      />
      <info>
        In Read Only reviewers can mark errors, but cannot correct annotations
        or create new ones
      </info>
    </template>
  </stage-template>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import ReviewRoundIcon from '@/assets/icons/V1/reviewRound.svg?inline'
import DeleteButton from '@/components/Common/Button/V1/DeleteButton.vue'
import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import Info from '@/components/Common/Info.vue'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import MoveHandler from '@/components/Common/MoveHandler.vue'
import {
  AssigneeSamplingRate,
  assigneeSamplingRates,
  getDefaultStageTemplateName,
  searchByName,
  StageActor
} from '@/components/DatasetSettings/utils'
import { ReviewStageTemplatePayload } from '@/store/types'

import AnnotatorScorePopover from './AnnotatorScorePopover.vue'
import AnnotatorToggle from './AnnotatorToggle.vue'
import AssignabilityToggle from './AssignabilityToggle.vue'
import SamplingInfo from './SamplingInfo.vue'
import SamplingRate from './SamplingRate.vue'
import StageTemplate from './StageTemplate.vue'
import StageTitle from './StageTitle.vue'

@Component({
  name: 'review-stage',
  components: {
    AnnotatorScorePopover,
    AnnotatorToggle,
    AssignabilityToggle,
    CheckBox,
    DeleteButton,
    Info,
    InputField,
    MoveHandler,
    ReviewRoundIcon,
    SamplingInfo,
    SamplingRate,
    StageTemplate,
    StageTitle
  }
})
export default class ReviewStage extends Vue {
  /**
   * Determines if the component is deletable.
   * Should render a delete button in the top right, if enabled.
   */
  @Prop({ required: false, default: false, type: Boolean })
  deletable!: boolean

  /**
   * Determines if the component is movable.
   * Should render a move handle in the top right, if enabled.
   */
  @Prop({ required: false, default: true, type: Boolean })
  movable!: boolean

  /**
   * Determines if the component renders the sampling rates column
   */
  @Prop({ required: false, default: false, type: Boolean })
  hasSampling!: boolean

  @Prop({ required: true })
  stage!: ReviewStageTemplatePayload

  @Prop({ required: true, type: Array as () => StageActor[] })
  actors!: StageActor[]

  search: string = ''

  assignableTo: ReviewStageTemplatePayload['metadata']['assignable_to'] = 'anyone'
  assigneeSamplingRates: AssigneeSamplingRate[] = []
  baseSamplingRate: number = 1.0
  name: string = ''
  userSamplingRate: number = 1.0
  readonly: boolean = false

  get filteredSelectionData (): AssigneeSamplingRate[] {
    const { assigneeSamplingRates, search } = this
    return searchByName(assigneeSamplingRates, search)
  }

  @Watch('stage', { immediate: true })
  onStage (): void {
    const { stage, actors } = this
    this.assignableTo = stage.metadata.assignable_to
    const {
      base_sampling_rate: baseSamplingRate,
      user_sampling_rate: userSamplingRate
    } = stage.metadata
    this.baseSamplingRate = typeof baseSamplingRate === 'undefined' ? 1.0 : baseSamplingRate
    this.userSamplingRate = typeof userSamplingRate === 'undefined' ? 1.0 : userSamplingRate
    this.readonly = stage.metadata.readonly
    this.name = stage.name || getDefaultStageTemplateName(stage.type)
    this.assigneeSamplingRates = assigneeSamplingRates(stage, actors)
  }

  setAssignableTo (value: ReviewStageTemplatePayload['metadata']['assignable_to']): void {
    this.assignableTo = value
    if (value !== 'manual') {
      this.assigneeSamplingRates.forEach(a => { a.selected = false })
    }
    this.emitChange()
  }

  get manualAssignment (): boolean {
    return this.assignableTo === 'manual'
  }

  toggleStageAssignee (assignee: AssigneeSamplingRate): void {
    assignee.selected = !assignee.selected
    if (assignee.selected) { this.assignableTo = 'manual' }
    this.emitChange()
  }

  updateName (value: string): void {
    this.name = value
    this.emitChange()
  }

  updateBaseSamplingRate (rate: number): void {
    this.baseSamplingRate = rate
    this.emitChange()
  }

  updateUserSamplingRate (rate: number): void {
    this.userSamplingRate = rate
    this.emitChange()
  }

  updateAssigneeSamplingRate (assignee: AssigneeSamplingRate, rate: number): void {
    assignee.samplingRate = rate
    this.emitChange()
  }

  toggleReadonly (): void {
    this.readonly = !this.readonly
    this.emitChange()
  }

  emitChange (): void {
    const {
      stage,
      assignableTo,
      assigneeSamplingRates,
      baseSamplingRate,
      name,
      readonly,
      userSamplingRate
    } = this

    const updatedStage: ReviewStageTemplatePayload = {
      ...stage,
      metadata: {
        ...stage.metadata,
        assignable_to: assignableTo,
        base_sampling_rate: baseSamplingRate,
        user_sampling_rate: userSamplingRate,
        readonly
      },
      name,
      workflow_stage_template_assignees: assigneeSamplingRates
        .filter(r => r.selected)
        .map(r => ({ assignee_id: r.member.user_id, sampling_rate: r.samplingRate }))

    }

    this.$emit('change', updatedStage)
  }
}

</script>

<style lang="scss" scoped>
@import "./scroll.scss";
@import "./rates.scss";

.review {
  @include rates;
}

.review__header__icon {
  height: 20px;
  width: 20px;
}

.review__body {
  @include scroll(true);
}

.review__body__list__item {
  width: 100%;
  display: grid;

  :deep(.trigger) {
    // popover gives the trigger inline-block style, causing layout issues
    display: grid !important;
    justify-content: stretch;
  }
}

.review__body__list__item__toggle--fade {
  opacity: 0.5;
}

.review__search-row__info {
  margin-left: 5px;
}

</style>
