<template>
  <transition appear name="card-t">
    <div class="FastSearch" @click="close">
      <div class="cb rb card shadow scroll-thin" @click.stop>
        <div class="cont">
          <InputApp
            :focus='true'
            v-model="search"
            :placeholder="placeholder"
            @keydown="keydown"
            @cancel="$emit('close')"
          />
          <div>
            <transition-group name="trans"
              @enter='enter'
              @leave='leave'
              class="options"
              tag="div"
            >
              <div
                key="CONTIUE_SEARCH"
                class="option rb cursor fixed"
                :class="{active: isDefault, isDesktopDevice}"
                @click="continueSearch"
              >
                <div class="icon-wrapper">
                  <Icon icon='search' class="icon" color="var(--txt)"/>
                </div>
                <span class="name-wrapper">
                  <span class="name">Continue Search</span>
                </span>
              </div>
              <div v-for="o in searchResults"
                :key="o.id"
                class="option rb cursor"
                :class="{active: isActive(o)}"
                @click="click(o.callback)"
              >
                <div class="icon-wrapper">
                  <Icon :icon='o.icon' class="icon" :color="o.iconColor"/>
                </div>
                <span class="name-wrapper">
                  <span class="name">{{ o.name }}</span>
                </span>
              </div>
            </transition-group>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>

import InputVue from '@/components/Auth/Input.vue'

import { mapState, mapGetters } from 'vuex'

export default {
  props: ['payload'],
  components: {
    InputApp: InputVue,
  },
  data() {
    return {
      search: '',
      active: {
        name: null,
        icon: null,
      },
      searchNumber: 0,
    }
  },
  methods: {
    goToDefault() {
      this.active = {
        name: null,
        icon: null,
      }
    },
    continueSearch() {
      if (this.searchResults.length === 0)
        this.searchNumber = 0
      else
        this.searchNumber++
    },
    enter(el) {
      const height = el.offsetHeight
      const s = el.style

      s.transitionDuration = 0
      s.height = 0
      requestAnimationFrame(() => {
        s.transitionDuration = '.15s'
        s.height = `${this.isDesktopDevice ? 20 : 35}px`
      })
    },
    leave(el) {
      const s = el.style

      s.height = 0
    },
    click(callback) {
      this.close()
      if (callback) callback()
    },
    close() {
      this.$store.dispatch('closePopup', true)
    },
    allow(str) {
      if (!this.payload || !this.payload.allowed)
        return true
      return this.payload.allowed.find(s => s === str)
    },
    isActive(el) {
      return this.active.name === el.name && this.active.icon === el.icon
    },
    move(dir) {
      const { active } = this
      const options = this.searchResults
      
      const i = options.findIndex(this.isActive)

      let ind
      if (dir === 'up')
        ind = i - 1 
      else ind = i + 1

      if (ind === -1)
        this.goToDefault()
      else if (options[ind])
        this.active = options[ind]
      else
        this.goToDefault()
    },
    keydown({key}) {
      if (key === 'ArrowUp') {
        this.move('up')
      } else if (key === 'ArrowDown') {
        this.move('down')
      } else if (key === 'Enter') {
        if (this.isDefault)
          this.continueSearch()
        else
          this.click(this.active.callback)
      }
    }
  },
  computed: {
    ...mapState({
      groups: state => state.group.groups,
    }),
    ...mapGetters({
      isDesktopDevice: 'isDesktopDevice',
      sidebarElements: 'sidebarElements',
      lists: 'list/lists',
      tags: 'tag/tags',
      folders: 'folder/folders',
      isStandAlone: 'isStandAlone',
      tasks: 'task/tasks',
    }),
    isDefault() {
      return this.active.name === null && this.active.icon === null
    },
    getOptions() {
      const { search, tasks, tags, lists, folders, sidebarElements, groups } = this
      if (!search) return []
      const lower = search.toLowerCase()
      const arr = []

      const filter = arr => arr.filter(el => el && el.name && el.name.toLowerCase().includes(lower))

      const tg = filter(tags)
      const lt = filter(lists)
      const gr = filter(groups)
      const ts = filter(tasks)
      const fs = filter(folders)
      const vs = filter(sidebarElements)

      const go = this.hasCallback ? this.payload.callback : route => this.$router.push(route)

      const a = this.allow

      if (a('smartViews'))
        for (const v of vs)
          arr.push({
            ...v,
            id: v.name + 'UNIQUE_SMART_VIEW' + Date.now(),
            callback: () => go('/user?list=' + v.name, v)
          })
      if (a('tags'))
        for (const t of tg)
          arr.push({
            name: t.name,
            icon: 'tag',
            id: t.id,
            color: 'var(--red)',
            callback: () => go('/user?tag=' + t.name, t)
          })
      if (a('gr'))
        for (const g of gr)
          arr.push({
            name: g.name,
            icon: 'group',
            id: g.id,
            callback: () => go('/user?group=' + g.name, g)
          })
      if (a('folders'))
        for (const f of fs)
          arr.push({
            name: f.name,
            icon: 'folder',
            id: f.id,
            color: '',
            callback: () => go('/user?folder=' + f.name, f)
          })
      if (a('lists'))
        for (const l of lt)
          arr.push({
            name: l.name,
            icon: 'tasks',
            id: l.id,
            color: 'var(--primary)',
            callback: () => go('/user?list=' + l.name, l)
          })
      if (a('tasks'))
        for (const t of ts)
          arr.push({
            name: t.name,
            icon: 'circle-check',
            id: t.id,
            callback: () => go('/user?search=' + t.name, t)
          })

      return arr
    },
    searchResults() {
      const begin = this.searchNumber * 10
      return this.getOptions.slice(begin, begin + 10)
    },
    hasCallback() {
      return this.payload && this.payload.callback
    },
    placeholder() {
      if (this.onlyTasks)
        return 'Search task...'
      return 'Search for tags, lists, folders and tasks...'
    },
  },
}

</script>

<style scoped>

.FastSearch {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 499;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.card {
  flex-basis: 500px;
  margin: 0 15px;
  margin-top: 60px;
  overflow: auto;
  max-height: 400px;
}

.card.isStandAlone {
  margin-top: 120px;
}

.cont {
  margin: 8px;
}

.options {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
}

.option {
  width: 100%;
  display: flex;
  background-color: none;
  transition-duration: .15s;
}

.option:hover, .active {
  background-color: var(--light-gray);
}

.icon-wrapper {
  flex-basis: 35px;
  height: 100%;
  position: relative;
}

.icon {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
}

.fixed {
  margin-bottom: 12px;
  height: 35px;
}

.fixed.isDesktopDevice {
  height: 20px;
}

.name-wrapper {
  display: flex;
  align-items: center;
  flex-basis: 100%;
  padding-right: 4px;
  position: relative;
}

.name {
  position: absolute;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trans-lenter, .trans-leave-to {
  opacity: 0;
}

.trans-leave, .trans-lenter-to {
  opacity: 1;
}

.card-t-enter, .card-t-leave-to {
  transform: translateY(-70px);
  opacity: 0;
  transition-duration: .15s;
}

.card-t-leave, .card-t-enter-to {
  transform: translateY(0px);
  opacity: 1;
  transition-duration: .15s;
}

</style>
