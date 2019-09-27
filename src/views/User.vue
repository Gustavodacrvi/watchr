<template>
  <div class="User" :class="[{appbarHided}, platform]">
    <div v-if="isDesktop" class="nav">
      <Appbar
        :value="value"
        :view-type="viewType"
        @appbar="toggleAppbar"
        @section="v => section = v"
      />
      <IconDrop v-if="getSectionOptions && !appbarHided"
        class="drop right"
        handle='settings-h'
        handleColor='var(--gray)'
        :options="getSectionOptions"
      />
    </div>
    <div class="cont">
      <TasksView
        :smart="isSmart"
        :view-type="viewType"
        :value="value"
        :headingsRenderer='isHeadingsRendererType'
      />
    </div>
  </div>
</template>

<script>

import AppbarVue from '../components/Appbar/Appbar.vue'
import TasksViewVue from '../components/View/TasksView.vue'
import IconDropVue from '../components/IconDrop.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    Appbar: AppbarVue,
    IconDrop: IconDropVue,
    TasksView: TasksViewVue,
  },
  data() {
    return {
      viewType: null,
      value: null,
      appbarHided: false,
      section: 'Lists',
    }
  },
  created() {
    this.updateViewType()
  },
  methods: {
    toggleAppbar(isHided) {
      this.appbarHided = isHided
    },
    updateViewType() {
      const query = this.$route.query
      const keys = Object.keys(query)
      let viewType = keys[0]
      let value = query[viewType]
      if (viewType === undefined || value === undefined)
        this.$router.replace('/user?list=Today')
      this.value = value
      this.viewType = viewType
    }
  },
  computed: {
    ...mapGetters(['platform', 'isDesktop']),
    isSmart() {
      if (this.viewType !== 'list') return false
      switch (this.value) {
        case 'Today': return true
        case 'Upcoming': return true
        case 'Tomorrow': return true
        case 'Inbox': return true
      }
      return false
    },
    getSectionOptions() {
      return this[this.section]
    },
    Tags() {
      const dispatch = this.$store.dispatch
      return [
        {
          name: 'Sort tags',
          icon: 'sort',
          callback: () => [
            {
              name: 'Sort tags by name',
              icon: 'sort-name',
              callback: () => dispatch('tag/sortTagsByName')
            },
            {
              name: 'Sort tags by frequency',
              icon: 'fire',
              callback: () => dispatch('tag/sortTagsByFrequency')
            }
          ]
        },
        {
          name: 'Add tag',
          icon: 'tag',
          callback: () => dispatch('pushPopup', {comp: 'AddTag'})
        }
      ]
    },
    Lists() {
      const dispatch = this.$store.dispatch
      return [
        {
          name: 'Add list',
          icon: 'tasks',
          callback: () => dispatch('pushPopup', {comp: 'AddList'}),
        },
        {
          name: 'Sort lists by name',
          icon: 'sort-name',
          callback: () => dispatch('list/sortListsByName'),
        }
      ]
    },
    Filters() {
      const dispatch = this.$store.dispatch
      return [
        {
          name: 'Add filter',
          icon: 'filter',
          callback: () => dispatch('pushPopup', {comp: 'AddFilter'}),
        },
        {
          name: 'Sort lists by name',
          icon: 'sort-name',
          callback: () => dispatch('list/sortFiltersByName'),
        }
      ]
    },
    isHeadingsRendererType() {
      return this.value === 'Upcoming'
    },
  },
  watch: {
    $route() {
      this.updateViewType()
    }
  }
}

</script>

<style scoped>

.User {
  margin: 8px 60px;
  display: flex;
  justify-content: center;
  transition-delay: .4s;
}

.drop {
  position: fixed;
  bottom: 10px;
  left: 323px;
}

.User.mobile {
  margin: 30px 0;
}

.nav {
  flex-basis: 400px;
  max-width: 400px;
  min-height: 100%;
  transition-duration: .6s;
  transition-delay: 0s;
}

.cont {
  flex-basis: 100%;
  transition-delay: .4s;
  transition-duration: .6s;
}

.appbarHided .nav {
  flex-basis: 0;
  max-width: 0;
  transition-delay: .6s;
  transition-duration: .6s;
}

.appbarHided .cont {
  flex-basis: 925px;
}

</style>
