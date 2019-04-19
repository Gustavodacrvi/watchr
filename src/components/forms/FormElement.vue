
<script lang="ts">
import Vue from 'vue';

Vue.directive('v-margin', {
  bind(el, binding) {
    el.style.marginTop = binding.value;
    el.style.marginBottom = binding.value;
  },
});

export default Vue.extend({
  props: {
    type: String,
  },
});
</script>

<style scoped>

div.form-button {
  display: flex;
  justify-content: center;
}

</style>
