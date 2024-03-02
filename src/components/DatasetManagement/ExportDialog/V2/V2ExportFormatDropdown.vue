<template>
  <dropdown-v2
    v-model="_value"
    append-to-body
    dropdown-class-name="export-format-dropdown"
    :clearable="false"
    :options="exportFormats"
  >
    <template #option="option">
      <export-format-option :option="option" />
    </template>
    <template #selected-option="option">
      <export-format-option :option="option" />
    </template>
  </dropdown-v2>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import DropdownV2 from '@/components/Common/Dropdown/V2/Dropdown.vue'
import ExportFormatOption from '@/components/DatasetManagement/ExportDialog/V1/ExportFormatOption.vue'
import {
  ExportFormatOptionType,
  ExportFormatPillType
} from '@/components/DatasetManagement/ExportDialog/types'

@Component({
  name: 'v2-export-format-dropdown',
  components: {
    DropdownV2,
    ExportFormatOption
  }
})
export default class V2ExportFormatDropdown extends Vue {
  @Prop({
    required: true,
    default: null
  })
  value!: string | null

  get _value (): ExportFormatOptionType | null {
    return this.value ? this.exportFormats.find((f) => f.id === this.value) || null : null
  }

  set _value (option: ExportFormatOptionType | null) {
    const optionId = option ? option.id : null
    this.$emit('input', optionId)
    this.$emit('change', optionId)
  }

  get pillTypes (): { [key: string]: ExportFormatPillType } {
    return {
      bboxOnly: {
        name: 'B-Box Only',
        type: 'yellow'
      },
      heavy: {
        name: 'Heavy',
        type: 'pink'
      },
      mostVersatile: {
        name: 'Most Versatile',
        type: 'feather-light'
      },
      verySlow: {
        name: 'Very Slow',
        type: 'pink'
      }
    }
  }

  get exportFormats (): ExportFormatOptionType[] {
    const { pillTypes } = this
    return [
      {
        id: 'json',
        label: 'Darwin (JSON)',
        pills: [pillTypes.mostVersatile]
      },
      {
        id: 'coco',
        label: 'COCO',
        pills: [pillTypes.verySlow]
      },
      {
        id: 'cvat',
        label: 'CVAT',
        pills: []
      },
      {
        id: 'xml',
        label: 'Darwin (XML)'
      },
      {
        id: 'pascalvoc',
        label: 'PASCAL VOC',
        pills: [pillTypes.bboxOnly]
      },
      {
        id: 'semantic_mask',
        label: 'Semantic Mask (PNG)',
        pills: [pillTypes.verySlow, pillTypes.heavy]
      },
      {
        id: 'instance_mask',
        label: 'Instance Mask (PNG)',
        pills: [pillTypes.verySlow, pillTypes.heavy]
      }
    ]
  }
}
</script>
