<template>
  <div class="Support" :class="platform">
    <div class="search-wrapper">
      <div class="search">
        <InputApp
          class="no-border-down"
          v-model="search"
          :placeholder="l['Search article...']"
        />
        <div class="search-str cbd">
          <div class="path">
            <span class="path-link" @click="overview">Overview </span>
            <transition name="path-t">
              <span class="path-wrapper" v-if="tag || article">
                <span class="break">/ </span>
                <span class="path-link" @click="tagPush">{{ tagName }} </span>
                <transition name="path-t">
                  <span class="path-wrapper" v-if="article">
                     <span class="break">/ </span>
                    <span class="path-link">{{ getArticle.title }}</span>
                  </span>
                </transition>
              </span>
            </transition>
          </div>
        </div>
      </div>
    </div>
    <transition name="view-t" mode="out-in">
      <router-view v-if="!isSearching" key="router-view"
        :articles='articles'
        :tags='tags'
        :viewArticles='viewArticles'
        :tag='tag'
        @clear='clear'
      />
      <ArticlesView v-else key="articles-view"
        :viewArticles='viewArticles'
        :tag='tag'
        @clear='clear'
      />
    </transition>
    <div style='height: 300px'></div>
  </div>
</template>

<script>

import InputApp from '@/components/Auth/Input.vue'
import LoadingComponentVue from '../components/Illustrations/LoadingComponent.vue'
import ErrorComponentVue from '../components/Illustrations/ErrorComponent.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    InputApp,
    ArticlesView: () => ({
      component: import(/* webpackChunkName: "home-chunk" */ '../components/Support/ArticlesView.vue'),
      loading: LoadingComponentVue,
      error: ErrorComponentVue,
      delay: 0,
      timeout: 7500,
    }),
  },
  beforeCreate() {
    if (this.$route.fullPath === '/support')
      this.$router.replace('/support/overview')
  },
  data() {
    return {
      search: '',
      tags: ['Tips', 'Lists'],
      articles: [
        {
          title: "Keyboard Shortcuts",
          descr: "Add tasks and navigate more easily on desktop using keyboard shortcuts.",
          url: 'keyboard_shortcuts',
          tag: 'Tips',
        },
        {
          title: "Repeating Tasks",
          descr: "Repeat common tasks every day, every 5 days or weekly.",
          url: 'repeating_tasks',
          tag: 'Tips',
        },
        {
          title: "List templates",
          descr: "Save time by copying and recreating any list, any type of repetive work can be easily reused with templates.",
          url: 'list_templates',
          tag: 'Lists',
        },
      ],
    }
  },
  methods: {
    clear() {
      this.search = ''
    },
    overview() {
      this.clear()
      this.$router.push('/support/overview')
    },
    tagPush() {
      this.clear()
      this.$router.push('/tag/' + this.tagName)
    },
  },
  computed: {
    ...mapGetters(['l', 'platform']),
    tag() {
      return this.$route.params.tag
    },
    article() {
      return this.$route.params.article
    },
    tagName() {
      if (this.tag) return this.tag
      return this.getArticle.tag
    },
    viewArticles() {
      if (!this.isSearching) return this.tagArticles
      return this.searchedArticles
    },
    searchedArticles() {
      return this.articles.filter(art => art.title.includes(this.search))
    },
    tagArticles() {
      return this.articles.filter(art => art.tag === this.tag)
    },
    getArticle() {
      const art = this.articles.find(el => el.url === this.article)
      if (art) return art
    },
    isSearching() {
      return this.search
    },
  },
}

</script>

<style scoped>

.search-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
}

.search {
  flex-basis: 600px;
  margin: 0 10px;
}

.mobile .search {
  margin: 0 18px;
}

.view-t-enter-active, .view-t-leave-active {
  transition-duration: .15s;
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

.search-str {
  height: 42px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  display: flex;
  align-items: center;
}

.path {
  margin-left: 12px;
}

.path-link {
  color: var(--fade);
  transition-duration: .15s;
  cursor: pointer;
}

.path-link:hover {
  color: var(--txt);
}

.path-link:active, .break {
  color: var(--fade);
}

.path-wrapper {
  transform: translateY(0);
  display: inline-block;
}

.path-t-enter, .path-t-leave-to {
  opacity: 0;
  transform: translateY(10px);
  transition-duration: .15s;
  transition-timing-function: ease-out;
}

.path-t-leave, .path-t-enter-to {
  opacity: 1;
  transform: translateY(0);
  transition-duration: .15s;
  transition-timing-function: ease-in;
}

</style>
