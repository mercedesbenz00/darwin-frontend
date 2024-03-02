<template>
  <div
    class="api-key"
    :class="{'api-key--expanded': expanded}"
  >
    <div
      class="api-key__header"
      @click.stop="expanded = !expanded"
    >
      <slot name="icon" />
      <img
        class="api-key__header__collapse-expand"
        src="/static/imgs/chevron_bottom.svg"
      >
      <div class="api-key__header__name">
        {{ apiKey.name }}
      </div>
      <div class="api-key__header__prefix">
        Starts with
        <span class="api-key__header__prefix__span">{{ apiKey.prefix }}</span>
      </div>
      <div class="api-key__header__actions">
        <slot />
      </div>
    </div>

    <transition name="toggle">
      <div
        v-if="expanded"
        class="api-key__permissions"
      >
        <permission-group
          v-for="group in nonEmptyGroups"
          :key="group.id"
          class="api-key__permissions__group"
          :group="group"
        />
        <model-permission-list
          v-if="modelSpecificPermissions.length > 0"
          class="api-key__permissions__group"
          :permissions="modelSpecificPermissions"
        />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { ApiKeyPayload, ApiKeyPermission } from '@/store/modules/apiKey/types'

import ModelPermissionList from './ModelPermissionList.vue'
import PermissionGroup from './PermissionGroup.vue'
import { PERMISSION_GROUPS, GROUPED_ABILITIES } from './data'
import { Group } from './types'

/**
 * Generalized component used to render an api key in a list.
 *
 * Provides two slots to render additional UI.
 *
 * The default slot is rendered all the way to the right and is intended for
 * action buttons.
 *
 * The `icon` slot is rendered all the way to the left and is intended for icons
 * depicting key associations (team or user).
 *
 * The component toggles between expanded and collapsed states.
 *
 * The expanded state shows permissions associated with the key.
 */
@Component({ name: 'key-list-item', components: { ModelPermissionList, PermissionGroup } })
export default class KeyListItem extends Vue {
  @Prop({ required: true, type: Object })
  apiKey!: ApiKeyPayload

  expanded: boolean = false

  toggleExpand () {
    this.expanded = !this.expanded
  }

  get generalPermissions (): ApiKeyPermission[] {
    return this.apiKey.permissions.filter(p => p[1] === 'all')
  }

  get nonEmptyGroups (): (Group & { permissions: ApiKeyPermission[] })[] {
    return PERMISSION_GROUPS.map(g => ({
      id: g.id,
      name: g.name,
      permissions: this.generalPermissions.filter(p => GROUPED_ABILITIES[g.id].includes(p[0]))
    })).filter(g => g.permissions.length > 0)
  }

  get modelSpecificPermissions (): ApiKeyPermission[] {
    return this.apiKey.permissions.filter(p => p[1].indexOf('model:') === 0)
  }
}
</script>

<style lang="scss" scoped>
.api-key {
  @include col;
  border-radius: 3px;
  box-shadow: 0px 0px 2px $colorSecondaryLight2, 0px 2px 2px rgba(145, 169, 192, 0.3);
}

.api-key__header {
  @include row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  background: $colorWhite;
  cursor: pointer;

  transition: background-color .2s ease;
}

.api-key__header__collapse-expand {
  border-radius: 50%;
  background: $colorWhite;
  @include row;
  align-items: center;
  margin-right: 10px;
  width: 15px;
  height: 15px;

  transition: transform .5s ease;
}

// occurs if content for the icon slot is given
.api-key__header__collapse-expand:not(:first-child) {
  margin-left: 10px;
}

.api-key--expanded .api-key__header__collapse-expand {
  transform: rotate(-180deg)
}

.api-key__header__name,
.api-key__header__prefix {
  flex: 1;
}

.api-key__header__prefix__span {
  font-family: "FiraMono";
  padding: 3px 5px;
  background-color: $colorSecondaryLight2;
  border-radius: 3px;
  margin-left: 3px;
}

.api-key__header__name {
  font-weight: bold;
}

.api-key__header__actions button {
  font-weight: bold;
}

.api-key__header,
.api-key__permissions {
  padding: 15px;
}

.api-key__permissions {
  background: $colorLineGrey;
  flex-basis: 100%;
  width: 100%;
  @include col;
}
</style>
