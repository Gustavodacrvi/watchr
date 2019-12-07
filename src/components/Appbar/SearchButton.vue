<template>
  <div class="SearchButton rb cursor"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
    @click="$emit('click')"
    :class="platform"
  >
    <div>
      <Icon icon="search" width="15px"/>
      <span class="search-msg">{{ l['Search'] }}</span>
    </div>
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
    ...mapGetters(['l', 'platform']),
  }
}

</script>

<style scoped>

.SearchButton {
  height: 35px;
  background-color: var(--light-gray);
  transition: background-color .15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.SearchButton.mobile {
  height: 42px;
}

.search-msg {
  margin-left: 8px;
}

.SearchButton:hover {
  background-color: var(--gray);
}

</style>
