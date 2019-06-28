<template>
  <div class='wrapper'>
    <div class='slider gray' :class='theme' :style='{width: width}'>
      asd
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

interface Option {
  name: string
  comp: string
}

@Component
export default class TabSlider extends Vue {
  @State theme!: string
  @Prop(Array) options!: Option[]
  @Prop(String) width!: string
}

</script>
