<template>
  <div class="Update popup cb shadow rb scroll-thin" :class="layout">
    <div class="title tac">
      <h3 class="pc">What's new - {{parse(ver)}}</h3>
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
import v054 from './Updates/v054.vue'
import v055 from './Updates/v055.vue'
import v056 from './Updates/v056.vue'
import v057 from './Updates/v057.vue'
import v058 from './Updates/v058.vue'
import v059 from './Updates/v059.vue'
import v060 from './Updates/v060.vue'
import v061 from './Updates/v061.vue'
import v062 from './Updates/v062.vue'
import v063 from './Updates/v063.vue'
import v064 from './Updates/v064.vue'
import v065 from './Updates/v065.vue'
import v066 from './Updates/v066.vue'
import v067 from './Updates/v067.vue'
import v068 from './Updates/v068.vue'
import v069 from './Updates/v069.vue'
import v070 from './Updates/v070.vue'
import v071 from './Updates/v071.vue'
import v072 from './Updates/v072.vue'
import v073 from './Updates/v073.vue'
import v074 from './Updates/v074.vue'
import v075 from './Updates/v075.vue'
import v076 from './Updates/v076.vue'
import v077 from './Updates/v077.vue'
import v078 from './Updates/v078.vue'
import v079 from './Updates/v079.vue'
import v080 from './Updates/v080.vue'
import v081 from './Updates/v081.vue'
import v082 from './Updates/v082.vue'
import v083 from './Updates/v083.vue'
import v084 from './Updates/v084.vue'
import v085 from './Updates/v085.vue'
import v086 from './Updates/v086.vue'
import v087 from './Updates/v087.vue'
import v088 from './Updates/v088.vue'
import v089 from './Updates/v089.vue'
import v090 from './Updates/v090.vue'
import v091 from './Updates/v091.vue'
import v092 from './Updates/v092.vue'
import v093 from './Updates/v093.vue'
import v094 from './Updates/v094.vue'
import v095 from './Updates/v095.vue'
import v096 from './Updates/v096.vue'
import v097 from './Updates/v097.vue'
import v098 from './Updates/v098.vue'

export default {
  components: {
    Button: ButtonVue,
    v040, v041, v042, v043, v044, v045, v046, v047, v048, v049, v050,
    v051, v052, v053, v054, v055, v056, v057, v058, v059, v060, v061,
    v062, v063, v064, v065, v066, v067, v068, v069, v070, v071, v072,
    v073, v074, v075, v076, v077, v078, v079, v080, v081, v082, v083,
    v084, v085, v086, v087, v088, v089, v090, v091, v092, v093, v094,
    v095, v096, v097, v098
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
        '098', '097', '096', '095', '094', '093', '092', '091', '090', '089', '088', '087', '086', '085', '084', '083', '082', '081', '080', '079', '078', '077', '076', '075', '074', '073', '072', '071', '070', '069', '068', '067', '066', '065', '064', '063', '062', '061', '060', '059', '058', '057', '056', '055', '054', '053', '052', '051', '050', '049', '048', '047', '046', '045', '044', '043', '042', '041', '040',
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
    ...mapGetters(['layout', 'versionDiff']),
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
  max-height: 450px;
}

.Update {
  overflow: auto;
  flex-basis: 1000px;
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
  color: var(--fade);
  border: none;
}

.opt:hover {
  background-color: var(--light-gray);
}

.hasToRead {
  color: var(--txt);
}

.opt.active {
  border: 1px solid var(--primary);
  color: var(--primary);
}

.comp {
  overflow: auto;
}

.opt + .opt {
  margin-left: 4px;
}

h1, h2, h3, h4, h5, h6 {
  color: var(--primary);
}

</style>
