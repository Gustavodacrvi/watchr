<template>
  <div>
    <div class='margin'></div>
    <div class='division'>
      <span class='name txt'>CUSTOM LABELS</span>
    </div>
    <div class='margin'></div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'

@Component
export default class AppnavDivision extends Vue {}

</script>

<style scoped>

.margin {
  height: 10px;
}

.division {
  background-color: red;
}

.division .name {
  margin-left: -8px;
  font-size: .7em;
}

</style>

<style scoped src='@/assets/css/appBarSection.css'>
</style>
