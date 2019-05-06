
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
          class: 'heading ' + this.$store.state.theme.style,
        },
      },
      this.$slots.default,
    );
  },
});
</script>

<style scoped>

.heading {
  color: #FE684F;
  margin: 15px 0;
}

</style>
