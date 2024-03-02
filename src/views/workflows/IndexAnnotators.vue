<template>
  <div class="annotators-workflow-overview">
    <content-card>
      <template #title>
        <annotators-workflow-title
          class="annotators-workflow-overview__title"
          :loading="workflowsLoading"
          :count="count"
        >
          <template #search>
            <search-field
              v-model="search"
              class="annotators-workflow-overview__title__search"
              :disabled="workflowsLoading"
              @keydown="onSearchUpdate"
            />
          </template>
          <template #sort>
            <sort-control
              class="annotators-workflow-overview__title__sort"
              :sort-by="sortBy"
              :sort-direction="sortDirection"
              :disabled="workflowsLoading"
              @change="onSortUpdated"
              @change-direction="onSortUpdated"
            />
          </template>
        </annotators-workflow-title>
      </template>
      <template>
        <div
          class="annotators-workflow-overview__section"
          v-if="workflowsLoading"
        >
          <circle-spinner />
        </div>
        <div
          class="annotators-workflow-overview__section"
          v-else
        >
          <div
            class="annotators-workflow-overview__section__content"
            v-if="filteredWorkflows.length > 0"
          >
            <annotators-workflow-card
              class="annotators-workflow-overview__section__content__card"
              v-for="workflow in filteredWorkflows"
              :key="workflow.id"
              :workflow="workflow"
              @request-work="requestWorkBatchInWorkflow"
            />
          </div>
          <div
            class="annotators-workflow-overview__section__no-content"
            v-else-if="search"
          >
            <span>There are no workflows assigned to you with keyword "{{ search }}"</span>
          </div>
          <div
            class="annotators-workflow-overview__section__no-content"
            v-else
          >
            <span>There are no workflows assigned to you</span>
          </div>
        </div>
      </template>
    </content-card>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from 'vue-property-decorator'
import { Route } from 'vue-router/types/router'
import { State } from 'vuex-class'

import { CircleSpinner } from '@/components/Common/LoadingIndicators'
import SearchField from '@/components/Common/SearchField/V2/SearchField.vue'
import AnnotatorsWorkflowCard from '@/components/Workflow/AnnotatorsWorkflowCard.vue'
import AnnotatorsWorkflowTitle from '@/components/Workflow/AnnotatorsWorkflowTitle.vue'
import SortControl from '@/components/WorkflowFiltering/SortControl.vue'
import { SortBy, SortDirection, SortOptions } from '@/components/WorkflowFiltering/types'
import ContentCard from '@/layouts/Main/ContentCard/ContentCard.vue'
import { RootState, TeamPayload, V2WorkflowPayload } from '@/store/types'
import { pluralize } from '@/utils'

@Component({
  name: 'index-annotators',
  components: {
    AnnotatorsWorkflowCard,
    ContentCard,
    AnnotatorsWorkflowTitle,
    SearchField,
    SortControl,
    CircleSpinner
  }
})
export default class AnnotatorOverview extends Vue {
  @State((state: RootState) => state.v2Workflow.workflows)
  workflows!: V2WorkflowPayload[]

  @State((state: RootState) => state.team.currentTeam)
  team!: TeamPayload

  requestingWork: Record<string, boolean> = {}
  workflowsLoading: boolean = false
  search: string = ''
  sortBy: SortBy = SortBy.MODIFIED
  sortDirection: SortDirection = SortDirection.ASC

  get filteredWorkflows (): V2WorkflowPayload[] {
    const { search, sortBy, sortDirection, workflows } = this
    const filteredWorkflows = workflows
      .filter(({ name }: V2WorkflowPayload) =>
        name.toLowerCase().includes((search || '').toLowerCase())
      )
      .sort(({ [sortBy]: a }: V2WorkflowPayload, { [sortBy]: b }: V2WorkflowPayload) => {
        if (a === b) { return 0 }

        return a < b ? -1 : 1
      })

    if (sortDirection === SortDirection.DESC) {
      filteredWorkflows.reverse()
    }

    return filteredWorkflows
  }

  get count (): number {
    return this.workflows.length
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

  onSearchUpdate (): void {
    this.onFilterUpdated()
  }

  onSortUpdated (params: Pick<SortOptions, 'sortBy' | 'sortDirection'>): void {
    this.sortBy = params.sortBy
    this.sortDirection = params.sortDirection
    this.onFilterUpdated()
  }

  onFilterUpdated (): void {
    this.$router.replace({
      query: this.queryParams
    }).catch(() => {})
  }

  public mounted (): void {
    this.loadWorkflows()
    this.loadFilters()
  }

  loadFilters (): void {
    const { query: { search, sortBy, sortDirection } } = this.$route

    if (typeof search === 'string') { this.search = search }

    if (typeof sortBy === 'string' && (Object.values(SortBy) as string[]).includes(sortBy)) {
      this.sortBy = sortBy as SortBy
    }

    if (typeof sortDirection === 'string' &&
    (Object.values(SortDirection) as string[]).includes(sortDirection)) {
      this.sortDirection = sortDirection as SortDirection
    }
  }

  async loadWorkflows (): Promise<void> {
    if (this.workflowsLoading) { return }
    this.workflowsLoading = true
    await this.$store.dispatch('v2Workflow/loadWorkflows', { worker: true })
    this.workflowsLoading = false
  }

  async requestWorkBatchInWorkflow ({ id, name }: V2WorkflowPayload): Promise<void> {
    const teamSlug = this.team.slug
    if (this.requestingWork[id]) { return }
    this.requestingWork[id] = true
    const response = await this.$store.dispatch('v2Workflow/requestWorkBatchInWorkflow', {
      teamSlug,
      workflowId: id
    })

    if ('data' in response) {
      const count = response.data.length
      const notification = count > 0
        ? `${pluralize(count, 'item', 'items')} assigned from workflow ${name}`
        : `No more work to be done for workflow ${name}.`

      this.$store.dispatch('toast/notify', { content: notification })
    }

    delete this.requestingWork[id]
  }
}
</script>

<style lang="scss" scoped>
.annotators-workflow-overview {
  @include col;
  @include fullsize;
  position: absolute;
  background: $colorSurfaceBackground !important;

  &__title {
    @include col--distributed;
    width: 100%;
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
    @include col;
    flex: 1 1 auto;
    height: 100%;
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
        @include typography(xxl, default);
        text-align: center;
        color: $colorContentTertiary;
        overflow: hidden;
      }
    }
  }
}
</style>
