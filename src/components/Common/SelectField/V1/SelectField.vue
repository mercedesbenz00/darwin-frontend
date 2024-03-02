<template>
  <v-select
    v-model="val"
    v-bind="$attrs"
    :options="options"
    v-on="$listeners"
  >
    <template #header>
      <span class="select-field__label">{{ label }}</span>
    </template>
    <template #search="{attributes, events}">
      <!-- Needed, to have native validation support -->
      <input
        class="vs__search"
        :required="required && !val"
        v-bind="attributes"
        v-on="events"
      >
    </template>
  </v-select>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import vSelect from 'vue-select'

/**
 * Simple select field
 *
 * @param {*} value - fields value
 * @param {*[]} options - fields options
 * @param {string} label - fields label
 * @param {boolean} required - marks field as required (html form validation)
 */
@Component({
  name: 'select-field',
  components: {
    vSelect
  }
})
export default class SelectField extends Vue {
  @Prop({ type: [Object, Number, String, Array, Date] })
  value!: any

  @Prop({ required: true, type: Array })
  options!: Array<any>

  @Prop({ type: String })
  label!: string

  @Prop({ type: Boolean })
  required!: boolean

  get val () {
    return this.value
  }

  set val (value) {
    this.$emit('input', value)
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
@import "vue-select/src/scss/vue-select.scss";

.v-select {
  .select-field {
    &__label {
      font-size: 0.875rem;
      line-height: 1.125rem;
      display: inline-block;
      color: $colorAliceNight;
      margin-bottom: 0.4375rem;
    }
  }

  .vs__dropdown-toggle {
    transition: background-color 0.2s ease, color 0.2s ease;
    color: $color90Black;
    width: 100%;
    height: 2.25rem;
    border: none;
    border-radius: 5px;
    font-size: 0.875rem;
    padding: 0.375rem 0.5625rem;
    box-shadow: inset 0px 2px 0.25rem rgb(145 169 192 / 30%);
    background: $colorAliceShade;
  }
  .vs__selected {
    margin: 0;
    padding: 0;
  }
}
</style>
