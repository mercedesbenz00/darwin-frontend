<template>
  <div class="workflow-overview">
    <content-card>
      <template #title>
        <workflow-title
          class="workflow-overview__title"
          :loading="workflowsLoading"
        >
          <template #search>
            <search-field
              v-model="search"
              class="workflow-overview__title__search"
              placeholder="Search Workflows"
              :disabled="workflowsLoading"
              @keydown="onSearchUpdate"
            />
          </template>
          <template #sort>
            <sort-control
              class="workflow-overview__title__sort"
              :sort-by="sortBy"
              :sort-direction="sortDirection"
              :disabled="workflowsLoading"
              @change="onSortUpdated"
              @change-direction="onSortUpdated"
            />
          </template>
        </workflow-title>
      </template>
      <template>
        <div
          v-if="!workflowsLoading"
          class="workflow-overview__section"
        >
          <div
            v-if="count > 0 && filteredWorkflows.length > 0"
            class="workflow-overview__section__content"
          >
            <workflow-card
              v-for="workflow in filteredWorkflows"
              :key="workflow.id"
              class="workflow-overview__section__content__card"
              :data="workflow"
              :use-link="true"
              :show-actions="false"
              disable-menu
              @delete="onDeleteWorkflow"
              @click="onClickWorkflow"
            />
            <!--the click handler above did not seem to be working before the changes -->
          </div>
          <div
            v-else
            class="workflow-overview__section__no-content"
          >
            <span v-if="count === 0 && !search">
              There are no workflows
            </span>
            <span v-else>
              There are no workflows with keyword "{{ search }}"
            </span>
            <workflow-create-card class="workflow-overview__section__no-content__create" />
          </div>
        </div>
      </template>
    </content-card>
    <delete-confirmation-dialog
      ref="deleteConfirmationDialog"
      title="Are you sure you want to delete this workflow?"
      detail="This will delete any classes and unpublished datasets associated
              to this workflow, and all users in your Team will immediately lose access to it."
      button-text="DELETE WORKFLOW"
      @confirmed="onWorkflowDeletionConfirmed"
    />
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from 'vue-property-decorator'
import { Route } from 'vue-router/types/router'
import { State } from 'vuex-class'

import { DeleteConfirmationDialog } from '@/components/Common/DeleteConfirmationDialog/V1'
import SearchField from '@/components/Common/SearchField/V2/SearchField.vue'
import WorkflowCard from '@/components/Workflow/WorkflowCard.vue'
import WorkflowCreateCard from '@/components/Workflow/WorkflowCreateCard.vue'
import WorkflowTitle from '@/components/Workflow/WorkflowTitle.vue'
import SortControl from '@/components/WorkflowFiltering/SortControl.vue'
import { SortOptions } from '@/components/WorkflowFiltering/types'
import ContentCard from '@/layouts/Main/ContentCard/ContentCard.vue'
import { TeamPayload } from '@/store/modules/admin/types'
import { RootState, V2WorkflowPayload } from '@/store/types'
import { notifyError, errorMessages, isErrorResponse } from '@/utils'

@Component({
  name: 'index-others',
  components: {
    ContentCard,
    DeleteConfirmationDialog,
    SearchField,
    WorkflowTitle,
    WorkflowCard,
    WorkflowCreateCard,
    SortControl
  }
})
export default class IndexOthers extends Vue {
  @State((state: RootState) => state.v2Workflow.workflows)
  workflows!: V2WorkflowPayload[]

  @State((state: RootState) => state.team.currentTeam)
  team!: TeamPayload

  workflowsLoading: boolean = false
  search: string = ''
  sortBy: string = 'updated_at'
  sortDirection: 'asc' | 'desc' = 'asc'
  workflowToDelete: V2WorkflowPayload | null = null

  $refs!: {
    deleteConfirmationDialog: DeleteConfirmationDialog
  }

