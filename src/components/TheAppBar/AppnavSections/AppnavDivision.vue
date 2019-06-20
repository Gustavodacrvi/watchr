<template>
  <div>
    <div class='margin'></div>
    <div class='header'>
      <span class='name txt'>{{ name }}</span>
      <icon class='icon' :class='{showing: showing}' icon='angle-right' @click='showing = !showing' size='1x'></icon>
    </div>
    <div class='margin'></div>
    <transition name='fade'>
      <div v-if='showing' class='content'>
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

@Component({
  components: {
    icon: FontAwesomeIcon,
  },
})
export default class AppnavDivision extends Vue {
  @Prop({type: String, required: true}) public readonly name!: string

  public showing: boolean = true
}

</script>

<style scoped>

.margin {
  height: 10px;
}

.icon {
  transition: transform .3s;
}

.icon.showing {
  transform: rotate(90deg);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header .name {
  margin-left: -5px;
  font-size: .8em;
}

</style>

<style scoped src='@/assets/css/appBarSection.css'>
</style>
