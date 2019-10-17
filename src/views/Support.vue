<template>
  <div class="Support" :class="platform">
    <div class="search-wrapper">
      <div class="search">
        <InputApp
          v-model="search"
          :placeholder="l['Search article...']"
        />
      </div>
    </div>
    <transition name="view-t" mode="out-in">
      <router-view/>
    </transition>
  </div>
</template>

<script>

import InputApp from '@/components/Auth/Input.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    InputApp,
  },
  beforeCreate() {
    if (this.$route.fullPath === '/support')
      this.$router.replace('/support/overview')
  },
  data() {
    return {
      search: '',
      articles: [
        {
          title: "Keyboard Shortcuts",
          descr: "Add tasks and navigate more easily on desktop using keyboard shortcuts",
          tag: 'Guide',
        }
      ],
    }
  },
  computed: {
    ...mapGetters(['l', 'platform']),
  },
}

</script>

<style scoped>

.search-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 125px;
}

.search {
  flex-basis: 600px;
  margin: 0 10px;
}

.mobile .search {
  margin: 0 18px;
}

.view-t-enter-active, .view-t-leave-active {
  transition-duration: .2s;
}

.view-t-enter, .view-t-leave-to {
  opacity: 0;
  transform: translateY(10px);
  transition-timing-function: ease-out;
}

.view-t-leave, .view-t-enter-to {
  opacity: 1;
  transform: translateX(0px);
  transition-timing-function: ease-in;
}

</style>
