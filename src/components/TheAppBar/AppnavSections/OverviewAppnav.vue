<template>
  <div>
    <div class='list-el' v-for='pers in smartBindedPerspectives' :key='pers.key'>
      <div class='round-border visible' :class='[theme, {active: pers.name === perspective}]'>
        <div class='content'>
          <span class='left-icon'>
            <icon :icon='pers.icon' :color='pers.iconColor'></icon>
          </span>
          <span class='txt name'>{{ pers.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Getter, State, namespace } from 'vuex-class'

import { Perspective } from '@/interfaces/app'

import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

const perspective = namespace('perspective')

@Component({
  components: {
    icon: FontAwesomeIcon,
  },
})
export default class OverviewAppnav extends Vue {
  @State('theme') public readonly theme!: string
  @perspective.Getter('smartBindedPerspectives') public readonly smartBindedPerspectives!: Perspective[]

  public perspective: string = 'Today'
}

</script>

<style scoped src='@/assets/css/appBarSection.css'>
</style>
