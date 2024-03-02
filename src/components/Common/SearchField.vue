<template>
  <div class="search-field">
    <search-icon class="search-field__icon" />
    <input
      ref="input"
      v-model="search"
      type="text"
      class="search-field__input"
      autofocus
      :placeholder="placeholder"
      @keydown.stop="onKeyDown"
      @keypress.stop
      @keyup.stop
      @keydown.enter.stop="$emit('enter')"
    >
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { SearchIcon } from '@/assets/icons/V1'

@Component({ name: 'search-field', components: { SearchIcon } })
export default class SearchField extends Vue {
  @Prop({ required: true })
  value!: string

  @Prop({ required: false, default: 'Search...' })
  placeholder!: string

  $refs!: {
    input: HTMLInputElement
  }

  get search () {
    return this.value
  }

  set search (val: string) {
    this.$emit('input', val)
    this.$emit('change', {
      value: val
    })
  }

  public setFocus () {
    this.$refs.input.focus()
  }

  onKeyDown (event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.$emit('esc', event)
    }
    this.$emit('keydown', event)
  }
}
</script>

<style lang="scss" scoped>
.search-field {
  @include row--center;
  position: relative;
  height: 36px;
  border-radius: 5px;
  overflow: hidden;
}

.search-field__icon {
  position: absolute;
  top: 11px;
  left: 14px;
  bottom: 11px;
  width: 13px;
  height: 13px;
  color: $colorAliceNight;
}

.search-field__input {
  flex: 1;
  height: 100%;
  @include typography(md-1, headlines);
  border: none;
  color: $color90Black;
  background: $colorAliceShade;
  box-shadow: inset 0px 2px 4px rgba(145, 169, 192, 0.3);
  padding: 9px 21px 9px 36px;

  &:active, &:focus {
    outline: none;
  }

  &::placeholder {
    @include typography(md-1, headlines);
    color: $colorAliceNight;
  }
}
</style>
