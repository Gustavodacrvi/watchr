<template>
  <div class="addFolder popup cb shadow rb" :class="layout">
    <DropInput
      back-color='var(--card)'
      placeholder="Folder name..."
      :value='name'
      @input='v => name = v'
      :focus="true"
      :disable-auto-select='true'
      :options='options'
      @select="select"
      @cancel="$emit('close')"
      @enter='addFolder'
    />
  </div>
</template>

<script>

import DropInputVue from '../../Auth/DropInput.vue'
import ButtonVue from '../../Auth/Button.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    DropInput: DropInputVue,
    ButtonApp: ButtonVue,
  },
  data() {
    return {
      name: '',
      options: [],
    }
  },
  created() {
    if (this.isEditing) this.name = this.payload.name
  },
  computed: {
    ...mapGetters({
      layout: 'layout',
      folders: 'folder/folders',
    }),
    ...mapState({
      popup: state => state.popup,
      payload: state => state.popup.payload,
    }),
    isEditing() {
      if (!this.payload) return false
      return this.payload.editing === true
    },
    title() {
      if (!this.isEditing) return 'Add folder'
      return 'Edit folder'
    },
  },
  methods: {
    addFolder() {
      const toast = (toast) => {
        this.$store.commit('pushToast', toast)
      }
      if (this.name) {
        const fold = this.folders.find(el => el.name === this.name)
        if (!fold && !this.isEditing) {
          this.$store.dispatch('folder/addFolder', {
            name: this.name,
            ...this.payload,
          })
          toast({
            name: `Folder added successfully!`,
            type: 'success',
            seconds: 2,
          })
          this.$store.dispatch('closePopup')
        } else if (!fold && this.isEditing) {
          this.$store.dispatch('folder/saveFolder', {
            name: this.name,
            id: this.payload.id,
          })
          toast({
            name: `Folder edited successfully!`,
            type: 'success',
            seconds: 2,
          })
        } else {
          toast({
            name: `This folder already exists!`,
            type: 'error',
            seconds: 3,
          })
        }
      } else {
        toast({
          name: 'Fill in all the required fields.',
          type: 'error',
          seconds: 3,
        })
      }
    },
    select(val) {
      this.name = val
      setTimeout(() => {
        this.options = []
      })
    }
  },
  watch: {
    name() {
      this.options = this.folders.filter(el => el.name.toLowerCase().includes(this.name.toLowerCase())).map(el => el.name)
    }
  }
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
