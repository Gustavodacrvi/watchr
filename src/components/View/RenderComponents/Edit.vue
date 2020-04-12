<template>
  <transition name='trans-t' appear
    @enter='enter'
    @leave='leave'
  >
    <div class="Edit handle rb shadow" :class="{heading}">
      <div class="fix-back fade" @click="cancel"></div>
      <div class="edit-wrapper" :class="{show}">
        <InputApp
          class="no-back input"
          :placeholder="placeholder"
          v-model="str"
          :value='str'
          @input="v => str = v"
          :focus="true"
          :disableAutoSelect='true'
          :options="[]"
          @select="select"
          @enter='save'
          @goup='$emit("goup")'
          @godown='$emit("godown")'
          @cancel='cancel'
        />
      </div>
    </div>
  </transition>
</template>

<script>

import DropInputVue from '../../Auth/DropInput.vue'
import ButtonVue from '../../Auth/Button.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  props: ['name', 'names', 'errorToast', 'placeholder', 'keepOpen', 'heading'],
  components: {
    InputApp: DropInputVue,
    ButtonApp: ButtonVue,
  },
  data() {
    return {
      str: '',
      options: [],
      show: false,
    }
  },
  created() {
    if (this.name) this.str = this.name

    window.addEventListener('click', this.remove)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.remove)
  },
  methods: {
    remove(evt) {
      let found = false
      const path = event.path || (event.composedPath && event.composedPath())
      for (const node of path)
        if (node === this.$el) {
          found = true
          break
        }
      if (!found) this.cancel()
    },
    cancel() {
      this.leave(this.$el)
      setTimeout(() => {
        this.$emit('cancel')
      }, 301)
    },
    enter(el) {
      const s = el.style
      const height = el.offsetHeight

      s.transitionDuration = '0s'
      s.height = 0
      s.opacity = 0
      s.borderBottom = '0px solid transparent'
      requestAnimationFrame(() => {
        s.transitionDuration = '.15s'
        if (height < 36)
          s.height = '35px'
        else
          s.height = height + 'px'
        
        s.opacity = 1
        if (this.heading) {
          s.borderBottom = '1px solid var(--txt)'
          s.borderBottomStyle = 'dashed'
        }
        
        setTimeout(() => this.show = true, 250)
      })
    },
    leave(el) {
      const s = el.style

      s.transitionDuration = !this.heading ? '2s' : 0
      s.overflow = 'hidden'
      s.opacity = 0
      s.borderBottom = '0px solid transparent'
      s.borderBottomStyle = 'dashed'
      s.backgroundColor = 'var(--back-color)'
      s.boxShadow = '0 0 0 #000'
      s.height = '0px'
    },
    select(val) {
      this.str = val
    },
    save() {
      if (this.str) {
        if (!this.options.includes(this.str)) {
          this.$emit('save', this.str)
          this.str = ''
          if (!this.keepOpen)
            this.$emit('cancel')
        }
        else this.$store.commit('pushToast', {
          name: this.errorToast,
          seconds: 3,
          type: 'error',
        })
      }
    }
  },
  computed: {
    ...mapState(['iconDrop']),
  },
  watch: {
    str() {
      if (this.names)
        this.options = this.names.filter(el => el.toLowerCase().includes(this.str.toLowerCase()))
    }
  }
}

</script>

<style scoped src="@/assets/css/editor.css">
</style>

<style scoped>

.heading {
  background-color: transparent;
  box-shadow: none;
  border-bottom: 1px solid var(--txt);
  border-bottom-style: dashed;
  border-radius: 0;
  font-size: 1.17em;
  color: var(--txt);
}

.input {
  padding: 0;
}

.heading .input {
  margin-left: -6px;
}

</style>
