<template>
  <component :is='getComp'/>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import appUtils from '@/utils/app'

import { Perspective } from '../../../interfaces/app'

@Component({
  components: {
    'app-inbox': appUtils.AsyncComponent(import('./AppviewInbox.vue')),
    'app-upcoming': appUtils.AsyncComponent(import('./AppviewUpcoming.vue')),
    'app-today': appUtils.AsyncComponent(import('./AppviewToday.vue')),
    'app-custom': appUtils.AsyncComponent(import('./CustomPerspective.vue')),
  },
})
export default class PerspectiveView extends Vue {
  @Getter activePers!: Perspective

  get getComp() {
    switch (this.comp) {
      case 'inbox': return 'app-' + this.comp
      case 'upcoming': return 'app-' + this.comp
      case 'today': return 'app-' + this.comp
    }
    return 'app-custom'
  }
  get comp() {
    return this.$route.params.persname
  }
}

</script>
