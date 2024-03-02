<template>
  <div class="permission-group">
    <div class="permission-group__header">
      <span>Model permissions</span>
      <info
        title="Permissions specific to a single model"
        @click.native="goToModels"
      >
        Go to your Neural Models page to manage these (or click here).
      </info>
    </div>
    <ul class="permission-group__abilities">
      <li
        v-for="normalized in normalizedPermissions"
        :key="normalized.id"
        v-tooltip="normalized.info"
        class="permission-group__abilities__ability"
      >
        {{ normalized.name }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import Info from '@/components/Common/Info.vue'
import { ApiKeyPermission } from '@/store/modules/apiKey/types'

import { ABILITY_INFO } from './data'

/**
 * Used to render a list of model specific permissions.
 *
 * For now, just renders "Run inference on {modelId}".
 */
@Component({ name: 'model-permission-list', components: { Info } })
export default class ModelPermissionList extends Vue {
  @Prop({ required: true, type: Array })
  permissions!: ApiKeyPermission[]

  get normalizedPermissions () {
    return this.permissions.map(permission => ({
      id: permission.join(':'),
      name: `${ABILITY_INFO[permission[0]].name} on model ${permission[1].split(':')[1]}`,
      info: ABILITY_INFO[permission[0]].info
    }))
  }

  /**
   * Closes settings pane and navigates to model.
   *
   * We cannot use router-link for this, since the settings dialog would remain open in that case.
   * If the settings dialog ever route-navigable, we can replace this with a simple router link.
   */
  goToModels () {
    this.$store.dispatch('ui/hideSettingsDialog')
    this.$router.push('/models')
  }
}
</script>

<style lang="scss" scoped>
.permission-group__header {
  @include row;
  padding-bottom: 10px;
  box-sizing: border-box;
  border-bottom: 2px solid $colorPrimaryLight3;
}

.permission-group__header > :first-child {
  margin-right: 15px;
}

.permission-group__abilities {
  padding-left: 20px;
  margin-top: 10px;
}

.permission-group__abilities__ability {
  margin-bottom: 10px;
  list-style-type: none;
}
</style>
