<template>
  <div class="Update popup cb shadow rb scroll-thin" :class="platform">
    <div class="title tac">
      <h3 class="pc">{{ l["What's new"] }}</h3>
    </div>
    <div class="content">
      <div class="options">
        <span v-for="v in versions" :key="v"
          class="opt rb cursor"
          :class="{active: ('v' + v) === ver, hasToRead: didntRead(v)}"
          @click="ver = ('v' + v)"
        >{{ parse(v) }}</span>
      </div>
      {{nonReadUpdates}}
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
    this.diff = this.versionDiff || 0
    this.ver = this.parse(this.version, false)
    this.$store.commit('updateVersion', this.version)
  },
  data() {
    return {
      ver: 'v100',
      diff: 0,
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
    didntRead(str) {
      return this.nonReadUpdates.includes(str)
    },
    close() {
      this.$store.dispatch('closePopup')
      this.$router.replace('/user')
    },
  },
  computed: {
    ...mapState(['lang', 'version']),
    ...mapGetters(['l', 'platform', 'versionDiff']),
    nonReadUpdates() {
      const nonRead = []
      for (let i = 0; i < this.diff;i++) {
        nonRead.push(this.versions[i])
      }
      return nonRead
    },
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
  color: var(--gray);
  border: none;
}

.opt:hover {
  background-color: var(--light-gray);
}

.hasToRead {
  color: var(--white);
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
