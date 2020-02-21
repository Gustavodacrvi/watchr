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
              <div v-for="o in options"
                :key="o.id"
                class="option rb cursor"
                :class="{active: isActive(o)}"
                @click="click(o.callback)"
              >
                <div class="icon-wrapper">
                  <Icon :icon='o.icon' class="icon" :color="o.iconColor"/>
                </div>
                <span class="name">{{ o.name }}</span>
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
      options: [],
    }
  },
  methods: {
    enter(el) {
      const height = el.offsetHeight
      const s = el.style

      s.transitionDuration = 0
      s.height = 0
      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        if (height < 36)
          s.height = '35px'
        else s.height = `${height}px`
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

      return arr.slice(0, 10)
    },
    isActive(el) {
      return this.active.name === el.name && this.active.icon === el.icon
    },
    move(dir) {
      const { options, active } = this
      
      const i = options.findIndex(this.isActive)

      let ind
      if (dir === 'up')
        ind = i - 1 
      else ind = i + 1

      if (options[ind])
        this.active = options[ind]
    },
    keydown({key}) {
      if (this.noActive && this.options[0])
        this.active = this.options[0]
      else if (key === 'ArrowUp') {
        this.move('up')
      } else if (key === 'ArrowDown') {
        this.move('down')
      } else if (key === 'Enter') {
        this.click(this.active.callback)
      }
    }
  },
  computed: {
    ...mapState({
      groups: state => state.group.groups,
    }),
    ...mapGetters({
      sidebarElements: 'sidebarElements',
      lists: 'list/lists',
      tags: 'tag/tags',
      folders: 'folder/folders',
      isStandAlone: 'isStandAlone',
      tasks: 'task/tasks',
    }),
    hasCallback() {
      return this.payload && this.payload.callback
    },
    placeholder() {
      if (this.onlyTasks)
        return 'Search task...'
      return 'Search for tags, lists, folders and tasks...'
    },
    noActive() {
      return !this.active.name || !this.active.icon
    },
  },
  watch: {
    search() {
      this.options = this.getOptions()
    }
  }
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
  margin: 10px;
}

.options {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
}

.option {
  width: 100%;
  display: flex;
  background-color: none;
  transition-duration: .2s;
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

.name {
  display: flex;
  align-items: center;
  flex-basis: 100%;
  word-wrap: break-all;
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
  transition-duration: .2s;
}

.card-t-leave, .card-t-enter-to {
  transform: translateY(0px);
  opacity: 1;
  transition-duration: .2s;
}

</style>
