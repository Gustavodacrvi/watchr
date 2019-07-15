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
    'app-Inbox': appUtils.AsyncComponent(import('./AppviewInbox.vue')),
    'app-Upcoming': appUtils.AsyncComponent(import('./AppviewUpcoming.vue')),
    'app-Today': appUtils.AsyncComponent(import('./AppviewToday.vue')),
    'app-custom': appUtils.AsyncComponent(import('./CustomPerspective.vue')),
  },
})
export default class PerspectiveView extends Vue {
  @Getter activePers!: Perspective

  get getComp() {
    switch (this.comp) {
      case 'Inbox': return 'app-' + this.comp
      case 'Upcoming': return 'app-' + this.comp
      case 'Today': return 'app-' + this.comp
    }
    return 'app-custom'
  }
  get comp() {
    return this.$route.params.persname
  }
}

</script>
