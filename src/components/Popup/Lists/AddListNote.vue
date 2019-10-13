<template>
  <div class="AddNote popup cb shadow rb" :class="platform">
    <div class="title tac">
      <h2 class="pc">{{ l['Add Note'] }}</h2>
    </div>
    <div class="content">
      <InputApp
        :focus="true"
        v-model="note"
        :options="[]"
        :placeholder="l['Note...']"
        @enter='addNote'
      />
      <ButtonApp :value='l["Add note"]' @click="addNote"/>
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
  created() {

  },
  computed: {
    ...mapGetters(['platform', 'l']),
  },
  methods: {
    addNote() {
      console.log(3)
    }
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
