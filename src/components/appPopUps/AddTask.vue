<template>
  <div class='card-round' :class='$store.state.theme.style'>
    I am a pop up
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
});
</script>

<style scoped>

.pop-up {
  flex-basis: 400px;
}

</style>
