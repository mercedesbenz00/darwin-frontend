<template>
  <div class="class-select">
    <search-field
      ref="searchDiv"
      class="class-select__input"
      placeholder="Pick a Class to map"
      v-model="search"
      @change="onSearch"
      @focus="onSearchFocus"
      @blur="onSearchBlur"
      @enter="onSearchEnter"
    />
    <div
      class="class-select__classes-modal"
      v-if="showSearch"
    >
      <div>
        <span class="class-select__classes-modal__label">Map a class to </span>
        <span>{{ modelClass.name }}</span>
      </div>
      <div class="class-select__classes-modal__class-list">
        <div
          :class="listItemCssClass(klass)"
          v-for="klass in availableClasses"
          :key="klass.id"
          @click="onClassClicked(klass)"
        >
          <img
            class="class-select__classes-modal__class-list__item__image"
            v-if="klass.images.length > 0"
            :src="classThumbnail(klass)"
            :alt="klass.name"
          >
          <span
            class="class-select__classes-modal__class-list__item__image"
            v-else
          />
          <span class="class-select__classes-modal__class-list__item__name">
            <div>
              {{ klass.name }}
            </div>
            <div
              class="class-select__classes-modal__class-list__item__name__dot"
              :style="{'background-color': klass.metadata._color}"
            >&nbsp;</div>
          </span>
          <span class="class-select__classes-modal__class-list__item__icon">
            <annotation-class-icon
              class="mapped-class__icon"
              :klass="klass"
            />
          </span>
        </div>
      </div>
      <div class="class-select__classes-modal__footer">
        <custom-button
          color="secondary"
          flair="rounded"
          tag="router-link"
          :to="'/classes'"
        >
          + New Class
        </custom-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { sortBy } from 'lodash'
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import AnnotationClassIcon from '@/assets/icons/V2/Duotone/AnnotationClassIcon.vue'
import { CustomButton } from '@/components/Common/Button/V2'
import SearchField from '@/components/Common/SearchField/V2/SearchField.vue'
import { AnnotationClassPayload, RootState, TrainingClass } from '@/store/types'

type Timer = ReturnType<typeof setTimeout>

@Component({
  name: 'class-select',
  components: {
    AnnotationClassIcon,
    CustomButton,
    SearchField
  }
})
export default class V2ModelSelectionDropdown extends Vue {
  @Prop({ type: Object as () => TrainingClass, required: true })
  readonly modelClass!: TrainingClass

  @Prop({ type: Object as () => AnnotationClassPayload, required: false })
  value!: AnnotationClassPayload

  @State((state: RootState) => state.aclass.classes)
  classes!: AnnotationClassPayload[]

  search: string = ''
  searchFocused: boolean = false
  highlightedClass: AnnotationClassPayload | null = null

  _blurTimeout: Timer | null = null

  $refs!: {
    searchDiv: SearchField
  }

  get compatibleClasses (): AnnotationClassPayload[] {
    const klasses = this.classes.filter(klass => {
      return klass.annotation_types.some(type => type === this.modelClass.type)
    })

    return sortBy(klasses, ['name'])
  }

  get availableClasses (): AnnotationClassPayload[] {
    return this.compatibleClasses.filter(klass => {
      return klass.name.includes(this.search)
    })
  }

  get showSearch (): boolean {
    return this.searchFocused
  }

  get valueName (): string {
    return this.value?.name || ''
  }

  classThumbnail (klass: AnnotationClassPayload): string {
    return klass.images[0].crop_url || ''
  }

  @Watch('valueName')
  onValueNameChanged (newValueName: string): void {
    if (newValueName !== '') {
      this.search = newValueName
    }
  }

  listItemCssClass (klass: AnnotationClassPayload): (object | string)[] {
    const { highlightedClass, value } = this

    const isHighlighted = highlightedClass?.id === klass.id
    const correctId = value?.id === klass.id

    const cssContent = {
      'class-select__classes-modal__class-list__item_highlighted': isHighlighted,
      'class-select__classes-modal__class-list__item_selected': correctId
    }

    return [
      'class-select__classes-modal__class-list__item',
      cssContent
    ]
  }

  onSearch (): void {
    const search = this.search.trim()

    if (search === '') {
      this.highlightedClass = null
    } else {
      this.highlightedClass = this.compatibleClasses.filter(klass => klass.name.includes(search))[0]
    }
  }

  onSearchEnter (): void {
    this.search = this.highlightedClass?.name || ''
    this.$emit('input', this.highlightedClass)
  }

  onSearchFocus (): void {
    this.searchFocused = true
    this.$emit('focus')
  }

  onSearchBlur (): void {
    this._blurTimeout = setTimeout(() => {
      this.searchFocused = false

      if (!this.value) {
        this.search = ''
      }
    }, 200)

    this.$emit('blur')
  }

  onClassClicked (klass: AnnotationClassPayload): void {
    if (this._blurTimeout !== null && this._blurTimeout !== undefined) {
      clearTimeout(this._blurTimeout)
    }

    this.$emit('input', klass)
    this.$refs.searchDiv.setFocus()
  }

  mounted (): void {
    this.search = this.value?.name
  }

  updated (): void {
    if (this.search === undefined || this.search === null) {
      this.search = ''
    }

    if (this.search !== '') {
      if (this.search !== this.valueName && this.value !== null) {
        this.$emit('input', null)
      }
    } else {
      if (this.search !== this.valueName) {
        this.search = this.valueName
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.class-select {
  &__classes-modal {
    position: absolute;
    left: -16rem;
    margin-top: -2rem;
    width: 16rem;
    background: white;
    padding: 0.5rem;
    border-radius: 8px;
    box-shadow: 0px 1px 4px rgb(0 0 0 / 20%);

    &__label {
      color: $colorSecondaryLight;
    }

    &__footer {
      background: $colorGriteDark;
      margin-left: -0.5rem;
      margin-right: -0.5rem;
      margin-bottom: -0.5rem;
      border-bottom-right-radius: 8px;
      border-bottom-left-radius: 8px;
      padding: 0.5rem;
    }

    &__class-list {
      padding-top: 0.5rem;
      max-height: 300px;
      overflow: scroll;

      &__item {
        display: flex;
        flex-direction: row;
        padding: 0.25rem;
        border-radius: 6px;

        &__image {
          width: 3rem;
          border-radius: 4px;
          margin-right: 1rem;
          background: rgba(0,0,0,0.08)
        }

        &__name {
          flex-grow: 1;
          line-height: 2rem;
          height: 3rem;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;

          &__dot {
            background-color: #777;
            width: 8px;
            height: 8px;
            border-radius: 10px;
          }
        }

        &__icon {
          max-height: 20px;
          height: 20px;
          min-width: 20px;
          width: 20px;
          margin-right: 4px;
          padding-top: 8px;
        }
      }

      &__item_highlighted {
        background: $colorGrayLiter;
      }

      &__item_selected {
        background: $colorSemanticLightAction100;
        color: $colorBlue;
      }
    }
  }

  &:deep(.search-field__input:hover) {
    background-color: white;
  }

  &:deep(.search-field__input:focus) {
    border: none;
    border-radius: 0px;
    padding: 0;
  }

  &__input:deep(.search-field__icon) {
    display: none;
  }

  &__input:deep(input) {
    padding: 0;
    border: none;
    // font-weight: 700;
    border-radius: 0px
  }
}
</style>
