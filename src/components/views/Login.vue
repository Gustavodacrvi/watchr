<template>
  <div>
    <div>
      <app-form>
        <heading :lvl='1'>fdasf</heading>
      </app-form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Form from './../Form.vue';
import Heading from './../Heading.vue';

export default Vue.extend({
  components: {
    'app-form': Form,
    'heading': Heading,
  },
});
</script>

<style scoped>

div {
  display: flex;
  justify-content: center;
}

div > div {
  margin-top: 40px;
}

</style>
