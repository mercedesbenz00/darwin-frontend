<template>
  <safe-delete-confirmation-dialog
    ref="deleteConfirmationDialog"
    :title="title"
    name="delete-class"
    button-text="DELETE CLASS"
    :target-text="deleteTargetText"
    :show-loading="true"
    :loading="loading"
    @confirmed="deleteSelectedClasses"
  >
    <template #description>
      <p>
        <span
          v-if="deleteClassUsageCount > 0"
          class="important-text"
        >
          Careful:&nbsp;
        </span>
        {{ descriptionPrefix }}
        <strong class="bold-text">{{ currentTeam.name }}</strong>.
        {{ descriptionSuffix }}
      </p>
    </template>
  </safe-delete-confirmation-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { SafeDeleteConfirmationDialog } from '@/components/Common/DeleteConfirmationDialog/V1'
import { deleteClasses } from '@/store/modules/aclass/actions/deleteClasses'
import { loadClassUsage } from '@/store/modules/aclass/actions/loadClassUsage'
import {
  AnnotationClassPayload,
  StoreActionPayload,
  TeamPayload
} from '@/store/types'
import { notifyErrorByCode, pluralize } from '@/utils'

@Component({
  name: 'delete-classes-confirmation-dialog',
  components: {
    SafeDeleteConfirmationDialog
  }
})
export default class DeleteClassesConfirmationDialog extends Vue {
  @Prop({ required: true })
  selectedClasses!: AnnotationClassPayload[]

  @State(state => state.team.currentTeam)
  currentTeam!: TeamPayload

  deleteClassUsageCount: number = 0
  loading: boolean = false

  get title (): string {
    if (this.selectedClasses.length > 1) {
      return 'Permanently Delete Classes?'
    } else {
      return 'Permanently Delete Class?'
    }
  }

  get selectedCount (): number {
    return this.selectedClasses.length
  }

  get deleteTargetText (): string {
    if (this.deleteClassUsageCount) {
      const annotationCountText = pluralize(this.deleteClassUsageCount, 'annotation', 'annotations')
      return `DELETE ${annotationCountText}`
    } else {
      return 'DELETE'
    }
  }

  get descriptionPrefix (): string {
    // eslint-disable-next-line no-multi-str
    const prefix = 'It is not recommended to delete classes which are still\
     actively being used to create annotations.'
    const classCountText = pluralize(this.selectedCount, 'this class', 'these classes', false)
    if (this.deleteClassUsageCount === 0) {
      return prefix.concat(` There are no annotations for ${classCountText} in any dataset in`)
    }

    const usagesText = pluralize(
      this.deleteClassUsageCount,
      'is one annotation',
      `are ${this.deleteClassUsageCount} annotations`,
      false
    )
    return prefix.concat(` There ${usagesText} using ${classCountText} which\
     will be PERMANENTLY deleted from datasets in`)
  }

  get descriptionSuffix (): string {
    const suffix = 'To confirm you want to delete'
    const classCountText = pluralize(this.selectedCount, 'it', 'the classes', false)
    const typeText = `type '${this.deleteTargetText}' below:`
    if (this.deleteClassUsageCount === 0) {
      return suffix.concat(` ${classCountText}, ${typeText}`)
    }

    const annotationCountText = pluralize(this.deleteClassUsageCount, 'annotation', 'annotations')
    return suffix.concat(` ${classCountText} along with the ${annotationCountText}, ${typeText}`)
  }

  $refs!: Vue['$refs'] & {
    deleteConfirmationDialog: SafeDeleteConfirmationDialog
  }

  async showDeleteModal () {
    if (!this.$can('delete_annotation_class')) {
      notifyErrorByCode(this.$store, 'ANNOTATION_CLASS_DELETE_NOT_AUTHORIZED')
      return
    }
    this.loading = true
    this.$refs.deleteConfirmationDialog.show()

    const payload: StoreActionPayload<typeof loadClassUsage> = {
      annotationClassIds: this.selectedClasses.map(aclass => aclass.id)
    }

    const { data, error } = await this.$store.dispatch('aclass/loadClassUsage', payload)
    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
      this.loading = false
      this.$refs.deleteConfirmationDialog.close()
      return
    }
    this.deleteClassUsageCount = data.usage
    this.loading = false
  }

  async showDeleteOneModal (aClass: AnnotationClassPayload) {
    if (!this.$can('delete_annotation_class')) {
      notifyErrorByCode(this.$store, 'ANNOTATION_CLASS_DELETE_NOT_AUTHORIZED')
      return
    }
    this.loading = true
    this.$refs.deleteConfirmationDialog.show()

    const payload: StoreActionPayload<typeof loadClassUsage> = {
      annotationClassIds: [aClass.id]
    }

    const { data, error } = await this.$store.dispatch('aclass/loadClassUsage', payload)
    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
      this.loading = false
      this.$refs.deleteConfirmationDialog.close()
      return
    }
    this.deleteClassUsageCount = data.usage
    this.loading = false
  }

  async deleteSelectedClasses () {
    if (!this.$can('delete_annotation_class')) {
      notifyErrorByCode(this.$store, 'ANNOTATION_CLASS_DELETE_NOT_AUTHORIZED')
      return
    }

    const payload: StoreActionPayload<typeof deleteClasses> = {
      teamId: this.currentTeam.id,
      annotationClassIds: this.selectedClasses.map(aclass => aclass.id),
      annotationsToDeleteCount: this.deleteClassUsageCount
    }

    const { error } = await this.$store.dispatch('aclass/deleteClasses', payload)
    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
      return
    }

    this.$refs.deleteConfirmationDialog.close()
  }
}
</script>

<style lang="scss" scoped>
.important-text {
  text-transform: uppercase;
  text-decoration: underline;
}

.bold-text {
  font-weight: bold;
}
</style>
