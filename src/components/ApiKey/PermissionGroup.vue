<template>
  <div class="permission-group">
    <div class="permission-group__header">
      {{ group.name }}
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

import { ApiKeyPermission } from '@/store/modules/apiKey/types'

import { ABILITY_INFO } from './data'
import { Group } from './types'

@Component({ name: 'permission-group' })
export default class PermissionGroup extends Vue {
  @Prop({ required: true, type: Object })
  group!: Group & { permissions: ApiKeyPermission[]}

  get normalizedPermissions () {
    return this.group.permissions.map(permission => ({
      id: permission[0],
      name: ABILITY_INFO[permission[0]].name,
      info: ABILITY_INFO[permission[0]].info,
      original: permission
    }))
  }
}
</script>

<style lang="scss" scoped>
.permission-group__header {
  padding-bottom: 10px;
  box-sizing: border-box;
  border-bottom: 2px solid $colorPrimaryLight3;
}

.permission-group__abilities {
  padding-left: 20px;
  margin-top: 10px;
  column-count: 2;
  column-gap: 25px;
}

.permission-group__abilities__ability {
  margin-bottom: 10px;
  list-style-type: none;
}
</style>
