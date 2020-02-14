<template>
  <div class="AddTag popup cb shadow rb" :class="platform">
    <DropInput
      back-color='var(--card)'
      placeholder="Tag name..."
      :value='name'
      @input='v => name = v'
      :focus="true"
      :disable-auto-select='true'
      :options='options'
      @select="select"
      @cancel="$emit('close')"
      @enter='addTag'
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
      tags: 'tag/tags',
      platform: 'platform',
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
      if (!this.isEditing) return 'Add tag'
      return 'Edit tag'
    },
  },
  methods: {
    addTag() {
      const toast = (toast) => {
        this.$store.commit('pushToast', toast)
      }
      if (this.name) {
        const tag = this.tags.find(el => el.name === this.name)
        if (!tag && !this.isEditing) {
          this.$store.dispatch('tag/addTag', {
            name: this.name,
            ...this.payload,
          })
          toast({
            name: `Tag added successfully!`,
            type: 'success',
            seconds: 2,
          })
        } else if (!tag && this.isEditing) {
          this.$store.dispatch('tag/saveTag', {
            name: this.name,
            id: this.payload.id,
          })
          toast({
            name: `Tag edited successfully!`,
            type: 'success',
            seconds: 2,
          })
        } else {
          toast({
            name: `This tag already exists!`,
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
      this.options = this.tags.filter(el => el.name.toLowerCase().includes(this.name.toLowerCase())).map(el => el.name)
    }
  }
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
