<template>
  <span class='fontawesome-icon' @click='$emit("click")' :class='{blink: blink}'>
    <span v-if='!stack' class='txt'>
      <i v-if='!spin' :class='`fas fa-${icon} fa-${size}`'></i>
      <i v-else :class='`fas fa-${icon} fa-${size} fa-spin`'></i>
    </span>
    <span v-else :class='`fa-stack txt`'>
      <template v-for='i in stack'>
        <i v-if='!i.color' :key='i.icon' :class='`fas fa-${i.icon} fa-stack-${i.size}`'></i>
        <i v-else :key='i.icon' :class='`fas fa-${i.icon} fa-stack-${i.size}`' :style='`color: ${i.color}`'></i>
      </template>
    </span>
  </span>
</template>

<script lang="ts">

import { Vue, Component } from 'vue-property-decorator'

@Component({
  props: {
    size: {
      type: String,
      default: 'lg',
    },
    blink: Boolean,
    spin: Boolean,
    icon: String,
    stack: Array,
  },
})
export default class App extends Vue {

}

</script>

<style scoped>

.fontawesome-icon:hover .fas {
  color: #A97CFC;
  text-shadow: 0 0 1px #A97CFC;
  transition: color .3s;
  cursor: pointer;
}

.blink:active .fas {
  color: white;
}

</style>
