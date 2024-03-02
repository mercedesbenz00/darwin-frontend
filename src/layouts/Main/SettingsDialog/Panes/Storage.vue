<template>
  <settings-pane title="Storage">
    <template #body>
      <header class="header">
        <div>
          <h3 class="title">
            Integrated Storage
          </h3>
        </div>
        <div class="header__button-container">
          <secondary-button
            @click="openDocumentation"
          >
            Documentation
          </secondary-button>
          <storage-creation />
        </div>
      </header>

      <storages-list v-loading="loading" />
    </template>
  </settings-pane>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import StorageCreation from '@/components/Storage/StorageCreation.vue'
import StoragesList from '@/components/Storage/StoragesList.vue'
import { TeamPayload, RootState } from '@/store/types'

import SettingsPane from './SettingsPane.vue'

/**
 * Storages view component
 *
 * Displays list of all storages and creation button
 */
@Component({
  name: 'storage',
  components: {
    SettingsPane,
    StoragesList,
    StorageCreation
  }
})
export default class Storage extends Vue {
  @State((state: RootState) => state.team.currentTeam)
  team!: TeamPayload

  readonly documentURL = 'https://docs.v7labs.com/docs/external-storage-configuration'

  loading: boolean = false

  @Watch('team', { immediate: true })
  onTeam () {
    this.loading = true
    this.$store.dispatch('storage/getStorages').then(() => {
      this.loading = false
    })
  }

  openDocumentation (): void {
    window.open(this.documentURL)
  }
}
</script>

<style lang="scss" scoped>
.title {
  font-weight: bold;
  font-size: 1.2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $defaultSpace;
}

.header__button-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .secondary-button {
    margin-right: 16px;
  }
}
</style>
