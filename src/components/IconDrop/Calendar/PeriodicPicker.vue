<template>
  <div class="PeriodicPicker">
    <span>
      Every <input
        class="input rb"
        :value="str"
        @input="v => str = v.target.value"
      > days
    </span>
    <ButtonApp :value="l['Save']" @click="save"/>
  </div>
</template>

<script>

import Button from '@/components/Auth/Button.vue'

import { mapGetters } from 'vuex'

import mom from 'moment'

export default {
  props: ['content'],
  components: {
    ButtonApp: Button,
  },
  data() {
    return {
      str: '1',
    }
  },
  methods: {
    save() {
      if (this.getNumber) {
        this.$emit('close')
        this.content.callback({
          editDate: mom().format('Y-M-D'),
          periodic: this.getNumber,
          type: 'periodic',
        })
      }
    }
  },
  computed: {
    ...mapGetters(['l']),
    getNumber() {
      const num = parseInt(this.str, 10)
      if (!isNaN(num)) return num
    }
  }
}

</script>

<style scoped>

.PeriodicPicker {
  margin: 0 20px;
  width: 270px;
}

.input {
  width: 20px;
  margin-bottom: 20px;
  background-color: var(--dark);
  border: none;
  outline: none;
  padding: 6px;
}

</style>
