<template>
  <div
    class="ProfileImg shadow"
    :class="{nosrc}"
    :style='style'
  >
    <Icon v-if="!src" icon="user" width="65%"/>
  </div>
</template>

<script>

import IconVue from '../Icon.vue'

export default {
  props: ['src'],
  components: {
    Icon: IconVue,
  },
  computed: {
    nosrc() {
      return !this.src
    },
    style() {
      return `background-image: url("${this.src}");`
    },
  },
}

</script>

<style scoped>

.ProfileImg {
  display: inline-block;
  border-radius: 150px;
  overflow: hidden;
  background-position: center;
  background-size: cover;
}

.nosrc {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background-color: var(--card);
  color: var(--light-gray);
}

</style>
