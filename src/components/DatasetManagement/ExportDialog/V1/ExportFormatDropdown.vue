<template>
  <dropdown
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
  </dropdown>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import Dropdown from '@/components/Common/Dropdown/Dropdown.vue'
import {
  ExportFormatOptionType,
  ExportFormatPillType
} from '@/components/DatasetManagement/ExportDialog/types'

import ExportFormatOption from './ExportFormatOption.vue'

@Component({
  name: 'export-format-dropdown',
  components: { Dropdown, ExportFormatOption }
})
export default class ExportFormatDropdown extends Vue {
  @Prop({ required: true, default: null })
  value!: string | null;

  get _value (): ExportFormatOptionType | null {
    return this.value
      ? this.exportFormats.find(f => f.id === this.value) || null
      : null
  }

  set _value (option: ExportFormatOptionType | null) {
    const optionId = option ? option.id : null
    this.$emit('input', optionId)
    this.$emit('change', optionId)
  }

  get pillTypes (): { [key: string]: ExportFormatPillType } {
    return {
      bboxOnly: { name: 'B-Box Only', type: 'yellow' },
      heavy: { name: 'Heavy', type: 'pink' },
      mostVersatile: { name: 'Most Versatile', type: 'feather-light' },
      verySlow: { name: 'Very Slow', type: 'pink' }
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

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.export-format-dropdown {
  .vs__dropdown-option {
    @include typography(md, default);
    color: $colorAliceNight;
    user-select: none;
    -webkit-user-select: none;
    padding: 14px 16px;

    &:not(:hover) {
      &:nth-child(odd) {
        background: $colorGriteDark;
      }

      &:nth-child(even) {
        background: $colorWhite;
      }
    }

    &.vs__dropdown-option--selected,
    &:hover {
      background: $colorFeatherFadeLight;
      font-weight: bold;
      color: $color90Black;
    }
  }
}
</style>
