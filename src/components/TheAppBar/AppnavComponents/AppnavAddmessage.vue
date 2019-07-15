<template>
  <div class='add-label-alert' @click="$emit('click')">
    <span class='txt pointer icon'>
      <i class='fas fa-plus fa-lg'></i>
      <span>{{ name }}</span>
    </span>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class AppnavMessage extends Vue {
  @Prop(String) name!: string
}

</script>

<style scoped>

.fas {
  margin-right: 20px;
}

.add-label-alert {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

</style>
