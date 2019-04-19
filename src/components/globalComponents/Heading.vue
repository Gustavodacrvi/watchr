
<script lang="ts">
import Vue from 'vue';

Vue.directive('align', {
  bind(el) {
    el.style.marginLeft = 'auto';
    el.style.marginRight = 'auto';
  },
});

export default Vue.extend({
  props: {
    lvl: Number,
  },
  render(createElement) {
    return createElement(
      'h' + this.lvl,
      {
        attrs: {
          class: this.$store.getters.style('heading'),
        },
      },
      this.$slots.default,
    );
  },
});
</script>


