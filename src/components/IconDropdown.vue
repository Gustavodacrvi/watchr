<template>
  <span class='icon-dropdown' @mouseenter='showing = !showing' @mouseleave='showing = !showing'>
    <icon :icon='handle'></icon>
    <transition name='fade'>
      <div v-show='showing' class='card round-border content' :class='theme'>
        <slot></slot>
      </div>
    </transition>
  </span>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'
import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

@Component({
  components: {
    icon: FontAwesomeIcon,
  },
  props: {
    handle: {
      type: String,
      required: true,
    },
  },
})
export default class TheNavbar extends Vue {
  @State('theme') public theme!: string

  public showing: boolean = false
}

</script>

<style scoped>

.icon-dropdown {
  position: relative;
}

.content {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 250px;
}

</style>
