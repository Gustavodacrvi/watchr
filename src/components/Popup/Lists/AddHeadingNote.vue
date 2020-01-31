<template>
  <div class="AddNote popup cb shadow rb" :class="platform">
    <InputApp
      back-color='var(--card)'
      :focus="true"
      v-model="note"
      :value='note'
      @input='v => note = v'
      :options="[]"
      placeholder="Note..."
      @enter='addNote'
      @cancel="$emit('close')"
    />
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
    ...mapGetters(['platform']),
    ...mapState({
      payload: state => state.popup.payload,
    })
  },
  methods: {
    addNote() {
      if (this.note && this.payload) {
        this.$store.dispatch('list/saveHeadingNotes', {
          listId: this.payload.listId,
          heading: this.payload.heading,
          notes: this.note,
        })
        this.$store.dispatch('closePopup')
      }
    }
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
