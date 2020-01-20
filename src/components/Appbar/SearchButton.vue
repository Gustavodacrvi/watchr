<template>
  <div class="SearchButton rb cursor"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
    @click="$emit('click')"
    :class="platform"
  >
    <div>
      <Icon class="search" icon="search" width="16px"/>
      <span class="search-msg">{{ l['Search'] }}</span>
    </div>
    <CircleBubble
      innerColor='var(--light-gray)'
      outerColor='var(--fade)'
      opacity='0'
    />
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
  background-color: var(--card);
  transition: background-color .15s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.SearchButton.mobile {
  height: 42px;
}

.search-msg {
  margin-left: 8px;
}

.search {
  display: inline-block;
}

.SearchButton:hover {
  background-color: var(--light-gray);
}

</style>
