<template>
  <attributes-input-component
    ref="input"
    :tags.sync="tags"
    :master-annotation="masterAnnotation"
    :editor="editor"
  />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import AttributesInputComponent from '@/components/WorkView/Common/AttributesInput/AttributesInput.vue'
import { Editor } from '@/engine/editor'
import { Annotation, InputTag } from '@/store/types'

@Component({
  name: 'attributes-input',
  components: {
    AttributesInputComponent
  }
})
export default class AttributesInput extends Vue {
  public tags: InputTag[] = []
  public masterAnnotation: Annotation | null = null
  public editor!: Editor

  $refs!: Vue['$refs'] & {
    input: InstanceType<typeof AttributesInputComponent>
  }

  setInputFocus () {
    this.$refs.input.setInputFocus()
  }
}
</script>
