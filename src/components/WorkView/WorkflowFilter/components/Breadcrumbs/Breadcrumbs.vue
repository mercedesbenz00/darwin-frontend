<template>
  <div class="breadcrumbs">
    <router-link
      v-for="(crumb, index) in crumbs"
      :key="index"
      :to="crumb.to"
      class="breadcrumbs__link"
      exact-class="breadcrumbs__link--active"
    >
      {{ crumb.name }}
    </router-link>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Location } from 'vue-router'

import { DatasetFolderPayload, DatasetPayload } from '@/store/types'

type Crumb = { name: string, to: Location }

@Component({
  name: 'breadcrumbs'
})
export default class WorkflowFolderCrumbs extends Vue {
  @Prop({ required: true })
  dataset!: DatasetPayload

  @Prop({ required: true })
  folders!: DatasetFolderPayload[]

  @Prop({ default: '/' })
  currentPath!: string

  get datasetName (): string {
    return this.dataset.name
  }

  get rootFolder (): DatasetFolderPayload {
    return this.folders[0]
  }

  get subFolders (): DatasetFolderPayload[] {
    const { rootFolder } = this
    if (!rootFolder) { return [] }
    return rootFolder.children || []
  }

  /**
   * Return reverse crumbs list
   * CSS will reverse it back to support scroll to the end on init
   */
  get crumbs (): Crumb[] {
    const crumbs: Crumb[] = [{
      name: this.datasetName,
      to: { path: '/workview', query: this.resolveQuery('/') }
    }]

    if (!this.subFolders || this.currentPath === '/') { return crumbs.reverse() }
    const pathSegments = this.currentPath.split('/').slice(1)
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i]
      const path = '/' + pathSegments.slice(0, i + 1).join('/')
      const to: Location = { path: '/workview', query: this.resolveQuery(path) }
      crumbs.push({ name: segment, to })
      if (path === this.currentPath) { break }
    }
    return crumbs.reverse()
  }

  resolveQuery (path: string): { path: string | undefined } {
    return {
      ...this.$route.query,
      path: path === '/' ? undefined : path
    }
  }
}
</script>

<style lang="scss" scoped>
.breadcrumbs {
  @include row;
  align-items: center;
  @include typography(md-2, inter, 500);
  padding: 8px 0;
  @include scrollbarV2;
  display: flex;
  flex-direction: row-reverse;

  &__link {
    @include noSelect;
    width: auto;
    white-space: nowrap;
    color: $colorContentTertiary;
    cursor: pointer;

    &::after {
      content: '/';
      margin: 0 4px 0 2px;
      color: $colorContentTertiary;
    }

    &:not(.breadcrumbs__link--active):hover {
      color: $colorContentSecondary;
    }
  }
}

.router-link-exact-active {
  color: $colorContentSecondary;
  cursor: default;

  &::after {
    content: '';
  }
}
</style>
