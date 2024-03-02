<template>
  <div>
    <select
      class="form-control"
      :placeholder="placeholder"
      :disabled="disabled"
    />
  </div>
</template>

<script>
import $ from 'jquery'
import { has } from 'lodash'
import 'select2'
import 'select2/dist/css/select2.min.css'

export default {
  name: 'Select2',
  model: {
    event: 'change',
    prop: 'value'
  },
  props: {
    placeholder: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    settings: {
      type: Object,
      default: () => { }
    },
    value: {
      type: [String, Number],
      default: null
    }
  },
  data () {
    return {
      select2: null
    }
  },
  watch: {
    options (val) {
      this.setOption(val)
    },
    value (val) {
      this.setValue(val)
    }
  },
  mounted () {
    /**
     * This will be add a new option to Select2 to define the placeholder for the search box.
     * searchInputPlaceholder configuration will be added to Select2 so that it will define
     * placeholder text for the search box.
     */
    (function ($) {
      if (!has($, 'fn.select2.amd')) { return }
      const Defaults = $.fn.select2.amd.require('select2/defaults')
      $.extend(Defaults.defaults, {
        searchInputPlaceholder: ''
      })
      const SearchDropdown = $.fn.select2.amd.require('select2/dropdown/search')
      const _renderSearchDropdown = SearchDropdown.prototype.render
      SearchDropdown.prototype.render = function () {
        // invoke parent method
        const $rendered = _renderSearchDropdown.apply(this, Array.prototype.slice.apply(arguments))
        this.$search.attr('placeholder', this.options.get('searchInputPlaceholder'))
        return $rendered
      }
    })(window.jQuery)

    this.init()
  },
  beforeDestroy () {
    if (!this.select2) { return }
    this.select2.select2('destroy')
  },
  methods: {
    setOption (val = []) {
      const { select2, settings } = this
      if (!select2) { return }

      const isOpen = this.select2.select2('isOpen')

      select2.empty()
      select2.select2({
        ...this.settings,
        data: val,
        dropdownParent:
          settings.dropdownParentSelector
            ? $(settings.dropdownParentSelector)
            : undefined
      })
      this.setValue(this.value)
      if (isOpen) { this.select2.select2('open') }
    },

    setValue (val) {
      if (!this.select2) { return }
      if (val instanceof Array) {
        this.select2.val([...val])
      } else {
        this.select2.val([val])
      }
      this.select2.trigger('change')
    },

    init () {
      const select = $(this.$el).find('select')
      if (!select || !(typeof select.select2 === 'function')) { return }
      const { settings, options } = this
      this.select2 = select.select2({
        ...settings,
        data: options,
        dropdownParent:
          settings.dropdownParentSelector
            ? $(settings.dropdownParentSelector)
            : undefined
      })

      // set initial value before binding to events, so as to not trigger change
      this.setValue(this.value)

      this.select2.on('select2:select select2:unselect', (ev) => {
        this.$emit('change', this.select2.val())
        this.$emit('select', ev.params.data)
      })

      this.select2.on('select2:close', () => {
        this.setOption(this.options)
      })
    }
  }
}
</script>
