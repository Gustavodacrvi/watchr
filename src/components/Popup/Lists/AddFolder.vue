<template>
  <div class="AddFolder popup cb shadow rb" :class="platform">
    <div class="title tac">
      <h2 class="pc">{{ title }}</h2>
    </div>
    <div class="content">
      <DropInput
        placeholder="Tag name..."
        v-model="name"
        :focus="true"
        :options='options'
        @select="select"
      />
      <ButtonApp :value="btn" @click="addTag"/>
    </div>
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
    ...mapGetters(['platform']),
    ...mapState({
      folders: state => state.list.folders,
      popup: state => state.popup,
      payload: state => state.popup.payload,
    }),
    isEditing() {
      return this.payload
    },
    title() {
      if (!this.isEditing) return 'Add folder'
      return 'Edit folder'
    },
    btn() {
      if (!this.isEditing) return 'Add folder'
      return 'Edit folder'
    }
  },
  methods: {
    addTag() {
      const toast = (toast) => {
        this.$store.commit('pushToast', toast)
      }
      if (this.name) {
        const fold = this.folders.find(el => el.name === this.name)
        if (!fold && !this.isEditing) {
          this.$store.dispatch('list/addFolder', {
            name: this.name,
          })
          toast({
            name: `<strong>${this.name}</strong> folder added successfully!`,
            type: 'success',
            seconds: 2,
          })
          this.$store.commit('closePopup')
        } else if (!fold && this.isEditing) {
          this.$store.dispatch('list/editFolder', {
            name: this.name,
            id: this.payload.id,
          })
          toast({
            name: `<strong>${this.name}</strong> folder edited successfully!`,
            type: 'success',
            seconds: 2,
          })
          this.$store.commit('closePopup')
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
