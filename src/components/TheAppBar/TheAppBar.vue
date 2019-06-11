<template>
  <div class='wrapper gray' :class='theme' @click='$emit("click")'>
    <div class='relatives'>

    </div>
  </div>
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class TheNavBar extends Vue {
  @State('theme') public readonly theme!: string
}

</script>

<style scoped>

.wrapper {
  width: 320px;
}

</style>
