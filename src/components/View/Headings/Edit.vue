<template>
  <div class="HeadingEdit Edit">
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
      <div class="btn">
        <ButtonApp
          :value="buttonTxt"
          @click="save"
        />
      </div>
      <span class="cancel cursor" @click="$emit('cancel')">{{ l['Cancel'] }}</span>
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
  computed: {
    ...mapGetters(['l']),
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
  display: flex;
  align-items: center;
}

.btn {
  flex-basis: 100px;
}

.cancel {
  color: var(--red);
  margin-left: 6px;
}

</style>
