<template>
  <div class="AddList popup cb shadow rb" :class="platform">
    <div class="title tac">
      <h2 class="pc">{{ title }}</h2>
    </div>
    <div class="content">
      <DropInput
        :placeholder="['Tag name'] + '...'"
        v-model="name"
        :focus="true"
        :options='options'
        @select="select"
        @enter='addList'
      />
      <ButtonApp :value="title" @click="addList"/>
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
      lists: state => state.list.lists,
      popup: state => state.popup,
      payload: state => state.popup.payload,
    }),
    isEditing() {
      if (!this.payload) return false
      return this.payload.editing === true
    },
    title() {
      if (!this.isEditing) return this.l['Add list']
      return this.l['Edit list']
    },
    isSmartList() {
      const lists = [
        'Today',
        'Upcoming',
        'Tomorrow',
        'Inbox'
      ]
      return lists.includes(this.name)
    }
  },
  methods: {
    addList() {
      const toast = (toast) => {
        this.$store.commit('pushToast', toast)
      }
      if (this.name) {
        const list = this.lists.find(el => el.name === this.name)
        if (this.isSmartList)
          toast({
            name: this.l[`This is a special list type.`],
            type: 'error',
            seconds: 4,
          })
        else if (!list && !this.isEditing) {
          this.$store.dispatch('list/addList', {
            name: this.name,
            ...this.payload,
          })
          toast({
            name: this.l[`List added successfully!`],
            type: 'success',
            seconds: 2,
          })
          this.$store.commit('closePopup')
        } else if (!list && this.isEditing) {
          this.$store.dispatch('list/editList', {
            name: this.name,
            id: this.payload.id,
          })
          toast({
            name: this.l[`List edited successfully!`],
            type: 'success',
            seconds: 2,
          })
          this.$store.commit('closePopup')
        } else {
          toast({
            name: this.l[`This list already exists!`],
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
      this.options = this.lists.filter(el => el.name.toLowerCase().includes(this.name.toLowerCase())).map(el => el.name)
    }
  }
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
