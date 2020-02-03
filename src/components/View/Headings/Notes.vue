<template>
  <transition
    appear
    @enter='enter'
    @leave='leave'
  >
    <div v-if="notes !== undefined" class="Notes" :class="{heading}" ref='root'>
      <textarea class="text" ref='text'
        v-model="name"
        placeholder="Notes..."
        rows="1"

        @focus="focus"
        @blur="blur"
        @keydown="keydown"
      />
      <span v-if="isDesktop && editing" class="save-msg">Press Shift + Enter to save</span>
      <AuthButton v-else-if="!isDesktop && editing"
        type='card'
        value='Save notes'
        @click="save"
      />
    </div>
  </transition>
</template>

<script>

import AuthButton from '@/components/Auth/Button.vue'

import { mapGetters, mapState } from 'vuex'

import utils from '@/utils'

export default {
  components: {
    AuthButton,
  },
  props: ['notes', 'heading'],
  data() {
    return {
      name: this.notes,
      editing: false,
    }
  },
  mounted() {
    setTimeout(() => {
      this.fixHeight()
    }, 80)
  },
  methods: {
    focus() {
      this.editing = true
    },
    blur() {
      this.editing = false
    },
    keydown(evt) {
      const {key} = evt
      if (this.isOnShift && key === "Enter") {
        evt.preventDefault()
        this.save()
      }
    },
    save() {
      this.$refs.text.blur()
      this.editing = false
      this.$emit('save', this.name)
    },
    fixHeight() {
      const txt = this.$refs.text

      if (txt) {
        txt.style.height = ''
        txt.style.height = txt.scrollHeight + 'px'
  
        this.$refs.root.style = txt.scrollHeight + 'px'
      }
    },
    enter(el, done) {

      const s = el.style

      const height = el.scrollHeight + 'px'
      s.transitionDuration = 0
      s.height = 'auto'
      s.opacity = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.25s'
        s.height = height
        s.opacity = 1

        setTimeout(done, 255)
        
      })

    },
    leave(el, done) {
      const s = el.style

      s.transitionDuration = '.25s'
      s.height = 0
      s.opacity = 0

      setTimeout(done, 255)
    },
  },
  computed: {
    ...mapState(['isOnShift']),
    ...mapGetters(['isDesktop']),
  },
  watch: {
    name() {
      this.fixHeight()
    },
  },
}

</script>

<style scoped>

.Notes {
  position: relative;
  min-height: 25px;
  transition-duration: .2s;
}

.heading {
  margin-bottom: 16px;
}

.heading .text {
  margin-top: 12px;
}

.text {
  min-height: 25px;
  white-space: pre-line;
  resize: none;
  width: 100%;
  padding: 0;
  border: 0 none white;
  outline: none;
  transition: margin-top .2s;
}

.save-msg {
  position: absolute;
  top: 100%;
  right: 0;
  font-size: .8em;
  color: var(--fade);
}

</style>
