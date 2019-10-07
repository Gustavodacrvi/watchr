<template>
  <div class="HeadingEdit">
    <InputApp
      placeholder="Heading name..."
      v-model="str"
      :focus="true"
      :options="options"
      @select="select"
      @enter='save'
      @goup='$emit("goup")'
      @godown='$emit("godown")'
    />
    <div class="button">
      <ButtonApp
        :value="buttonTxt"
        @click="save"
      />
    </div>
  </div>
</template>

<script>

import DropInputVue from '../../Auth/DropInput.vue'
import ButtonVue from '../../Auth/Button.vue'
import { mapGetters } from 'vuex'

export default {
  props: ['buttonTxt', 'name', 'names', 'errorToast'],
  components: {
    InputApp: DropInputVue,
    ButtonApp: ButtonVue,
  },
  data() {
    return {
      str: '',
      options: [],
    }
  },
  created() {
    if (this.name) this.str = this.name
  },
  methods: {
    select(val) {
      this.str = val
    },
    save() {
      if (this.str) {
        if (!this.options.includes(this.str))
          this.$emit('save', this.str)
        else this.$store.commit('pushToast', {
          name: this.errorToast,
          seconds: 3,
          error: 'success',
        })
      }
    }
  },
  watch: {
    str() {
      this.options = this.names.filter(el => el.toLowerCase().includes(this.str.toLowerCase()))
    }
  }
}

</script>

<style scoped>

.button {
  width: 300px;
}

</style>
