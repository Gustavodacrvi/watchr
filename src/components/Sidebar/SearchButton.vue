<template>
  <div class="SearchButton rb cursor"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
    @click="$emit('click')"
    :class="layout"
  >
    <div>
      <Icon class="search" icon="search" width="16px"/>
      <span class="search-msg">Search</span>
    </div>
  </div>
</template>

<script>


import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['layout']),
  }
}

</script>

<style scoped>

.SearchButton {
  height: 25px;
  background-color: var(--dark);
  transition: background-color .175s;
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
  background-color: var(--card);
}

</style>
