<template>
  <stage-template
    class="ai"
    :class="{'ai--first': firstStage}"
  >
    <template #header>
      <model-round-icon class="ai__header__icon" />
      <stage-title
        :value="name"
        @change="updateName"
      />
      <move-handler />
      <delete-button
        v-if="deletable"
        @click="onDelete"
      />
    </template>
    <template #body>
      <dropdown
        class="ai__body__session-dropdown"
        :clearable="false"
        :options="options"
        :value="selectedSessionOption"
        placeholder="Select a model"
        theme="dark"
        @input="updateSession"
      >
        <template #selected-option="{ data: { session } }">
          <running-session
            class="model-item__selected"
            :running-session="session"
          />
        </template>
        <template #option="{ data: { session } }">
          <running-session
            class="model-item__option"
            :running-session="session"
          />
        </template>
      </dropdown>
      <template v-if="selectedSessionOption">
        <div class="ai__body__classes">
          <training-class-item
            v-for="trainingClass in modelClasses"
            :key="trainingClass.id"
            :stage-template="stage"
            :training-class="trainingClass"
          />
        </div>
        <div class="ai__body__class-mapping">
          <div
            v-if="unmappedClassCount > 0"
            class="ai__body__class-mapping__unmapped"
          >
            <warning-icon class="ai__body__class-mapping__unmapped__icon" />
            <span v-if="unmappedClassCount === 1">
              {{ unmappedClassCount }} class is mapped to nothing!
            </span>
            <span
              v-else-if="unmappedClassCount > 1"
            >{{ unmappedClassCount }} classes are mapped to nothing!</span>
          </div>
          <positive-button
            class="ai__body__class-mapping__map-classes"
            @click="openMappingDialog"
          >
            Map Classes
          </positive-button>
        </div>
        <modal
          :name="dialogName"
          height="auto"
          :width="500"
        >
          <class-mapping
            :annotation-classes="datasetClasses"
            :running-session="session"
            :stage="stage"
            :stage-mapping="classMapping"
            @cancel="closeMappingDialog"
            @confirm="updateMapping"
          />
        </modal>
      </template>
    </template>
    <template
      v-if="firstStage"
      #footer
    >
      <auto-instantiate
        v-if="firstStage"
        :value="autoInstantiate"
        @change="updateAutoInstantiate"
      />
    </template>
  </stage-template>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import ModelRoundIcon from '@/assets/icons/V1/modelRound.svg?inline'
import WarningIcon from '@/assets/icons/V1/warning.svg?inline'
import DeleteButton from '@/components/Common/Button/V1/DeleteButton.vue'
import Dropdown from '@/components/Common/Dropdown/Dropdown.vue'
import { DropdownOption } from '@/components/Common/Dropdown/types'
import MoveHandler from '@/components/Common/MoveHandler.vue'
import ClassMapping from '@/components/DatasetSettings/ModelStage/ClassMapping.vue'
import StageTemplate from '@/components/DatasetSettings/Stage/StageTemplate.vue'
import StageTitle from '@/components/DatasetSettings/Stage/StageTitle.vue'
import {
  AnnotationClassPayload,
  RootState,
  RunningSessionPayload,
  WorkflowStageTemplatePayload,
  ModelStageTemplatePayload,
  DatasetPayload
} from '@/store/types'

import AutoInstantiate from './AutoInstantiate.vue'
import RunningSession from './RunningSession.vue'
import TrainingClassItem from './TrainingClassItem.vue'
import { MappedClass } from './types'
import { toStageClassMapping, automapClasses } from './utils'

@Component({
  name: 'model-stage',
  components: {
    AutoInstantiate,
    ClassMapping,
    DeleteButton,
    Dropdown,
    ModelRoundIcon,
    MoveHandler,
    RunningSession,
    StageTemplate,
    StageTitle,
    TrainingClassItem,
    WarningIcon
  }
})
export default class ModelStage extends Vue {
  @State((state: RootState) => state.aclass.classes)
  allClasses!: AnnotationClassPayload[]

  @Prop({ required: true })
  dataset!: DatasetPayload

  get datasetClasses (): AnnotationClassPayload[] {
    const { allClasses, dataset } = this
    return allClasses.filter(c => c.datasets.some(d => d.id === dataset.id))
  }

  @State(state => state.neuralModel.runningSessions)
  sessions!: RunningSessionPayload[]

  /**
   * Determines if the stage can be deleted from the workflow.
   *
   * Affects rendering of delete button.
   */
  @Prop({ required: true, type: Boolean })
  deletable!: boolean

  get options (): DropdownOption[] {
    return this.sessions.map(session => ({
      id: session.id,
      label: session.name,
      data: { session }
    }))
  }

  get selectedSessionOption (): DropdownOption | null {
    const { runningSessionId } = this

    return runningSessionId
      ? this.options.find(o => o.id === runningSessionId) || null
      : null
  }

  /**
   * Main source of data for the component.
   *
   * Either payload for a stage template from an existing workflow, or a freshly
   * initialized "blank" model stage template.
   *
   * Data for an existing stage will have the running session as well as class
   * mapping preselected.
   */
  @Prop({ required: true, type: Object as () => ModelStageTemplatePayload })
  stage!: ModelStageTemplatePayload

