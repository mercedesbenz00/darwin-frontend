<template>
  <div class="folder-breadcrumbs">
    <router-link
      v-for="(crumb, index) in crumbs"
      :key="index"
      :to="crumb.to"
      class="folder-breadcrumbs__link"
      exact-class="folder-breadcrumbs__link--active"
    >
      {{ crumb.name }}
    </router-link>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Location } from 'vue-router'

import { DatasetFolderPayload, DatasetPayload } from '@/store/types'

@Component({
  name: 'workflow-folder-crumbs'
})
export default class WorkflowFolderCrumbs extends Vue {
  @Prop({ required: true })
  dataset!: DatasetPayload

  @Prop({ required: true })
  folders!: DatasetFolderPayload[]

  @Prop({ default: '/' })
  currentPath!: string

  get datasetName () {
    return this.dataset.name
  }

  get rootFolder () {
    return this.folders[0]
  }

  get subFolders () {
    const { rootFolder } = this
    if (!rootFolder) { return [] }
    return rootFolder.children
  }

  get crumbs () {
    const crumbs: { name: string, to: Location }[] = [
      {
        name: this.datasetName,
        to: { path: '/workview', query: this.resolveQuery('/') }
      }
    ]

    if (!this.subFolders || this.currentPath === '/') { return crumbs }
    const pathSegments = this.currentPath.split('/').slice(1)
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i]
      const path = '/' + pathSegments.slice(0, i + 1).join('/')
      crumbs.push({
        name: segment,
        to: {
          path: '/workview',
          query: this.resolveQuery(path)
        }
      })
      if (path === this.currentPath) { break }
    }
    return crumbs
  }

  resolveQuery (path: string) {
    return {
      ...this.$route.query,
      path: path === '/' ? undefined : path
    }
  }
}
</script>

<style lang="scss" scoped>
.folder-breadcrumbs {
  display: inline-flex;
  @include typography(md, default);
  color: $colorAliceNight;
}

.folder-breadcrumbs__link {
  @include noSelect;
  color: $colorAliceNight;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;

  &::after {
    content: url('/static/imgs/chevron.svg');
    margin: 0 5px 0 2px;
  }
}

.folder-breadcrumbs__link--active {
  font-weight: bold;
  color: $colorPrimaryDark;
}
</style>
