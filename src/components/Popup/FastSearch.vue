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
                  <Icon :icon='o.icon' class="icon" :color="o.color"/>
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
import IconVue from '@/components/Icon.vue'

import { mapState, mapGetters } from 'vuex'

export default {
  props: ['payload'],
  components: {
    InputApp: InputVue,
    Icon: IconVue,
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
      setTimeout(() => {
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
    getOptions() {
      const { search, tasks, tags, lists, folders, views } = this
      if (!search) return []
      const lower = search.toLowerCase()
      const arr = []

      const filter = arr => arr.filter(el => el.name.toLowerCase().includes(lower))

      const tg = filter(tags)
      const lt = filter(lists)
      const ts = filter(tasks)
      const fs = filter(folders)
      const vs = filter(views)

      const go = this.hasCallback ? this.payload.callback : route => this.$router.push(route)

      if (!this.onlyTasks)
        for (const v of vs)
          arr.push({
            ...v,
            id: v.name + 'UNIQUE_SMART_VIEW' + Date.now(),
            callback: () => go('/user?list=' + v.name, v)
          })
      if (!this.onlyTasks)
        for (const t of tg)
          arr.push({
            name: t.name,
            icon: 'tag',
            id: t.id,
            color: 'var(--red)',
            callback: () => go('/user?tag=' + t.name, t)
          })
      if (!this.onlyTasks)
        for (const f of fs)
          arr.push({
            name: f.name,
            icon: 'folder',
            id: f.id,
            color: '',
            callback: () => go('/user?folder=' + f.name, f)
          })
      if (!this.onlyTasks)
        for (const l of lt)
          arr.push({
            name: l.name,
            icon: 'tasks',
            id: l.id,
            color: 'var(--primary)',
            callback: () => go('/user?list=' + l.name, l)
          })
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
      tasks: state => state.task.tasks,
      tags: state => state.tag.tags,
      lists: state => state.list.lists,
      folders: state => state.folder.folders,
    }),
    ...mapGetters(['isStandAlone', 'l']),
    hasCallback() {
      return this.payload && this.payload.callback
    },
    onlyTasks() {
      return this.payload && this.payload.onlyTasks
    },
    placeholder() {
      if (this.onlyTasks)
        return this.l['Search task...']
      return this.l['Search for tags, lists, folders and tasks...']
    },
    views() {
      return [
        {
          name: 'Today',
          color: 'var(--yellow)',
          icon: 'star',
        },
        {
          name: 'Tomorrow',
          color: 'var(--orange)',
          icon: 'sun',
        },
        {
          name: 'Someday',
          color: 'var(--brown)',
          icon: 'archive',
        },
        {
          name: 'Inbox',
          color: 'var(--primary)',
          icon: 'inbox',
        },
        {
          name: 'Calendar',
          color: 'var(--purple)',
          icon: 'calendar-star',
        },
        {
          name: 'Pomodoro',
          color: 'var(--dark-red)',
          icon: 'pomo',
        },
        {
          name: 'Upcoming',
          color: 'var(--green)',
          icon: 'calendar',
        },
        {
          name: 'Completed',
          color: 'var(--olive)',
          icon: 'circle-check',
        },
      ]
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
