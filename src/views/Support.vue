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
  </div>
</template>

<script>

import InputApp from '@/components/Auth/Input.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    InputApp,
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
  height: 100px;
}

.search {
  flex-basis: 600px;
  margin: 0 10px;
}

.mobile .search {
  margin: 0 18px;
}

</style>
