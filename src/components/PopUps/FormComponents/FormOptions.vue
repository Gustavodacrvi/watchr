<template>
  <div class='form-options'>
    <div class='header-wrapper' @click='showing = !showing'>
      <div class='header'>
        <span class='txt'>
          {{ selected }}
        </span>
        <i class='fas fa-angle-right fa-sm' :class='{rotate: showing}'></i>
      </div>
    </div>
    <transition name='fade'>
      <div v-if='showing' class='options'>
        <span v-for='str in options'
          :key='str'
        >{{ str }}</span>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class FormOptions extends Vue {
  @Prop(String) selected!: string
  @Prop(String) maxHeight!: string
  @Prop(Array) options!: string[]

  showing: boolean = false
}

</script>

<style scoped>

.form-options {

}

.header {
  margin: 6px;
}

.fas {
  transition: transform .3s; 
}

.rotate {
  transform: rotate(-90deg);
}

</style>
