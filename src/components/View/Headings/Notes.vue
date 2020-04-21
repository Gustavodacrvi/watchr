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
      <span v-if="isDesktopBreakPoint && editing" class="save-msg">Press Shift + Enter to save</span>
      <AuthButton v-else-if="!isDesktopBreakPoint && editing"
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
  props: ['notes', 'heading', 'focusOnMount', 'value'],
  data() {
    return {
      name: this.notes,
      editing: false,
    }
  },
  mounted() {
    this.fixHeight()
    setTimeout(() => {
      if (this.focusOnMount && this.$refs.text)
        this.$refs.text.focus()
    }, 80)
  },
  methods: {
    focus() {
      this.editing = true
      this.$emit('input', true)
    },
    blur() {
      this.$emit('input', false)
      this.editing = false
      this.$nextTick(() => {
        this.name = this.notes
      })
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
        txt.style.height = txt.scrollHeight + 'px'
  
        this.$refs.root.style = txt.scrollHeight + 'px'
      }
    },
    enter(el, done) {

      const s = el.style

      s.height = 'auto'

      requestAnimationFrame(() => {
        const height = getComputedStyle(el).height
        
        s.transitionDuration = 0
        s.opacity = 0
        s.marginTop = 0
  
        requestAnimationFrame(() => {
          s.transitionDuration = '.15s'
          s.height = height
          s.opacity = 1
          s.marginTop = this.heading ? 0 : '10px'
  
          setTimeout(done, 155)
          
        })
      })

    },
    leave(el, done) {
      const s = el.style

      s.transitionDuration = '.15s'
      s.height = 0
      s.minHeight = 0
      s.opacity = 0
      s.marginTop = 0

      setTimeout(done, 155)
    },
  },
  computed: {
    ...mapState(['isOnShift']),
    ...mapGetters(['isDesktopBreakPoint']),
  },
  watch: {
    notes() {
      this.name = this.notes
    },
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
  transition-duration: .15s;
  margin-top: 10px;
}

.heading {
  margin-bottom: 16px;
  margin-top: 0;
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
  transition: margin-top .15s;
}

.save-msg {
  position: absolute;
  top: 100%;
  right: 0;
  font-size: .8em;
  color: var(--fade);
}

</style>
