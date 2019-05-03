
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    lvl: Number,
  },
  render(createElement) {
    return createElement(
      'h' + this.lvl,
      {
        attrs: {
          class: 'heading ' + this.$store.state.style,
        },
      },
      this.$slots.default,
    );
  },
});
</script>


