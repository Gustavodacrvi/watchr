<template>
  <component :pers='pers' :is='getComp'/>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
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

  @Prop(String) pers!: string

  get getComp() {
    switch (this.pers) {
      case 'Inbox': return 'app-' + this.pers
      case 'Upcoming': return 'app-' + this.pers
      case 'Today': return 'app-' + this.pers
    }
    return 'app-custom'
  }
}

</script>