  name: string = ''
  autoInstantiate: boolean = false
  runningSessionId: null | string = null
  classMapping: Exclude<ModelStageTemplatePayload['metadata']['class_mapping'], undefined> = []

  @Watch('stage', { immediate: true })
  onStage (): void {
    this.name = this.stage.name || ''
    this.autoInstantiate = this.stage.metadata.auto_instantiate || false
    this.runningSessionId = this.stage.metadata.running_session_id || null
    this.classMapping = this.stage.metadata.class_mapping || []
  }

  updateName (value: string): void {
    this.name = value
    this.onChange()
  }

  get firstStage (): boolean {
    return this.stage.stage_number === 1
  }

  updateAutoInstantiate (): void {
    this.autoInstantiate = !this.autoInstantiate
    this.onChange()
  }

  updateSession (option: DropdownOption | null): void {
    if (option === null) {
      return this.deselectSession()
    }

    const { id: sessionId } = option
    const { datasetClasses } = this

    const session = this.sessions.find(s => s.id === sessionId)
    if (!session) { throw new Error('Invalid running session selected') }

    this.runningSessionId = sessionId as string

    this.classMapping =
      automapClasses(session.meta.classes, datasetClasses).map(toStageClassMapping)

    this.onChange()
  }

  private deselectSession (): void {
    this.runningSessionId = null
    this.classMapping = []

    this.onChange()
  }

  get session (): RunningSessionPayload | null {
    const { sessions, selectedSessionOption } = this
    return selectedSessionOption
      ? sessions.find(s => s.id === selectedSessionOption.id) || null
      : null
  }

  get modelClasses (): RunningSessionPayload['meta']['classes'] {
    const { session } = this
    return session ? session.meta.classes : []
  }

  get unmappedClassCount (): number {
    const { modelClasses, classMapping } = this
    const totalClasses = modelClasses.length
    const mappedClasses = classMapping
      .filter(m => !!m.annotation_class_id)
      .length

    return Math.max(totalClasses - mappedClasses, 0)
  }

  get dialogName (): string {
    return `mappingDialog-${this.stage.stage_number}`
  }

  openMappingDialog (): void {
    this.$modal.show(this.dialogName)
  }

  closeMappingDialog (): void {
    this.$modal.hide(this.dialogName)
  }

  updateMapping (mapping: MappedClass[]): void {
    this.classMapping = mapping.map(toStageClassMapping)

    this.onChange()
    this.closeMappingDialog()
  }

  // events

  onChange (): void {
    const newStage: WorkflowStageTemplatePayload = {
      ...this.stage,
      name: this.name,
      metadata: {
        ...this.stage.metadata,
        auto_instantiate: this.autoInstantiate,
        class_mapping: this.classMapping,
        running_session_id: this.runningSessionId || undefined
      }
    }

    /**
     * Emmitted when selected running session, or class mapping is changed by
     * the user.
     * @event change
     * @type {Event}
     */
    this.$emit('change', newStage)
  }

  onDelete (): void {
    /**
     * Passthrough delete event
     *
     * Emitted when user clicks the delete button
     *
     * @event delete
     * @type {Event}
     */
    this.$emit('delete')
  }
}
</script>

<style lang="scss" scoped>
.ai__header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  column-gap: 10px;

  align-items: center;
}

.ai__header__icon {
  height: 20px;
  width: 20px;
  color: $colorWhite;
  background: $colorModelPurple;
  border-radius: 50%;

  display: grid;
  align-items: center;
  justify-content: center;

  svg {
    height: 14px;
    width: 14px;
  }
}

.ai :deep(.stage__body) {
  padding: 5px;
  padding-bottom: 10px;
  display: grid;
  row-gap: 10px;
  align-content: start;
  justify-content: stretch;

  grid-template-rows: auto 1fr auto;

  // prevents contents from blowing up on overflow
  min-height: 0px;
}

.ai--first :deep(.stage__footer) {
  // if first in workflow, second row is "Auto On/Off" so template is different
  grid-template-columns: 1fr;

  .auto-instantiate {
    justify-content: space-between;
  }
}

.ai__body__classes {
  justify-items: start;
  @include scrollbar;
  overflow: auto;
}

.ai__body__class-mapping {
  display: grid;
  row-gap: 5px;
}

.ai__body__class-mapping__unmapped {
  @include typography(sm, Mulish, bold);
  color: $colorBlack;

  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 5px;
  justify-content: center;
  align-items: center;
  margin: 0 5px
}

.ai__body__class-mapping__unmapped__icon {
  color: $colorCrimsonLight;
}

.ai__body__class-mapping__map-classes {
  justify-self: stretch;
  margin: 0 5px;
}

.ai :deep(.v--modal-box.v--modal) {
  border-radius: 5px;
  overflow: visible;
}

.ai__body__session-dropdown .model-item__selected,
.ai__body__session-dropdown .model-item__option {
  @include ellipsis(1, md-1, 1.4);
  padding: 0;
}

.ai__body__session-dropdown :deep(.vs__selected-options),
.ai__body__session-dropdown :deep(.vs__selected) {
  padding-left: 0
}

.ai__body__session-dropdown :deep(.vs__selected) {
  margin-left: 0
}

.ai__body__session-dropdown :deep(.vs__dropdown-option) {
  padding-top: 0;
  padding-bottom: 0;
  padding-left: 0;
}
</style>
