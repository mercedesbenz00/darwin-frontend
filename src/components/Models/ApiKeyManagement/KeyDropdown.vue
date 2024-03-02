<template>
  <div class="key-dropdown">
    <div class="key-dropdown__select">
      <Select2
        :options="options"
        :settings="settings"
        @select="onSelect"
      />
    </div>
  </div>
</template>

<script lang="ts">
/* global $ */
import { Component, Prop, Vue } from 'vue-property-decorator'

import Select2 from '@/components/Common/Select2.vue'
import { ApiKeyPayload } from '@/store/modules/apiKey/types'

/**
 * Renders key selection dropdown in the `<api-key-management>` ui on `/models`
 *
 * This dropdown is used to select a key accessible by the current user, which
 * is currently not attached to the current model, and associate it with the
 * model.
 */
@Component({ name: 'key-dropdown', components: { Select2 } })
export default class KeyDropdown extends Vue {
  @Prop({ required: true })
  apiKeys!: ApiKeyPayload[]

  @Prop({ required: false, default: false, type: Boolean })
  disabled!: boolean

  get settings () {
    return {
      placeholder: 'Add existing key',
      templateResult: this.formatTemplate.bind(this),
      theme: 'key-dropdown',
      dropdownAutoWidth: true,
      debug: true,
      // do not display search UI
      minimumResultsForSearch: Infinity
    }
  }

  get options () {
    return this.apiKeys.map(k => ({
      id: k.id,
      text: `${k.name} (${k.prefix}*****)`,
      description: `${k.permissions.length} permissions`
    }))
  }

  formatTemplate (state: { text: string, description: string }) {
    return $(`
    <div class="select2-results__option-cover">
      <div class="select2-results__option__title">
        ${state.text}
      </div>
      <div class="select2-results__option__description">
        ${state.description}
      </div>
    </div>
    `)
  }

  onSelect (data: { id: string }) {
    const keyId = parseInt(data.id)
    const key = this.apiKeys.find(k => k.id === keyId)
    this.$emit('select', key)
  }
}
</script>

<style lang="scss" scoped>
.key-dropdown {
  position: relative;
  width: 100%;
  cursor: pointer;
}

.key-dropdown__select {
  width: 100%;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">

.key-dropdown__select .select2-container.select2-container--key-dropdown {
  @include typography(md-1, headlines, bold);

  width: auto !important;

  .select2-selection--single {
    border: 1px solid $colorSecondaryDark1;
    border-radius: $border-radius-default;
    width: 150px;
    height: 39px;
    box-sizing: border-box;
    @include row;
    justify-content: center;
    align-items: center;
  }

  .select2-selection--single .select2-selection__rendered {
    padding: 0px 8px;
    line-height: 100%;
  }

  .select2-selection--single .select2-selection__arrow {
    display: none;
  }

  .select2-selection--single .select2-selection__placeholder {
    @include typography(md-1, headlines, bold);
    color: $colorSecondaryDark1;
  }
}

.select2-container--key-dropdown .select2-dropdown {
  background: $colorWhite;
  border: none;
  overflow: hidden;
  z-index: 1051;

  padding: 8px 0;
  box-shadow: 0px -5px 60px rgba(11, 36, 72, 0.2), 0px 1px 2px rgba(58, 78, 108, 0.05);
  border-bottom: none;
  border-radius: $border-radius-default;

  .select2-results__options {
    overflow-y: auto;
  }

  .select2-results__option {
    @include typography(md, default);
    color: $colorSecondaryLight;
    user-select: none;
    -webkit-user-select: none;
    background: $colorWhite;
    padding: 9px 12px;

    &:hover {
      background: $colorSecondaryLight1;
    }

    .select2-results__option-cover {
      margin: 0;

      .select2-results__option__title {
        margin-bottom: 7px;
        color: $colorSecondaryDark1;
        @include typography(md-1, default, normal);
      }

      .select2-results__option__description {
        color: $colorSecondaryLight;
        @include typography(sm, default, normal);
      }
    }
  }
}

</style>
