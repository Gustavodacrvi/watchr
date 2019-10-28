<template>
  <div class="AddNote popup cb shadow rb" :class="platform">
    <div class="title tac">
      <h2 class="pc">{{ l['List Invites'] }}</h2>
    </div>
    <div class="content">
      asdf
    </div>
  </div>
</template>

<script>

import DropInputVue from "@/components/Auth/DropInput.vue"
import ButtonVue from "@/components/Auth/Button.vue"

import { mapGetters, mapState } from 'vuex'

export default {
  components: {

  },
  data() {
    return {
      
    }
  },
  computed: {
    ...mapGetters(['platform', 'l']),
  },
  methods: {
    addNote() {

    }
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
