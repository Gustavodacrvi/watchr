<template>
  <div class="ItemEdit rb" :class="layout">
    <div class="wrapper">
      <div class="icon-wrapper">
        <Icon class='adder-icon'
          :icon='adderIcon === "progress" ? "pie" : adderIcon'
          :width='adderIcon === "progress" ? null : "12px"'
          :progress='adderIcon === "progress" ? 0 : undefined'
          color='var(--fade)'
        />
      </div>
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

import { mapState, mapGetters } from 'vuex'

export default {
  props: ['placeholder', 'adderIcon'],
  data() {
    return {
      name: '',
    }
  },
  created() {
    this.$store.commit('isEditing', true)
  },
  mounted() {
    window.addEventListener('click', this.windowClick)
    
    this.focus()
  },
  beforeDestroy() {
    this.$store.commit('isEditing', false)
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
      setTimeout(() => {
        if (this.$refs.input)
          this.$refs.input.focus()
      }, 50)
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
    ...mapState({
      isOnShift: state => state.isOnShift,
    }),
    ...mapGetters({
      layout: 'layout',
    })
  },
}

</script>

<style scoped>

.ItemEdit {
  overflow: hidden;
  background-color: var(--card);
}

.slim-sidebar .ItemEdit {
  background-color: var(--dark-light-gray);
}

.wrapper {
  height: 19px;
  display: flex;
}

.mobile .wrapper {
  height: 42px;
}

.input {
  width: 100%;
  height: 100%;
  font-size: 1em;
  outline: none;
}

.icon-wrapper {
  position: relative;
  width: 22px;
  flex-shrink: 0;
}

.adder-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  margin-top: 1.5px;
}

.adder-icon {
  margin-top: 2px;
}

</style>
