<template>
  <div
    :key="group.id"
    class="permission-group"
    :class="{'permission-group--expanded': expanded}"
  >
    <div class="permission-group__header">
      <check-box
        :id="group.id"
        v-tooltip="'Click to toggle all actions in this group'"
        class="permission-group__header__control"
        :label="group.name"
        :name="group.id"
        :value="selected"
        @change="toggleGroup(group.id, $event.checked)"
      />
      <button
        class="permission-group__header__collapse-expand"
        @click="expanded = !expanded"
      >
        <div class="permission-group__header__collapse-expand__text">
          {{ outOf }}
        </div>
        <img
          class="permission-group__header__collapse-expand__icon"
          src="/static/imgs/chevron_bottom.svg"
        >
      </button>
    </div>
    <transition name="toggle">
      <ul
        v-if="expanded"
        class="permission-group__abilities"
      >
        <li
          v-for="ability in abilityOptions"
          :key="ability.id"
          v-tooltip="ability.info"
          class="permission-group__abilities__ability"
        >
          <check-box
            :id="ability.id"
            :label="ability.name"
            :name="ability.id"
            :value="ability.selected"
            @change="toggleAbility(ability.id, $event.checked)"
          />
        </li>
      </ul>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import { AbilityID } from '@/store/modules/apiKey/types'
import { Ability } from '@/store/types'

import { GROUPED_ABILITIES, ABILITY_INFO } from './data'
import { Group } from './types'

type NormalizedAbility = {id: string, name: string }
type AbilityOption = NormalizedAbility & { selected: boolean }

/**
 * Renders a permission group within the generalized key creation UI
 *
 * Has an expanded and collapsed state.
 *
 * The collapsed state allows selection of the entire group of permissions.
 * The expanded state allows selection of individual permissions.
 */
@Component({ name: 'permission-group-selector', components: { CheckBox } })
export default class PermissionGroupSelector extends Vue {
  @Prop({ required: true, type: Object })
  group!: Group

  @State(state => state.auth.abilities)
  userAbilities!: Ability[]

  expanded: boolean = false

  selectedAbilities: string[] = []

  get userActions (): AbilityID[] {
    const actions: AbilityID[] = this.userAbilities
      .reduce((acc, a) => acc.concat(a.actions as AbilityID[]), [] as AbilityID[])

    return GROUPED_ABILITIES[this.group.id].filter(a => actions.includes(a))
  }

  get abilities (): NormalizedAbility[] {
    return this.userActions.map(action => ({
      id: action,
      name: ABILITY_INFO[action].name,
      info: ABILITY_INFO[action].info
    }))
  }

  get abilityOptions (): AbilityOption[] {
    return this.abilities.map(a => ({ ...a, selected: this.selectedAbilities.includes(a.id) }))
  }

  toggleGroup (groupId: string, selected: boolean) {
    if (selected) {
      this.selectedAbilities = this.abilities.map(a => a.id)
    } else {
      this.selectedAbilities = []
    }

    this.$emit('change', this.group.id, this.selectedAbilities)
  }

  toggleAbility (id: string, selected: boolean) {
    const index = this.selectedAbilities.indexOf(id)
    if (selected && index === -1) { this.selectedAbilities.push(id) }
    if (!selected && index >= 0) { this.selectedAbilities.splice(index, 1) }

    this.$emit('change', this.group.id, this.selectedAbilities)
  }

  get selected (): boolean {
    return this.abilityOptions.every(o => o.selected)
  }

  get outOf (): string {
    const selectedCount = this.abilityOptions.filter(o => o.selected).length
    const totalCount = this.abilityOptions.length
    return `${selectedCount} / ${totalCount} selected`
  }
}
</script>

<style lang="scss" scoped>
.permission-group__header {
  @include row;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  box-sizing: border-box;
}

.permission-group--expanded .permission-group__header {
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

.permission-group__header__control.check-box {
  width: auto;
  color: $colorSecondaryLight;
  margin-right: 15px;
}

.permission-group__header__collapse-expand {
  background: none;
  @include row;
  align-items: center;
  margin-right: 20px;
}

.permission-group__header__collapse-expand__text {
  color: $colorSecondaryLight;
  margin-right: 15px;
  flex: 1;
  text-align: right;
}

.permission-group__header__collapse-expand__icon {
  border-radius: 50%;
  padding: 5px;
  width: 25px;
  height: 25px;

  transition: transform .5s ease;
  transition: background-color .2s ease;
}

.permission-group--expanded .permission-group__header__collapse-expand__icon {
  transform: rotate(-180deg)
}

.permission-group__header__collapse-expand:hover .permission-group__header__collapse-expand__icon {
  background: $colorSecondaryLight2;
}

.toggle-enter-to,
.toggle-leave {
  max-height: 500px;
}

.toggle-enter-active,
.toggle-leave-active {
  transition: max-height .2s ease;
}

.toggle-enter,
.toggle-leave-to {
  max-height: 0px;
}
</style>
