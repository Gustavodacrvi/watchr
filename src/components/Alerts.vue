<template>
  <div class='wrapper'>
    <div class='relative'>

    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'

@Component
export default class LabelAdder extends Vue {

}

</script>

<style scoped>

.wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
}

.relative {
  position: relative;
  width: 100%;
  height: 100%;
}

</style>
