<template>
  <div class="create-key">
    <h1 class="create-key__header">
      Create new access key
    </h1>
    <div class="create-key__content">
      <input-field
        ref="name"
        placeholder="Key name"
        theme="light"
        :disabled="!!key"
        :value="name"
        @change="name = $event"
        @enter="createKey"
      />
    </div>
    <div class="create-key__permissions">
      <div class="create-key__permissions__list-wrapper">
        <div class="create-key__permissions__list">
          <permission-group-selector
            v-for="group in groups"
            :key="group.id"
            class="create-key__permissions__list__group"
            :group="group"
            @change="setSelectedAbilities"
          />
        </div>
      </div>
      <div
        v-if="errors.permissions"
        class="create-key__permissions__error"
      >
        {{ errors.permissions }}
      </div>
    </div>
    <created-key
      v-if="key"
      :value="key"
      class="created-key__info"
    />
    <div class="create-key__footer">
      <secondary-button @click="$emit('close')">
        Close
      </secondary-button>
      <positive-button
        v-if="!key"
        @click="createKey"
      >
        Create
      </positive-button>
      <positive-button
        v-else
        disabled
      >
        Created
      </positive-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import InputField from '@/components/Common/InputField/V1/InputField.vue'
import { AbilityID } from '@/store/modules/apiKey/types'
import { ValidationErrors, TeamPayload } from '@/store/types'

import CreatedKey from './CreatedKey.vue'
import PermissionGroupSelector from './PermissionGroupSelector.vue'
import { GROUPED_ABILITIES, PERMISSION_GROUPS } from './data'
import { AbilityGroup } from './types'

/**
 * Renders UI for generalized API key creaton, from the settings dialog tab.
 */
@Component({ name: 'create-key', components: { CreatedKey, InputField, PermissionGroupSelector } })
export default class CreateKey extends Vue {
  @Prop({ required: true, type: Object })
  team!: TeamPayload

  key: null | string = null
  name: string= ''

  errors: ValidationErrors = {}

  $refs!: Vue['$refs'] & {
    name: InputField
  }

  validate (): { valid: boolean, errors: ValidationErrors } {
    const errors: ValidationErrors = {}
    if (!this.name || this.name === '') { errors.name = 'You must type in a name.' }

    if (this.permissions.length === 0) {
      errors.permissions = 'You must select at least one ability'
    }

    return { errors, valid: Object.keys(errors).length === 0 }
  }

  @Watch('errors')
  onErrors (errors: ValidationErrors): void {
    if (errors.name) { this.$refs.name.setError(errors.name as string) }
  }

  async createKey () {
    const { valid, errors } = this.validate()

    if (!valid) {
      this.errors = errors
      return
    }

    const { name, permissions, team } = this

    const { data, error } =
      await this.$store.dispatch('apiKey/create', { name, permissions, team })

    if (error) {
      return this.$store.dispatch('toast/warning', { content: error.message })
    }

    if (data) {
      this.key = `${data.prefix}.${data.value}`
    }
  }

  groups = PERMISSION_GROUPS

  selectedAbilities: AbilityID[] = []

  setSelectedAbilities (groupId: AbilityGroup, abilities: AbilityID[]): void {
    const groupAbilities = GROUPED_ABILITIES[groupId]

    this.selectedAbilities = this.selectedAbilities
      .filter(a => !groupAbilities.includes(a))
      .concat(abilities)
  }

  get permissions (): [AbilityID, string][] {
    return this.selectedAbilities.map(a => [a, 'all'])
  }
}
</script>

<style lang="scss" scoped>
.create-key {
  background: $colorWhite;
  border-radius: inherit;
  padding: 25px;
}

.create-key__header {
  @include typography(xl, headlines, bold);
  margin-bottom: 25px;
}

.create-key__content {
  margin-bottom: 25px;
}

.create-key__permissions__list-wrapper {
  max-height: calc(100vh - 320px);
  overflow: auto;
  margin-bottom: 25px;
}

.create-key__permissions {
  padding-left: 15px;
}

.create-key__permissions__list {
  @include col;
}

.create-key__permissions__list__group {
  padding: 10px 0;
}

.create-key__permissions__error {
  @include typography(sm, default, bold);
  color: $colorPink;
}

.create-key__info {
  margin: 25px 0;
}

.create-key__info__value{
  @include typography(lg, default, normal)
}

.create-key__footer {
  margin-top: 25px;
  @include row--distributed;
}
</style>
