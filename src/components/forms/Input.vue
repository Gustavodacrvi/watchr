<template>
  <div>
    <div>
      <input class='input' :name='name' :placeholder='placeholder' :type='type' autocomplete='off'/>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    name: String,
    placeholder: String,
    max: Number,
    type: String,
  },
});
</script>

<style scoped>


</style>
