<template>
  <div class="addGroup popup cb shadow rb" :class="platform">
    <DropInput
      back-color='var(--card)'
      placeholder="Group name..."
      :value='name'
      @input='v => name = v'
      :focus="true"
      :disable-auto-select='true'
      :options='options'
      @select="select"
      @cancel="$emit('close')"
      @enter='addGroup'
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
      platform: 'platform',
    }),
    ...mapState({
      groups: state => state.group.groups,
      popup: state => state.popup,
      payload: state => state.popup.payload,
    }),
    isEditing() {
      if (!this.payload) return false
      return this.payload.editing === true
    },
    title() {
      if (!this.isEditing) return 'Add group'
      return 'Edit group'
    },
  },
  methods: {
    addGroup() {
      const toast = (toast) => {
        this.$store.commit('pushToast', toast)
      }
      if (this.name) {
        const gro = this.groups.find(el => el.name === this.name)
        if (!gro && !this.isEditing) {
          this.$store.dispatch('group/addGroup', {
            name: this.name,
            ...this.payload,
          })
          toast({
            name: `Group added successfully!`,
            type: 'success',
            seconds: 2,
          })
          this.$store.dispatch('closePopup')
        } else if (!gro && this.isEditing) {
          this.$store.dispatch('group/saveGroupName', {
            name: this.name,
            id: this.payload.id,
          })
          toast({
            name: `Group edited successfully!`,
            type: 'success',
            seconds: 2,
          })
        } else {
          toast({
            name: `This group already exists!`,
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
      this.options = this.groups.filter(el => el.name.toLowerCase().includes(this.name.toLowerCase())).map(el => el.name)
    }
  }
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
