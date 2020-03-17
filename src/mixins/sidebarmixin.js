

export default {
  data() {
    return {
      editing: false,
      excludeNames: [],
      editModel: '',
    }
  },
  methods: {
    edit() {
      this.editing = true
      this.focus()
    },
    handleSave() {
      if (
          this.editModel === this.name || 
          this.excludeNames.includes(this.editModel)
        ) {
          this.$store.commit('pushToast', {
            name: `This item already exists!`,
            type: 'error',
            seconds: 5,
          })
        }
      else {
        this.save(this.editModel)
      }
    },
    keydown(evt) {
      const {key} = evt

      switch (key) {
        case "Enter": {
          this.handleSave()
          break
        }
        case "Escape": {
          this.blur()
          this.editing = false
          this.setDefault()
          break
        }
      }
    },

    setDefault() {
      this.editModel = this.name
    },
    focus() {
      setTimeout(() => {
        if (this.$refs.editInput)
          this.$refs.editInput.focus()
        }, 10)
    },
    blur() {
      if (this.$refs.editInput)
        this.$refs.editInput.blur()
    },
  },
  watch: {
    name() {
      this.setDefault()
    },
  },
}
