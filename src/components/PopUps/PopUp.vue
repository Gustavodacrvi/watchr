<template>
  
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class PopUp extends Vue {
  @State('popUpComponent') public readonly popUp!: string
}

</script>

<style scoped>

</style>
