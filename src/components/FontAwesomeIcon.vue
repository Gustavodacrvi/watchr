<template>
  <span v-if='!stack' class='fontawesome-icon txt'>
    <i v-if='!spin' :class='`fas fa-${icon} fa-${size}`'></i>
    <i v-else :class='`fas fa-${icon} fa-${size} fa-spin`'></i>
  </span>
  <span v-else :class='`fontawesome-icon fa-stack txt`'>
    <template v-for='i in stack'>
      <i v-if='!i.color' :key='i.icon' :class='`fas fa-${i.icon} fa-stack-${i.size}`'></i>
      <i v-else :key='i.icon' :class='`fas fa-${i.icon} fa-stack-${i.size}`' :style='`color: ${i.color}`'></i>
    </template>
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
    spin: Boolean,
    icon: String,
    stack: Array,
  },
})
export default class App extends Vue {

}

</script>

<style scoped>

</style>
