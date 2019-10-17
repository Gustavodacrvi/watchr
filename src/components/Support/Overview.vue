<template>
  <div class="Overview" :class="platform">
    <div class="cont">
      <div class="region">
        <div class="area">
          <div class="header">
            <h3 class="title cursor" @click="tag('tips')">Tips</h3>
          </div>
          <ul class="list">
            <li class="link" @click="go('keyboard_shortcuts')">Keyboard Shortcuts</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['platform']),
  },
  methods: {
    go(route) {
      this.$router.push('/' + route)
    },
    tag(route) {
      this.$router.push('/tag/' + route)
    }
  }
}

</script>

<style scoped>

.Overview {
  display: flex;
  justify-content: center;
}

.header {
  border: none;
  border-bottom: 1px solid var(--light-gray);
}

.area {
  flex-basis: 375px;
}

.list {
  padding: 0 26px;
  font-size: 1.05em;
}

.title {
  margin: 12px 0;
  color: var(--primary);
  display: inline-block;
}

.title:hover {
  text-decoration: underline;
}

.cont {
  flex-basis: 850px;
  margin: 0 30px;
}

.link:hover {
  text-decoration: underline;
  cursor: pointer;
}

.region {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.region + .region {
  margin-top: 50px;
}

.mobile .area {
  flex-basis: 100%;
}

</style>
