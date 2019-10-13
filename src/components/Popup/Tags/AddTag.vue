<template>
  <div class="AddTag popup cb shadow rb" :class="platform">
    <div class="title tac">
      <h2 class="pc">{{ title }}</h2>
    </div>
    <div class="content">
      <DropInput
        :placeholder="l['Tag name'] + '...'"
        v-model="name"
        :focus="true"
        :options='options'
        @select="select"
        @enter='addTag'
      />
      <ButtonApp :value="title" @click="addTag"/>
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
    ...mapGetters(['platform', 'l']),
    ...mapState({
      tags: state => state.tag.tags,
      popup: state => state.popup,
      payload: state => state.popup.payload,
    }),
    isEditing() {
      if (!this.payload) return false
      return this.payload.editing === true
    },
    title() {
      if (!this.isEditing) return this.l['Add tag']
      return this.l['Edit tag']
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
            name: this.l[`Tag added successfully!`],
            type: 'success',
            seconds: 2,
          })
          this.$store.commit('closePopup')
        } else if (!tag && this.isEditing) {
          this.$store.dispatch('tag/editTag', {
            name: this.name,
            id: this.payload.id,
          })
          toast({
            name: this.l[`Tag edited successfully!`],
            type: 'success',
            seconds: 2,
          })
          this.$store.commit('closePopup')
        } else {
          toast({
            name: this.l[`This tag already exists!`],
            type: 'error',
            seconds: 3,
          })
        }
      } else {
        toast({
          name: this.l['Fill in all the required fields.'],
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
