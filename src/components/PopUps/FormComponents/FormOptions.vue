<template>
  <div class='form-options'>
    <div class='header-wrapper round-border border-card' :class='[theme, {open: showing}]' @click='showing = !showing'>
      <div class='header'>
        <span class='txt'>
          {{ selected }}
        </span>
        <span class='icon'>
          <i class='fas fa-angle-right fa-sm' :class='{rotate: showing}'></i>
        </span>
      </div>
    </div>
    <transition name='fade'>
      <div v-if='showing' class='drop card round-border' :class='theme'>
        <div v-for='str in options'
          class='el'
          :class='[theme, {selected: str === selected}]'
          :key='str'
          @click="$emit('select', str)"
        >
          <span class='el-name' style='margin-left: 4px'>{{ str }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class FormOptions extends Vue {
  @State theme!: string
  
  @Prop(String) selected!: string
  @Prop(String) maxHeight!: string
  @Prop(Array) options!: string[]

  showing: boolean = false
}

</script>

<style scoped>

.header-wrapper.dark:hover, .header-wrapper.dark.open {
  background-color: #282828;
}

.header-wrapper.light:hover, .header-wrapper.light.open {
  background-color: #e3e3e3;
}

.form-options {
  position: relative;
}

.header-wrapper {
  cursor: pointer;
  transition: background-color .3s;
}

.header {
  margin: 8px;
  position: relative;
}

.icon {
  position: absolute;
  right: 3px;
  top: 50%;
  transform: translateY(-50%);
}

.fas {
  transition: transform .3s; 
}

.rotate {
  transform: rotate(-90deg);
}

.drop {
  position: absolute;
  width: 100%;
  top: 115%;
}

</style>

<style scoped src='@/assets/css/drop.css'>
</style>
