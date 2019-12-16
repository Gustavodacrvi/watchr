<template>
  <transition name="trans-t" appear
    @enter='enter'
    @afterEnter='afterEnter'
    @leave='leave'
  >
    <div class="HeadingEdit Edit handle rb shadow">
      <div class="fix-back fade" @click="cancel"></div>
      <div class="edit-wrapper" :class="{show}">
        <InputApp
          class="no-back"
          placeholder="Heading name..."
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
  props: ['buttonTxt', 'name', 'names', 'errorToast'],
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
        if (node.classList && node.classList.contains('TaskEditComp')) {
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

<style scoped>

.fix-back {
  position: fixed;
  height: 100%;
  width: 100%;
  z-index: 200;
  left: 0;
  top: 0;
}

.edit-wrapper {
  position: relative;
  z-index: 201;
}

.Edit {
  background-color: var(--card);
}

.trans-t-enter, .trans-t-leave-to {
  opacity: 0;
  background-color: var(--back-color);
  box-shadow: 0 0 0 rgba(0,0,0,.3);
}

.trans-t-leave, .trans-t-enter-to {
  opacity: 1;
  background-color: var(--card);
  box-shadow: 0 2px 6px rgba(0,0,0,.3);
}

.button {
  display: flex;
  padding-bottom: 4px;
  padding-left: 4px;
  align-items: center;
}

.btn {
  flex-basis: 100px;
}

.cancel {
  color: var(--red);
  margin-left: 6px;
}

.edit-wrapper {
  opacity: 0;
  transition-duration: .3s;
}

.show {
  opacity: 1;
}

</style>
