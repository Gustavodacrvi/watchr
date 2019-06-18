<template>
  <div>
    <span class='perspective txt' v-for='pers in smartBindedPerspectives' :key='pers.name'>
      <icon :icon='pers.icon' :color='pers.iconColor'></icon>
      {{ pers.name }}
    </span>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Getter, namespace } from 'vuex-class'

import { Perspective } from '@/interfaces/app'

import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

const perspective = namespace('perspective')

@Component({
  components: {
    icon: FontAwesomeIcon,
  },
})
export default class OverviewAppnav extends Vue {
  @perspective.Getter('smartBindedPerspectives') public readonly smartBindedPerspectives!: Perspective[]

  public perspective: string = 'Inbox'
}

</script>

<style scoped src='@/assets/css/appBarSection.css'>
</style>