  get filteredWorkflows (): V2WorkflowPayload[] {
    return this.workflows
      .filter((p: V2WorkflowPayload) => {
        return !this.search ||
          this.search === '' ||
          p.name.toLowerCase().includes(this.search.toLowerCase())
      })
      .filter(p => p.id !== 'new-workflow')
      .sort((a: any, b: any) => {
        let coeff = 1
        if (this.sortDirection === 'desc') { coeff = -1 }
        if (this.sortBy in a && this.sortBy in b) {
          if (this.sortBy === 'name') {
            return a[this.sortBy].localeCompare(b[this.sortBy]) * coeff
          }
          if (a[this.sortBy] < b[this.sortBy]) { return -coeff }
          if (a[this.sortBy] > b[this.sortBy]) { return coeff }
        }
        return 0
      })
  }

  get count (): number {
    return this.filteredWorkflows.length
  }

  get queryParams (): Route['query'] {
    return {
      search: this.search,
      sortBy: this.sortBy,
      SortDirection: this.sortDirection
    }
  }

  @Watch('team')
  onTeamChange (): void {
    this.loadWorkflows()
  }

  onDeleteWorkflow (workflow: V2WorkflowPayload): void {
    this.workflowToDelete = workflow
    this.$refs.deleteConfirmationDialog.show()
  }

  onClickWorkflow (dataset: V2WorkflowPayload): void {
    this.workflowToDelete = dataset
    this.$refs.deleteConfirmationDialog.show()
  }

  onWorkflowDeletionConfirmed (): void {
    try {
      // TODO: implement DELETE METHOD
    } catch (err: unknown) {
      if (!isErrorResponse(err)) { throw err }
      notifyError(this.$store, err, errorMessages.WORKFLOW_DELETE)
    }
    this.$refs.deleteConfirmationDialog.close()
  }

  onSearchUpdate (): void {
    this.onFilterUpdated()
  }

  onSortUpdated (params: Pick<SortOptions, 'sortBy' | 'sortDirection'>): void {
    const { sortBy, sortDirection } = params
    if (sortBy) { this.sortBy = sortBy }
    if (sortDirection) { this.sortDirection = sortDirection }
    this.onFilterUpdated()
  }

  // When filter is updated, updated url args
  onFilterUpdated (): void {
    this.$router.replace({
      query: this.queryParams
    }).catch(() => {})
  }

  public created (): void {
    this.loadWorkflows()
    this.loadFilters()
  }

  loadFilters (): void {
    const { query: { search, sortBy, sortDirection } } = this.$route
    if (search && typeof search === 'string') { this.search = search }
    if (sortBy && typeof sortBy === 'string') { this.sortBy = sortBy }
    if (sortDirection && (sortDirection === 'asc' || sortDirection === 'desc')) {
      this.sortDirection = sortDirection
    }
  }

  async loadWorkflows (): Promise<void> {
    if (this.workflowsLoading) { return }
    this.workflowsLoading = true
    await this.$store.dispatch('v2Workflow/loadWorkflows')
    this.workflowsLoading = false
  }

  protected updateQuery (): void {
    this.$router.push({
      query: this.queryParams
    })
  }
}
</script>

<style lang="scss" scoped>
.workflow-overview {
  @include col;
  @include fullsize;
  position: absolute;
  background: $colorSurfaceElevate;

  &__title {
    padding: 12px;

    &__search {
      max-width: 280px;
    }

    &__sort {
      min-width: 90px;
      margin-left: 8px;
    }
  }

  &__section {
    @include col--center;
    flex: 1 1 auto;
    height: 100%;
    justify-content: flex-start;
    position: relative;
    overflow: hidden;

    $spacing: 8px;

    &__content {
      @include row--wrap;
      width: 100%;
      padding: $spacing;
      overflow-y: auto;
      gap: $spacing;

      &__card {
        @include col;
        flex: 0 1 auto;
        vertical-align: middle;

        @include respondFromTo(normal, sm) {
          width: 100%;
        }
        @include respondFromTo(sm, lg) {
          width: calc(50% - #{$spacing});
        }
        @include respondFrom(lg) {
          width: 320px;
        }
      }
    }

    &__no-content {
      @include col--center;
      flex: 1 1 auto;
      height: 100%;
      max-width: 100%;
      width: 100%;
      justify-content: center;

      span {
        max-width: 80%;
        margin: 0 auto;
        @include typography(xxl, inter);
        text-align: center;
        color: $colorContentTertiary;
        overflow: hidden;
        font-weight: 500;
      }

      &__create {
        margin-top: 24px;
        display: flex;
        flex: 0 1 auto;
      }
    }
  }
}
</style>
