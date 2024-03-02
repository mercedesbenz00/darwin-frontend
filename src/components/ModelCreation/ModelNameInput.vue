<template>
  <div class="name">
    <input-field
      class="name__input"
      :error="nameError"
      :value="modelName"
      @change="setModelName"
    />
    <button
      v-tooltip="{ content: 'Generate random model name' }"
      class="name__regenerate"
      @click="generateModelName"
    >
      <dice-icon />
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { DiceIcon } from '@/assets/icons/V1'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import { ModelType } from '@/store/types'
import { formatRawDate } from '@/utils/time'

import adjectives from './assets/adjectives.json'
import nouns from './assets/nouns.json'

const pickRandom = function<T> (items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

const SHORTENED_TYPES: Record<ModelType, string> = {
  [ModelType.AutoAnnotation]: 'A-A',
  [ModelType.Classification]: 'Classf',
  [ModelType.InstanceSegmentation]: 'Inst-Seg',
  [ModelType.ObjectDetection]: 'Obj-Det',
  [ModelType.SemanticSegmentation]: 'Sem-Seg',
  [ModelType.TextScanner]: 'Txt-Scn'
}

const shortenedType = (type: ModelType) => SHORTENED_TYPES[type]

const timestamp = () => formatRawDate(new Date(), 'DD-MM-YY')

@Component({
  name: 'model-name-input',
  components: { DiceIcon, InputField }
})
export default class ModelNameInput extends Vue {
  @State(state => state.neuralModel.newModelName)
  modelName!: string

  setModelName (value: string): void {
    const sanitized = value.replace(/[^a-z0-9-+_@]/gmi, '').replace(/\s+/g, '')
    this.$store.commit('neuralModel/SET_NEW_MODEL_NAME', sanitized)
  }

  @State(state => state.neuralModel.newModelType)
  type!: ModelType

  @Watch('type')
  onTypeChange () {
    this.generateModelName()
  }

  mounted () {
    if (!this.modelName || this.modelName.length === 0) {
      this.generateModelName()
    }
  }

  generateModelName (): void {
    const { type } = this
    const adjective = pickRandom(adjectives as string[])
    const noun = pickRandom(nouns as string[])
    const shortened = shortenedType(type)
    const stamp = timestamp()
    const name = `${adjective}-${noun}-${shortened}-${stamp}`
    this.setModelName(name)
  }

  @State(state => state.neuralModel.newModelValidationErrors.name)
  nameError!: string | undefined
}
</script>

<style lang="scss" scoped>
.name {
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 15px;
}

.name__regenerate {
  height: 36px;
  width: 36px;
  background: transparent;
  color: $colorAliceNight;
  transition: background-color .2s ease;
  display: grid;
  align-items: center;
  justify-content: center;
  border-radius: 3px;

  svg {
    height: 24px;
    width: 26px;
  }
}

.name__regenerate:hover {
  background: $colorAliceShade;
}
</style>
