<template>
  <transition name="trans-t" appear
    @enter='enter'
    @afterEnter='afterEnter'
    @leave='leave'
  >
    <div class="Edit handle rb shadow">
      <div class="fix-back fade" @click="cancel"></div>
      <div class="edit-wrapper" :class="{show}">
        <InputApp
          class="no-back"
          :placeholder="placeholder"
          v-model="str"
          :value='str'
          @input="v => str = v"
          :focus="true"
          :disableAutoSelect='true'
          :options="options"
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
  props: ['name', 'names', 'errorToast', 'placeholder'],
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
      for (const node of evt.path)
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
      setTimeout(() => {
        s.transitionDuration = '.3s'
        if (height < 36)
          s.height = '35px'
        else
          s.height = height + 'px'
        setTimeout(() => this.show = true, 250)
      })
    },
    afterEnter(el) {
      el.style.height = 'auto'
    },
    leave(el) {
      const s = el.style

      s.transitionDuration = '0s'
      s.height = el.offsetHeight + 'px'
      setTimeout(() => {
        this.show = false
        s.transitionDuration = '.3s'
        s.overflow = 'hidden'
        s.backgroundColor = 'var(--back-color)'
        s.boxShadow = '0 0 0 #000'
        s.height = '0px'
      })
    },
    select(val) {
      this.str = val
    },
    save() {
      if (this.str) {
        if (!this.options.includes(this.str)) {
          this.$emit('save', this.str)
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
    ...mapGetters(['l']),
  },
  watch: {
    str() {
      this.options = this.names.filter(el => el.toLowerCase().includes(this.str.toLowerCase()))
    }
  }
}

</script>

<style scoped src="@/assets/css/editor.css">
</style>
