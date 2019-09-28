<template>
  <div class="ActionButtons">
    <Btn
      icon='plus'
      color='white'
    />
  </div>
</template>

<script>

import ActButtonVue from './ActButton.vue'

export default {
  components: {
    Btn: ActButtonVue,
  } 
}

</script>

<style scoped>

.ActionButtons {
  position: absolute;
  bottom: 16px;
  right: 30px;
}

</style>
