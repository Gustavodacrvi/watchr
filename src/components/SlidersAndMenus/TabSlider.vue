<template>
  <div class='wrapper'>
    <div
      class='slider gray round-border'
      :class='theme'
      :style='{width: width}'
    >
      <div class='header'>
        <span v-for='o in options'
          :key='o.name'
          class='option txt border'
          :class='[{active: o.comp === comp}, theme]'
          @click='navigate(o.comp)'
        >{{ o.name }}</span>
      </div>
      <div class='content'>
        <transition name='fade' mode='out-in'>
          <component :is='components[comp]'></component>
        </transition>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import appUtils from '@/utils/app'

interface Option {
  name: string
  comp: string
}

@Component
export default class TabSlider extends Vue {
  @State theme!: string
  @Prop(Array) options!: Option[]
  @Prop(String) width!: string

  comp: string | null = null
  components: any = {}

  created() {
    for (const o of this.options)
      this.components[o.comp] = appUtils.AsyncComponent(import(`./TabSliderComponents/${o.comp}.vue`))
    this.comp = this.options[0].comp
  }

  navigate(comp: string) {
    this.comp = comp
  }
}

</script>

<style scoped>

.slider {
  overflow: hidden;
}

.header {
  display: flex;
  height: 40px;
}

.option {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-basis: 100%;
  transition: background-color .3s;
  cursor: pointer;
  border-left: none;
  border-top: none;
}

.option + .option {
  border-right: none;
}

.option.active {
  color: #FF6B66;
}

.option.dark:hover, .option.dark.active {
  background-color: #282828;
}

.option.light:hover, .option.light.active {
  background-color: #E6E6E6;
}

</style>
