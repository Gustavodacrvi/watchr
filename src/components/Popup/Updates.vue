<template>
  <div class="Update popup cb shadow rb scroll-thin" :class="platform">
    <div class="title tac">
      <h3 class="pc">{{ l["What's new"] }}</h3>
    </div>
    <div class="content">
      <div class="options">
        <span v-for="v in versions" :key="v"
          class="opt rb cursor"
          :class="{active: ('v' + v) === ver}"
          @click="ver = ('v' + v)"
        >{{ parse(v) }}</span>
      </div>
      <transition name="fade-t">
        <component :is='ver'/>
      </transition>
    </div>
  </div>
</template>

<script>

import { mapState, mapGetters } from 'vuex'

import ButtonVue from '../Auth/Button.vue'


import v100 from './Updates/v100.vue'

export default {
  components: {
    Button: ButtonVue,
    v100,
  },
  created() {
    localStorage.setItem('watchr_version', this.version)
    this.ver = this.parse(this.version, false)
  },
  data() {
    return {
      ver: 'v100',
      versions: [
        '105', '104', '103', '102', '101', '100'
      ]
    }
  },
  methods: {
    parse(str, appendDot = true) {
      let newStr = ''
      for (const s of str) {
        if (appendDot)
          newStr += '.' + s
        else newStr += s
      }
      return 'v' + newStr
    },
    close() {
      this.$store.dispatch('closePopup')
      this.$router.replace('/user')
    },
  },
  computed: {
    ...mapState(['lang', 'version']),
    ...mapGetters(['l', 'platform']),
  }
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>

<style scoped>

.Update.desktop {
  max-height: 350px;
}

.Update {
  overflow: auto;
}

.options {
  margin: 18px 0;
}

.opt {
  display: inline-block;
  padding: 10px;
  background-color: var(--dark);
  transition-duration: .3s;
  border: none;
}

.opt:hover {
  background-color: var(--light-gray);
}

.opt.active {
  border: 1px solid var(--primary);
  color: var(--primary);
}

.opt + .opt {
  margin-left: 4px;
}

h1, h2, h3, h4, h5, h6 {
  color: var(--primary);
}

</style>
