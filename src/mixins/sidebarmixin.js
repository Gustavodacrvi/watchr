
/*
  The component requires:
    sidebarmixin.css
    save() method for saving the element.
    existingItems: [] data() property or prop
    alreadyExistMessage: string data() property or prop
    item type prop
    viewType
    viewName
*/

export default {
  data() {
    return {
      editing: false,
      editModel: '',
      displayName: this.name,
    }
  },
  mounted() {
    this.setDefault()
  },
  methods: {
    edit() {
      this.editing = true
      this.focus()
    },
    editClick(event) {
      let found = false
      const path = event.path || (event.composedPath && event.composedPath())
      for (const node of path)
        if (node === this.$el) {
          found = true
          break
        }

      if (!found) {
        this.stopEditing()
      }
    },
    handleSave() {
      if (
          this.editModel === this.name || 
          this.existingItems.find(el => el.name === this.editModel)
        ) {
          this.$store.commit('pushToast', {
            name: this.alreadyExistMessage,
            type: 'error',
            seconds: 5,
          })
        }
      else {
        this.displayName = this.editModel
        this.saveItem({
          id: this.id,
          name: this.editModel,
        })
        if (this.name === this.viewName && this.type === this.viewType)
          this.$router.push(`/user?${this.viewType}=${this.editModel}`)
        this.stopEditing(false)
      }
    },
    stopEditing(setDefault = true) {
      this.blur()
      this.editing = false
      if (setDefault)
        this.setDefault()
    },
    keydown(evt) {
      const {key} = evt

      switch (key) {
        case "Enter": {
          this.handleSave()
          break
        }
        case "Escape": {
          this.stopEditing()
          break
        }
      }
    },

    setDefault() {
      this.editModel = this.name
      this.displayName = this.name
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
    editing() {
      setTimeout(() => {
        if (!this.editing)
          window.removeEventListener('click', this.editClick)
        else
          window.addEventListener('click', this.editClick)
      })
    },
  },
}
