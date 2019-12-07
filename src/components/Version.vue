<template>
  <div class="tag cb cursor" :class="{needsUpdate}" @click="showUpdates">
    <span>{{ parsedVersion }}</span>
    <span v-if="needsUpdate" class="update-diff">+{{versionDiff}}</span>
  </div>  
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  computed: {
    ...mapGetters(['needsUpdate', 'versionDiff', 'parsedVersion']),
    ...mapState(['version', 'lastVersion'])
  }  
}

</script>

<style scoped>

.tag {
  font-size: .9em;
  border-radius: 50px;
  padding: 8px 12px;
  transition-duration: .15s;
  color: var(--gray);
  transform: scale(1,1);
}

.tag:hover {
  background-color: var(--light-gray);
}

.tag:active {
  transform: scale(.95,.95);
}

.needsUpdate {
  color: var(--white);
  border: 1px solid var(--white);
}

.update-diff {
  margin-left: 8px;
  color: var(--white);
}

</style>
