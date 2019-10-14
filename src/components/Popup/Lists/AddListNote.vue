<template>
  <div class="AddNote popup cb shadow rb" :class="platform">
    <div class="title tac">
      <h2 class="pc">{{ l['Add Notes'] }}</h2>
    </div>
    <div class="content">
      <InputApp
        :focus="true"
        v-model="note"
        :options="[]"
        :placeholder="l['Note...']"
        @enter='addNote'
      />
      <ButtonApp :value='l["Add notes"]' @click="addNote"/>
    </div>
  </div>
</template>

<script>

import DropInputVue from "@/components/Auth/DropInput.vue"
import ButtonVue from "@/components/Auth/Button.vue"

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    InputApp: DropInputVue,
    ButtonApp: ButtonVue,
  },
  data() {
    return {
      note: '',
    }
  },
  computed: {
    ...mapGetters(['platform', 'l']),
    ...mapState({
      payload: state => state.popup.payload,
    })
  },
  methods: {
    addNote() {
      if (this.note && this.payload)
        this.$store.dispatch('list/saveList', {
          id: this.payload,
          notes: this.note,
        })
    }
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
