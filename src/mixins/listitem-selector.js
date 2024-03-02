export default {
  props: {
    selected: Boolean,
    data: Object
  },
  data () {
    return {
      imgError: false
    }
  },
  computed: {
    isSelected: {
      get () {
        return this.selected
      },
      set (val) {
        this.$emit('select', {
          ...this.data,
          selected: val
        })
      }
    }
  },
  methods: {
    onCardClick (evt) {
      if (evt.shiftKey) {
        this.$emit('shift-select', { ...this.data, selected: true })
      } else {
        this.isSelected = !this.isSelected
      }
    },
    onImageLoaded () {
      this.imgError = false
    },
    onImageError () {
      this.imgError = true
    }
  }
}
