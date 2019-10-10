<template>
  <div class="FastSearch" @click="$store.commit('closeFastSearch')">
    <div class="cb rb card shadow scroll-thin" @click.stop>
      <div class="cont">
        <InputApp :focus='true' v-model="search" placeholder="Search for tags, lists and tasks..."/>
        <div>
          <transition-group name="trans"
            @enter='enter'
            @leave='leave'
            class="options"
            tag="div"
          >
            <div v-for="(o, i) in options"
              :key="o.name + o.icon + i"
              class="option rb cursor"
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
</template>

<script>

import InputVue from '@/components/Auth/Input.vue'
import IconVue from '@/components/Icon.vue'

import { mapState } from 'vuex'

export default {
  components: {
    InputApp: InputVue,
    Icon: IconVue,
  },
  data() {
    return {
      search: '',
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
      this.$store.commit('closeFastSearch')
      if (callback) callback()
    }
  },
  computed: {
    ...mapState({
      tasks: state => state.task.tasks,
      tags: state => state.tag.tags,
      lists: state => state.list.lists,
    }),
    options() {
      const { search, tasks, tags, lists } = this
      if (!search) return []
      const lower = search.toLowerCase()
      const arr = []

      const tg = tags.filter(el => el.name.toLowerCase().includes(lower))
      const lt = lists.filter(el => el.name.toLowerCase().includes(lower))
      const ts = tasks.filter(el => el.name.toLowerCase().includes(lower))

      const go = (route) => this.$router.push(route)

      for (const t of tg)
        arr.push({
          name: t.name,
          icon: 'tag',
          color: 'var(--red)',
          callback: () => go('/user?tag=' + t.name)
        })
      for (const l of lt)
        arr.push({
          name: l.name,
          icon: 'tasks',
          color: 'var(--purple)',
          callback: () => go('/user?list=' + l.name)
        })
/*       for (const t of ts)
        arr.push({
          name: t.name,
          icon: 'circle-check',
        }) */

      return arr.slice(0, 8)
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
}

.trans-lenter, .trans-leave-to {
  opacity: 0;
}

.trans-leave, .trans-lenter-to {
  opacity: 1;
}

</style>
