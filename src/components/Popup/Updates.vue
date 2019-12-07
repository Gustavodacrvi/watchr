<template>
  <div class="Update popup cb shadow rb scroll-thin" :class="platform">
    <div class="title tac">
      <h3 class="pc">{{ l["What's new"] }} - {{parse(ver)}}</h3>
    </div>
    <div class="content">
      <div class="options-wrapper scroll-thin-horizontal">
        <div class="options">
          <span v-for="v in versions" :key="v"
            class="opt rb cursor"
            :class="{active: v === ver, hasToRead: didntRead(v)}"
            @click="ver = v"
          >{{ parse(v) }}</span>
        </div>
        <div style="height: 5px"></div>
      </div>
      <transition name="fade-t" mode="out-in">
        <component :is='"v" + ver'/>
      </transition>
    </div>
  </div>
</template>

<script>

import { mapState, mapGetters } from 'vuex'

import ButtonVue from '../Auth/Button.vue'


import v040 from './Updates/v040.vue'
import v041 from './Updates/v041.vue'
import v042 from './Updates/v042.vue'
import v043 from './Updates/v043.vue'
import v044 from './Updates/v044.vue'
import v045 from './Updates/v045.vue'
import v046 from './Updates/v046.vue'
import v047 from './Updates/v047.vue'
import v048 from './Updates/v048.vue'
import v049 from './Updates/v049.vue'
import v050 from './Updates/v050.vue'
import v051 from './Updates/v051.vue'
import v052 from './Updates/v052.vue'
import v053 from './Updates/v053.vue'


export default {
  components: {
    Button: ButtonVue,
    v040, v041, v042, v043, v044, v045, v046, v047, v048, v049, v050,
    v051, v052, v053,
  },
  created() {
    this.diff = this.versionDiff || 0
    this.ver = this.version
    this.$store.commit('updateVersion', this.version)
  },
  data() {
    return {
      ver: '',
      diff: 0,
      versions: [
        '053', '052', '051', '050', '049', '048', '047', '046', '045', '044', '043', '042', '041', '040',
      ]
    }
  },
  methods: {
    parse(str, appendDot = true) {
      let newStr = ''
      let i = 0
      for (const s of str) {
        if (appendDot && i > 0)
          newStr += '.' + s
        else newStr += s
        i++
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

.options-wrapper {
  margin: 16px 0;
  margin-top: 6px;
  max-width: 100%;
  overflow-y: hidden;
  overflow-x: auto;
}

.options {
  display: flex;
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
