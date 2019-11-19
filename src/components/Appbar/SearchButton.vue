<template>
  <div class="SearchButton rb cursor"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
    @click="$emit('click')"
  >
    <span>
      <Icon icon="search" width="15px"/>
      <span class="search-msg">{{ l['Search'] }}</span>
    </span>
  </div>
</template>

<script>

import IconVue from '@/components/Icon.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    Icon: IconVue,
  },
  computed: {
    ...mapGetters(['l']),
  }
}

</script>

<style scoped>

.SearchButton {
  height: 35px;
  background-color: var(--light-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color .15s;
}

.search-msg {
  margin-left: 8px;
}

.SearchButton:hover {
  background-color: var(--gray);
}

</style>
