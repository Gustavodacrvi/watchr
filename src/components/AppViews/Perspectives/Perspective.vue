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
    // tslint:disable-next-line:max-line-length
    'app-inbox': appUtils.AsyncComponent(import(/* webpackChunkName: "app-view-inbox" */ './AppviewInbox.vue')),
    // tslint:disable-next-line:max-line-length
    'app-custom': appUtils.AsyncComponent(import(/* webpackChunkName: "app-view-perspective" */ './CustomPerspective.vue')),
  },
})
export default class PerspectiveView extends Vue {
  @Getter activePers!: Perspective

  get getComp() {
    if (this.comp === 'inbox')
      return 'app-' + this.comp
    return 'app-custom'
  }
  get comp() {
    return this.$route.params.persname
  }
}

</script>
