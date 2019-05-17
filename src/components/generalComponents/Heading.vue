
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    lvl: Number,
    noMargin: Boolean,
    inline: Boolean,
  },
  render(createElement) {
    let classes = 'heading ' + this.$store.state.theme.style;
    if (this.noMargin) {
      classes += ' no-margin';
    }
    if (this.inline) {
      classes += ' inline';
    }
    return createElement(
      'h' + this.lvl,
      {
        attrs: {
          class: classes,
        },
      },
      this.$slots.default,
    );
  },
});
</script>

<style scoped>

.heading {
  color: #A97CFC;
  text-shadow: 0 0 1px #A97CFC;
  margin: 15px 0;
}

.no-margin {
  margin: 0;
}

.inline {
  display: inline-block;
}

</style>
