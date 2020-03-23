
<template>
  <div class="Tag">
    <div class="articles">
      <h1 class="title">{{ tag }}</h1>
      <transition-group name="art-t"
        @enter='enter'
        @leave='leave'
      >
        <div v-for="art of viewArticles" :key="art.title" class="art">
          <h2 class="art-title cursor" @click="select(art.url)">{{ art.title }}</h2>
          <p>{{ art.descr }}</p>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>

export default {
  props: ['viewArticles', 'tag'],
  methods: {
    select(url) {
      this.$emit('clear')
      this.$router.push('/article/' + url)
    },
    enter(el) {
      const s = el.style
      const height = el.offsetHeight + 'px'
      const title = el.getElementsByClassName('art-title')[0]

      s.transitionDuration = '0s'
      title.style.transitionDuration = '0s'
      title.style.margin = 0
      s.height = 0
      s.margin = 0
      s.opacity = 0
      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        title.style.transitionDuration = '.2s'
        s.height = height
        title.style.margin = '8px 0'
        s.marginBottom = '35px'
        s.opacity = 1
      })
    },
    leave(el) {
      const s = el.style
      const title = el.getElementsByClassName('art-title')[0]

      s.height = 0
      s.margin = 0
      s.opacity = 0
      title.style.margin = 0
    },
  }
}

</script>

<style scoped>

.Tag {
  display: flex;
  justify-content: center;
}

.articles {
  flex-basis: 650px;
  margin: 0 12px;
}

.title {
  margin: 35px 0;
}

.art {
  margin-bottom: 35px;
}

.art-title {
  color: var(--primary);
  margin: 8px 0;
}

.art-title:hover {
  text-decoration: underline;
}

</style>
