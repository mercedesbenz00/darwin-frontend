<template>
  <div
    v-if="templates.length > 1"
    class="template-selection"
  >
    <label class="template-selection__label">Architecture</label>
    <dropdown
      :options="dropdownOptions"
      :value="selectedOptionId"
      @change="setSelectedTemplate"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import Dropdown from '@/components/Common/Dropdown/LegacyDropdown.vue'
import { LegacyDropdownOption } from '@/components/Common/Dropdown/types'
import { ModelDevice } from '@/store/modules/neuralModel/types'
import { ModelType, ModelTemplatePayload } from '@/store/types'

@Component({
  name: 'template-selection',
  components: { Dropdown }
})
export default class TemplateSelection extends Vue {
  @State(state => state.neuralModel.newModelType)
  type!: ModelType

  @State(state => state.neuralModel.modelTemplates)
  allTemplates!: ModelTemplatePayload[]

  get templates (): ModelTemplatePayload[] {
    const { type } = this
    return this.allTemplates
      .filter(t => t.devices.includes(ModelDevice.GPU) && t.type === type)
  }

  get dropdownOptions (): LegacyDropdownOption[] {
    return this.templates.map(t => ({
      id: t.id,
      text: t.name
    }))
  }

  @State(state => state.neuralModel.newModelTemplate)
  selectedTemplate!: ModelTemplatePayload | null

  get selectedOptionId (): string | null {
    const { selectedTemplate } = this
    return selectedTemplate ? selectedTemplate.id : null
  }

  setSelectedTemplate (id: string): void {
    const template = this.templates.find(t => t.id === id) || null
    this.$store.commit('neuralModel/SET_NEW_MODEL_TEMPLATE', template)
  }

  mounted (): void {
    this.preselectTemplate()
  }

  @Watch('templates')
  onTemplates (): void {
    this.preselectTemplate()
  }

  /**
   * Preselets first of available templates, if not already selected
   */
  preselectTemplate (): void {
    const { templates, selectedTemplate } = this
    if (templates.length === 0) { return }
    if (selectedTemplate) { return }
    this.$store.commit('neuralModel/SET_NEW_MODEL_TEMPLATE', templates[0] || null)
  }
}
</script>
<style lang="scss" scoped>
.template-selection {
  display: grid;
  row-gap: 7px;
  max-width: 500px;
  align-self: start;
}

.template-selection__label {
  @include typography(md-1, default);
  color: $colorAliceNight;
}
</style>
