<template>
  
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class ListRenderer extends Vue {
  @Prop() list!: any[]

  
}

</script>

<style scoped>

</style>
