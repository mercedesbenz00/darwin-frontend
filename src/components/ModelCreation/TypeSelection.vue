<template>
  <div class="types">
    <type-item
      v-for="type in types"
      :key="type.id"
      class="types__type"
      :type="type"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { ModelTemplatePayload, ModelType } from '@/store/types'

import TypeItem from './TypeItem.vue'
import { TYPES } from './data'
import { ModelTypeInfo, ModelTypeDefinition } from './types'

const typeDefinitionToTypeInfo = (
  definition: ModelTypeDefinition,
  templates: ModelTemplatePayload[]
): ModelTypeInfo => ({
  ...definition,
  available: definition.id !== ModelType.SemanticSegmentation &&
        templates.some(t => t.type === definition.id),
  mostAccurate: definition.id === ModelType.InstanceSegmentation
})

@Component({ name: 'type-selection', components: { TypeItem } })
export default class TypeSelection extends Vue {
  @State(state => state.neuralModel.modelTemplates)
  templates!: ModelTemplatePayload[]

  get types (): ModelTypeInfo[] {
    const { supportedTypes, templates } = this
    return TYPES
      .filter(t => supportedTypes.includes(t.id))
      .map((t) => typeDefinitionToTypeInfo(t, templates))
  }

  get supportedTypes (): ModelType[] {
    return [
      ModelType.Classification,
      ModelType.InstanceSegmentation,
      ModelType.ObjectDetection
    ]
  }
}
</script>

<style lang="scss" scoped>
.types {
  display: grid;
  grid-template-columns: repeat(auto-fill, 185px);

  justify-content: space-between;
  row-gap: 20px;
}

.types__type {
  height: 185px;
  width: 175px;
}
</style>
