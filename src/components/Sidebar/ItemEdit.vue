<template>
  <div class="ItemEdit rb">
    <div class="wrapper">
      <input class="input" ref='input'
        autocomplete="off"
        v-model="name"
        :placeholder='placeholder'
        @keydown="keydown"
      />
    </div>
  </div>
</template>

<script>

import { mapState } from 'vuex'

export default {
  props: ['placeholder'],
  data() {
    return {
      name: '',
    }
  },
  mounted() {
    window.addEventListener('click', this.windowClick)
    this.focus()
  },
  beforeDestroy() {
    window.removeEventListener('click', this.windowClick)
  },
  methods: {
    windowClick({path}) {

      let found = false
      for (const node of path)
        if (node === this.$el) {
          found = true
          break
        }
      
      if (!found)
        this.$emit('close')
    },
    focus() {
      this.$refs.input.focus()
    },
    go(dire) {
      this.$emit('go', dire)
      setTimeout(() => {
        this.focus()
      })
    },
    keydown(evt) {
      const {key} = evt

      if (this.isOnShift) {
        if (key === 'ArrowUp')
          this.go(-1)
        else if (key === 'ArrowDown')
          this.go(1)
      }
    },
  },
  computed: {
    ...mapState(['isOnShift'])
  },
}

</script>

<style scoped>

.ItemEdit {
  overflow: hidden;
  background-color: var(--dark);
}

.wrapper {
  height: 35px;
}

.input {
  width: 100%;
  height: 100%;
  padding-left: 12px;
  outline: none;
}


</style>
