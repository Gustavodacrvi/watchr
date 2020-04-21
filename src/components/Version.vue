<template>
  <span class="tag cb cursor" :class="{needsUpdate}" @click.stop="showUpdates">
    <span>{{ parsedVersion }}</span>
    <span v-if="needsUpdate" class="update-diff">+{{versionDiff}}</span>
  </span>  
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  methods: {
    showUpdates() {
      this.$store.dispatch('pushPopup', {
        comp: 'Updates',
      })
    },
  },
  computed: {
    ...mapGetters(['needsUpdate', 'versionDiff', 'parsedVersion']),
    ...mapState(['version', 'lastVersion'])
  }  
}

</script>

<style scoped>

.tag {
  font-size: .85em;
  border-radius: 50px;
  padding: 6px 10px;
  transition-duration: .15s;
  color: var(--fade);
  transform: scale(1,1);
  display: inline-block;
  position: relative;
  overflow: hidden;
}

.tag:hover {
  background-color: var(--light-gray);
}

.tag:active {
  transform: scale(.95,.95);
}

.needsUpdate {
  color: var(--txt);
  border: 1px solid var(--txt);
}

.update-diff {
  margin-left: 2px;
  color: var(--txt);
}

</style>
