<template>
  <div class="export-button">
    <component
      :is="buttonType"
      class="export-button__button"
      size="medium"
      @click="openExportDialog"
    >
      Export
    </component>
    <export-dialog
      ref="exportDialog"
      :is-open-mode="isOpenMode"
      @createExport="createExport"
    />
    <post-export-dialog ref="postExportDialog" />
    <new-export-dialog ref="newExportDialog" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import PostExportDialog from '@/components/DatasetManagement/Dialog/PostExportDialog.vue'
import ExportDialog from '@/components/DatasetManagement/ExportDialog/V1/ExportDialog.vue'
import NewExportDialog from '@/components/DatasetManagement/ExportDialog/V1/NewExportDialog.vue'

@Component({
  name: 'export-button',
  components: { ExportDialog, NewExportDialog, PostExportDialog }
})
export default class ExportButton extends Vue {
  @Prop({
    required: false,
    type: String as () => 'primary-button' | 'secondary-light-button',
    default: 'secondary-light-button'
  })
  buttonType!: 'primary-button' | 'secondary-light-button'

  @Prop({ required: false, type: Boolean, default: false })
  isOpenMode!: boolean

  $refs!: {
    exportDialog: ExportDialog
    postExportDialog: PostExportDialog
    newExportDialog: NewExportDialog
  }

  openExportDialog () {
    this.$refs.exportDialog.show()
    this.$store.dispatch('ui/putBackSidebar')
  }

  createExport () {
    this.$refs.newExportDialog.show()
  }
}
</script>

<style lang="scss" scoped>
.export-button {
  width: 100%;
}

.export-button__button {
  width: 100%;
  @include row--center;
}

// when primary, it should be uppercase
.export-button__button.primary-button {
  text-transform: uppercase;
}
</style>
