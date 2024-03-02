<template>
  <div class="stages-container">
    <div class="stages">
      <div
        ref="selectionIndicator"
        class="stages__selection-indicator"
        :style="{ left: `${selectionIndicatorPosition}px`}"
      />
      <div
        ref="currentIndicator"
        class="stages__current-indicator"
        :style="{ left: `${currentIndicatorPosition}px`}"
      >
        <current-icon />
      </div>
      <div class="stages__list">
        <template v-for="(stage, index) in stagesByNumber">
          <div
            :key="stage.number"
            :ref="`stage-${stage.number}`"
            class="stage"
            :class="{
              'stage--multiple': stage.instances.length > 1,
              'stage--current' : stage.number === currentStage,
              'stage--future' : stage.number > currentStage,
            }"
          >
            <div
              v-for="instance in stage.instances"
              :key="instance.id"
              :ref="`instance-${instance.id}`"
              class="stage__instance-container"
              @transitionend="recomputeUI"
            >
              <stage-instance-with-assignment
                class="stage__instance"
                :instance="instance"
              />
            </div>
            <stage-template-with-assignment
              v-if="stage.instances.length === 0"
              :ref="`template-${stage.template.id}`"
              class="stage__template"
              :template="stage.template"
              @click="selectStageTemplate(stage.template)"
            />
          </div>
          <div
            v-if="index < stagesByNumber.length - 1"
            :key="stage.id"
            class="stage__next"
          >
            <next-icon />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

import NextIcon from '@/assets/icons/V1/next.svg?inline'
import { isDefaultAutoComplete } from '@/components/WorkView/utils'
import {
  DatasetItemPayload,
  DatasetPayload,
  WorkflowStageTemplatePayload,
  WorkflowTemplatePayload,
  WorkflowStagePayload
} from '@/store/types'

import StageInstanceWithAssignment from './StageInstanceWithAssignment.vue'
import StageTemplateWithAssignment from './StageTemplateWithAssignment.vue'
import CurrentIcon from './assets/current.svg?inline'

type StageByNumber = {
  number: number
  instances: WorkflowStagePayload[]
  template?: WorkflowStageTemplatePayload
}

type StageDimension = { number: number, left?: number, width?: number }
type InstanceDimension = { id: number, left?: number, width?: number }

@Component({
  name: 'stages',
  components: {
    CurrentIcon,
    NextIcon,
    StageInstanceWithAssignment,
    StageTemplateWithAssignment
  }
})
export default class Stages extends Vue {
  @State(state => state.workview.selectedDatasetItem)
  selectedDatasetItem!: DatasetItemPayload

  @State(state => state.workview.dataset)
  dataset!: DatasetPayload

  @State(state => state.workview.selectedStageTemplate)
  selectedStageTemplate!: WorkflowStageTemplatePayload | null

  @State(state => state.workview.selectedStageInstance)
  selectedStageInstance!: WorkflowStagePayload | null

  $refs!: Vue['$refs'] & {
    currentIndicator: HTMLDivElement | null
    selectionIndicator: HTMLDivElement | null
  }

  get selectionIndicatorPosition (): number | null {
    const { selectionIndicator: indicator } = this.$refs
    const offset = indicator ? indicator.offsetWidth / 2 : 0

    const byInstance = this.positionByInstance(this.selectedStageInstance)
    if (byInstance !== null) { return byInstance - offset }

    const byTemplate = this.positionByTemplate(this.selectedStageTemplate)
    if (byTemplate !== null) { return byTemplate - offset }

    // placed out of bounds to the left, so it's not visible
    // but remains reactive for when a stage is selected
    return -4
  }

  get currentIndicatorPosition (): number | null {
    const position = this.positionByStageNumber(this.currentStage)
    if (!position) { return null }

    const { currentIndicator: indicator } = this.$refs
    if (!indicator) { return position }

    return position - indicator.offsetWidth / 2
  }

  positionByInstance (instance: WorkflowStagePayload | null): number | null {
    if (!instance) { return null }
    const stage = this.stagesByNumber.find(s => s.instances.includes(instance))
    if (!stage) { return null }

    const stageDimension = this.stageDimensions.find(s => s.number === stage.number)
    if (!stageDimension || stageDimension.left === undefined) { return null }

    const instanceDimension = this.instanceDimensions.find(i => i.id === instance.id)
    if (
      !instanceDimension ||
      instanceDimension.left === undefined ||
      instanceDimension.width === undefined
    ) { return null }

    if (stage) {
      return (stageDimension.left + instanceDimension.left + instanceDimension.width / 2)
    }
    return null
  }

  positionByTemplate (template: WorkflowStageTemplatePayload | null): number | null {
    if (!template) { return null }
    return this.positionByStageNumber(template.stage_number)
  }

  positionByStageNumber (stageNumber: number | null): number | null {
    if (stageNumber === null) { return null }

    const stageDimension = this.stageDimensions.find(s => s.number === stageNumber)
    if (
      !stageDimension ||
      stageDimension.left === undefined ||
      stageDimension.width === undefined
    ) { return null }
    return (stageDimension.left + stageDimension.width / 2)
  }

