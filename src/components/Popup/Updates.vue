<template>
  <div class="Update popup cb shadow rb scroll-thin" :class="platform">
    <div class="title tac">
      <h3 class="pc">{{ l["What's new"] }}</h3>
    </div>
    <div class="content">
      <div class="options">
        <span v-for="v in versions" :key="v"
          class="opt rb cursor"
          :class="{active: ('v' + v) === version}"
        >{{ parse(v) }}</span>
      </div>
      <transition name="fade-t">
        <component :is='version'/>
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
  data() {
    return {
      version: 'v100',
      versions: [
        '100', '101', '102', '103', '104', '105'
      ]
    }
  },
  methods: {
    parse(str) {
      let newStr = ''
      for (const s of str) {
        newStr += '.' + s
      }
      return 'v' + newStr
    },
    close() {
      this.$store.dispatch('closePopup')
      this.$router.replace('/user')
    },
  },
  computed: {
    ...mapState(['lang']),
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
  transition-duration: .2s;
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
