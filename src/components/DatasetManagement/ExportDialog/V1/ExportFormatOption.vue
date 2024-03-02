<template>
  <div class="export-format-option">
    <span>{{ option.label }}</span>
    <div class="export-format-option__pills">
      <export-format-pill
        v-for="(pill, index) of option.pills"
        :key="index"
        class="export-format-option__pill"
        :pill="pill"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { ExportFormatOptionType } from '@/components/DatasetManagement/ExportDialog/types'

import ExportFormatPill from './ExportFormatPill.vue'

@Component({
  name: 'export-format-dropdown',
  components: { ExportFormatPill }
})
export default class ExportFormatDropdown extends Vue {
  @Prop({ required: true })
  option!: ExportFormatOptionType
}
</script>

<style lang="scss" scoped>
.export-format-option {
  @include row;
  align-items: center;
}

.export-format-option__pills {
  @include row--center;
  margin-left: 5px;
}

.export-format-option__pill {
  margin: 0 2px;
}
</style>
