<template>
  <div class="Support" :class="platform">
    <div class="search-wrapper">
      <div class="search">
        <InputApp
          class="no-border-down"
          v-model="search"
          :placeholder="l['Search article...']"
          @enter='searchArticle'
        />
        <div class="search-str cbd">
          <div class="path">
            <span class="path-link" @click="$router.push('/support/overview')">Overview </span>
            <transition name="path-t">
              <span class="path-wrapper" v-if="tag || article">
                <span class="break">/ </span>
                <span class="path-link" @click="$router.push('/tag/Tips')">{{ tag }}</span>
                <transition name="path-t">
                  <span class="path-wrapper" v-if="article">
                     <span class="break">/ </span>
                    <span class="path-link">{{ articleName }}</span>
                  </span>
                </transition>
              </span>
            </transition>
          </div>
        </div>
      </div>
    </div>
    <transition name="view-t" mode="out-in">
      <router-view
        :articles='articles'
        :tags='tags'
      />
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
      tags: ['Tips'],
      articles: [
        {
          title: "Keyboard Shortcuts",
          descr: "Add tasks and navigate more easily on desktop using keyboard shortcuts.",
          url: 'keyboard_shortcuts',
          tag: 'Tips',
        }
      ],
    }
  },
  methods: {
    searchArticle() {
      this.$router.push('/support?search=' + this.search)
    }
  },
  computed: {
    ...mapGetters(['l', 'platform']),
    tag() {
      return this.$route.params.tag
    },
    article() {
      return this.$route.params.article
    },
    articleName() {
      const art = this.articles.find(el => el.url === this.article)
      if (art) return art.title
    },
    isSearching() {
      return this.$route.query.search
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
  color: var(--gray);
  transition-duration: .2s;
  cursor: pointer;
}

.path-link:hover {
  color: var(--white);
}

.path-link:active, .break {
  color: var(--gray);
}

.path-wrapper {
  transform: translateY(0);
  display: inline-block;
}

.path-t-enter, .path-t-leave-to {
  opacity: 0;
  transform: translateY(10px);
  transition-duration: .2s;
  transition-timing-function: ease-out;
}

.path-t-leave, .path-t-enter-to {
  opacity: 1;
  transform: translateY(0);
  transition-duration: .2s;
  transition-timing-function: ease-in;
}

</style>
