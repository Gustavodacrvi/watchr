<template>
  <div class='element'>
    <div class='content'>
      <span class='txt'>{{ obj[objectTitlePropertyName] }}</span>
    </div>
    <div class='drop'>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'


@Component
export default class ListRenderer extends Vue {
  @Prop(Object) obj!: object
  @Prop(String) objectTitlePropertyName!: string

  created() {
    
  }
}

</script>

<style scoped>

</style>
