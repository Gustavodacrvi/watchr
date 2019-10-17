<template>
  <div class="Overview" :class="platform">
    <div class="cont">
      <div v-for="area of getHeaderAreas" :key="area.title" class="area">
        <div class="header">
          <h3 class="title cursor" @click="tag(area.title)">{{ area.title }}</h3>
        </div>
        <ul class="list">
          <li v-for="art of area.articles" :key="art.title"
            class="link"
            @click="go(art.url)"
          >{{ art.title }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  props: ['articles', 'tags'],
  methods: {
    go(route) {
      this.$router.push('/article/' + route)
    },
    tag(route) {
      this.$router.push('/tag/' + route)
    },
  },
  computed: {
    ...mapGetters(['platform']),
    getHeaderAreas() {
      const arr = []

      for (const t of this.tags) {
        arr.push({
          title: t,
          articles: this.articles.filter(el => el.tag === t),
        })
      }

      return arr
    },
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
  display: flex;
  justify-content: space-between;
  flex-basis: 850px;
  margin: 0 30px;
  flex-wrap: wrap;
}

.area {
  flex-basis: 375px;
  margin-bottom: 50px;
}

.mobile .area {
  flex-basis: 100%;
}

.link:hover {
  text-decoration: underline;
  cursor: pointer;
}


</style>