  mounted (): void {
    this.recomputeUI()

    window.addEventListener('resize', this.recomputeUI)

    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('resize', this.recomputeUI)
    })
  }

  stageDimensions: StageDimension[] = []
  instanceDimensions: InstanceDimension[] = []

  hover: boolean = false

  @Watch('stagesByNumber')
  @Watch('hover')
  onStages (): void { this.$nextTick(() => this.recomputeUI()) }

  recomputeUI (): void {
    this.stageDimensions = this.stagesByNumber.map(s => {
      const el = this.getStageElement(s.number)
      return el
        ? { number: s.number, left: el.offsetLeft, width: el.offsetWidth }
        : { number: s.number }
    })

    this.instanceDimensions = this.stagesByNumber
      .flatMap(s => s.instances)
      .map(i => {
        const el = this.getInstanceElement(i)
        return el
          ? { id: i.id, left: el.offsetLeft, width: el.offsetWidth }
          : { id: i.id }
      })
  }

  getStageElement (stageNumber: number): HTMLElement | null {
    const stageRefs = this.$refs[`stage-${stageNumber}`] as Element[]
    if (!stageRefs) { return null }
    return stageRefs[0] as HTMLElement
  }

  getInstanceElement (instance: WorkflowStagePayload): HTMLElement | null {
    const refs = this.$refs[`instance-${instance.id}`] as Element[]
    if (!refs) { return null }
    const ref = refs[0] as HTMLElement
    return ref || null
  }

  get currentStage (): number | null {
    const { selectedDatasetItem: item } = this
    if (!item || !item.current_workflow) { return 1 }
    return item.current_workflow.current_stage_number
  }

  @Getter('defaultWorkflowTemplate', { namespace: 'workview' })
  getDefaultWorkflowTemplate!: (dataset: DatasetPayload) => WorkflowTemplatePayload | null

  get stagesByNumber (): StageByNumber[] {
    const { selectedDatasetItem: item } = this
    if (item && item.current_workflow && !isDefaultAutoComplete(item)) {
      return Object.entries(item.current_workflow.stages).map(entry => ({
        number: parseInt(entry[0]),
        instances: entry[1]
      }))
    }

    const template = this.getDefaultWorkflowTemplate(this.dataset)
    if (!template) { return [] }
    return template.workflow_stage_templates
      .map(template => ({ number: template.stage_number, instances: [], template }))
      .sort((a, b) => a.number - b.number)
  }
}
</script>

<style lang="scss" scoped>
.stages-container {
  @include row;
  align-items: center;
  justify-content: flex-end;
  width: fit-content;
  max-width: 300px;
  height: 100%;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 10px;
    z-index: 100;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 10px;
    z-index: 100;
  }
}

.stages {
  display: grid;
  justify-content: start;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
  overflow-x: auto;
  @include scrollbar;

  > * {
    grid-area: 1 / 1 / 2 / 2;
    display: grid;
    align-items: start;
  }
}

.stages__selection-indicator {
  position: absolute;
  width: 2px;
  background: $colorFeatherLight;
  height: 100%;
  transition: left ease .2s;
  z-index: 1;
}

.stages__current-indicator {
  align-self: start;
  position: absolute;
  top: 0;
  transition: left ease .2s;
  z-index: 4;
}

.stages__current-indicator__left,
.stages__current-indicator__right {
  width: 13px;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.stages__current-indicator__left::after,
.stages__current-indicator__right::after {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  content: '';
}

.stages__current-indicator__left::after {
  background: linear-gradient(270deg, #9BB5CC 0%, #788896 100%), $colorSecondaryLight;
  transform: translate(50%, -50%) rotate(45deg);

}

.stages__current-indicator__right::after {
  background: linear-gradient(90deg, #CFDEEB 0%, #A3C3E0 28.57%), #A3C3E0;
  transform: translate(-50%, -50%) rotate(-45deg);
}

.stages__list {
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  height: 100%;
  column-gap: 3px;
  z-index: 3;
  margin: 0 10px;
}

.stage {
  position: relative;
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  height: 100%;

  // shows any dropshadow on icons
  overflow: visible;

  &::before {
    content: '';
    position: absolute;
    background: $colorAliceShade;
    border-radius: 50%;
    height: 30px;
    width: 30px;
  }
}
.stage :deep(.status-button),
.stage :deep(.stage-instance__restart) {
  height: 30px;
  width: 30px;
}

.stage--future {
  :deep(.stage__instance),
  :deep(.stage__template) {
    .status-button {
      @include workflow-status-background-color(0.5);
      @include workflow-status-border-color(0.5);
    }
  }
}

.stage__instance-container {
  transition: margin-left 0.2s ease;
}

.stage__instance-container:not(:only-child):not(:first-child) {
  margin-left: -14px;
}

.stage:hover .stage__instance-container {
  margin-left: 0;
}

.stage__next {
  color: #91A9C0;
}
</style>
