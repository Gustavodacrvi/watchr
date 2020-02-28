<template>
  <div class="ItemEdit rb shadow" :class="layout">
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

      if (key === 'Escape')
        this.$emit('close')
      if (this.isOnShift) {
        if (key === 'ArrowLeft') 
          this.go(-1)
        else if (key === 'ArrowRight')
          this.go(1)
      }
      if (key === "Enter") {
        this.$emit('add', this.name)
        this.name = ''
      }
    },
  },
  computed: {
    ...mapState(['isOnShift', 'layout'])
  },
}

</script>

<style scoped>

.ItemEdit {
  overflow: hidden;
  background-color: var(--dark);
}

.slim-sidebar .ItemEdit {
  background-color: var(--dark-light-gray);
}

.wrapper {
  height: 25px;
}

.mobile .wrapper {
  height: 42px;
}

.input {
  width: 100%;
  height: 100%;
  font-size: 1em;
  padding-left: 8px;
  outline: none;
}

</style>
