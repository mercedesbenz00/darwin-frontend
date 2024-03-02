<template>
  <div class="admin">
    <sidebar />
    <router-view />
    <div class="admin-buttons">
      <secondary-button
        class="sync-keys-button"
        size="small"
        @click="syncApiKeys"
      >
        Sync API keys
      </secondary-button>
    </div>
  </div>
</template>

<script lang="ts">
import { config, library } from '@fortawesome/fontawesome-svg-core'
import {
  faBold,
  faImage,
  faItalic,
  faListOl,
  faListUl,
  faSort,
  faSortAlphaDown,
  faSortAlphaUp,
  faUnderline
} from '@fortawesome/free-solid-svg-icons'
import { Component, Vue } from 'vue-property-decorator'
import { Route } from 'vue-router'

import Sidebar from '@/components/Admin/Sidebar.vue'

const installFontAwesome = () => {
  library.add(
    faBold,
    faImage,
    faItalic,
    faListOl,
    faListUl,
    faSort,
    faSortAlphaDown,
    faSortAlphaUp,
    faUnderline
  )
  // check if superuser, otherwise redirect back to root

  /**
     * Setting this config so that Vue-tables-2 will be able to replace sort icons with chevrons
     * https://fontawesome.com/how-to-use/with-the-api/setup/configuration
     */
  config.autoReplaceSvg = 'nest'
}

@Component({ name: 'admin-main-view', components: { Sidebar } })
export default class MainView extends Vue {
  beforeRouteEnter (_to: Route, _from: Route, next: Function) {
    installFontAwesome()

    return next()
  }

  async syncApiKeys () {
    const { status } = await this.$store.dispatch('admin/syncApiKeys')
    if (status === 200) {
      this.$store.dispatch('toast/notify', { content: 'API keys synced successfully' })
    }
  }
}
</script>

<style lang="scss" scoped>
.admin {
  @include row;
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
}

.admin__sidebar {
  width: 200px;
  height: 100%;
  padding-top: 50px;
  background: $colorSecondaryLight3;
}

.admin-buttons {
  padding: 10px;
}
</style>
