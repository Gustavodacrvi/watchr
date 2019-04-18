<template>
  <div>
    <div>
      <app-form>
        asdfasdf
      </app-form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Form from './../Form.vue';

export default Vue.extend({
  components: {
    'app-form': Form,
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
