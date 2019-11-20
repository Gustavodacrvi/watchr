<template>
  <div class="Renderer" :class="{folder: folder}">
    <transition name="illus-t">
      <div v-if="showIllustration" class="illustration">
        <Illustration
          :name='illustration.name'
          :title='illustration.title'
          :descr='illustration.descr'
          :width='illustration.width'
        />
      </div>
    </transition>
    <transition-group class="appnav-renderer appnav-renderer-root"
      @enter='enter'
      @leave='leave'
      tag="div"
      :class="{dontHaveElements: list.length === 0 && illustration}"

      data-name='appnav-renderer'
    >
      <AppbarElement v-for="(el,i) in list"
        class="element"
        :iconColor='getIconColor(el)'
        :icon="getIcon(el)"

        :type="type"
        :subListIcon='subListIcon'
        :key="el.id"
        :name="el.name"
        :disableAction='el.disableAction'
        :tabindex="i + 1"
        :selected='selected'
        :active="active"
        :isSmart='isSmart'
        :viewType="viewType"
        :callback="el.callback"
        :options='el.options'
        :list="el.list"
        :id='el.id'
        :progress='getProgress(el)'
        :totalNumber='mapNumbers(el).total'
        :importantNumber='mapNumbers(el).notCompleted'
        :helpIcons='getExraIcon(el)'
        :string='getString(el)'
        @apply='() => applyEmit(el.id)'
        @select='() => selectEl(el.id)'

        :data-id="el.id"
        data-type="appnav-element"
      />
    </transition-group>
  </div>
</template>

<script>

import IllustrationVue from '@/components/Illustrations/Illustration.vue'
import AppbarElementVue from './AppbarElement.vue'

import Sortable from 'sortablejs'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    Illustration: IllustrationVue,
    AppbarElement: AppbarElementVue,
  },
  props: ['list', 'icon', 'type', 'active', 'viewType', 'subListIcon', 'iconColor', 'mapNumbers', 'mapProgress', 'enableSort', 'isSmart', 'disabled', 'onAdd', 'illustration', 'disableSelection', 'mapIcon', 'mapHelpIcon', 'mapString', 'folder', 'onSortableAdd'],
  data() {
    return {
      sortable: null,
      hover: false,
      selected: [],
    }
  },
  created() {
    window.addEventListener('click', () => {
      this.selected = []
    })
  },
  mounted() {
    let move = null
    const removeAppnavOnHoverOnTaskElements = (el) => {
      const items = document.getElementsByClassName('task-cont-wrapper')
      for (const item of items) {
        if (el && item === el) continue
        const s = item.style
        s.transition = 'initial'
        s.transform = 'scale(1,1)'
        s.backgroundColor = 'initial'
        s.boxShadow = `initial`
      }
    }
    this.sortable = new Sortable(this.draggableRoot, {
      sort: this.enableSort,
      disabled: this.disabled,
      group: {name: 'appnav', pull: (e) => {
        if (e.el.dataset.name === 'folders-root') return false
        if (e.el.dataset.name === 'appnav-renderer') return true
        if (e.el.dataset.name === 'task-renderer') return 'clone'
      }, put: (l,j,item) => {
        const type = item.dataset.type
        if (type === 'appnav-element') return true
        if (type === 'task') return true
        if (type === 'floatbutton') return true
      }},
      delay: 150,
      delayOnTouchOnly: true,
      handle: '.handle',

      onUpdate: (evt) => {
        setTimeout(() => {
          this.$emit('update', this.getIds())
        }, 100)
      },
      onEnd: (e, j) => {
        removeAppnavOnHoverOnTaskElements()
        if (move && !this.isSmart) {
          this.$store.dispatch('task/handleTasksByAppnavElementDragAndDrop', {
            elIds: [move.elId],
            taskIds: [move.taskId],
            type: this.type,
          })
        }
        this.$emit('on-task-drop')
        move = null
      },
      onMove: (t, e) => {
        let el = e.target
        if (el && !el.classList.contains('Task'))
          el = el.closest('.Task')
        if (el) {
          const cont = el.getElementsByClassName('task-cont-wrapper')[0]
          if (cont) {
            move = {}
            move.taskId = el.dataset.id
            move.elId = t.dragged.dataset.id
            const s = cont.style
            setTimeout(() => {
              removeAppnavOnHoverOnTaskElements(cont)
            })
            s.transition = 'opacity .15s, box-shadow .15s, transform .15s'
            s.transform = 'scale(1.01,1.01)'
            s.backgroundColor = 'var(--primary)'
            s.boxShadow = `0 2px 10px var(--primary)`
          }
        } else move = null
        if (e.target.dataset.name !== 'appnav-renderer' &&
          e && e.target && !e.target.classList.contains('AppbarElement-link'))
          return false
      },
      onStart: () => {
        this.$emit('is-moving', true)
        window.navigator.vibrate(100)
      },
      onEnd: () => {
        this.$emit('is-moving', false)
      },
      onAdd: (evt) => {
        const item = evt.item
        const type = item.dataset.type

        if (type === 'floatbutton') {
          item.dataset.id = 'floating-button'
          const childs = this.draggableRoot.childNodes
          let i = 0
          for (const c of childs) {
            if (c.dataset.id === 'floating-button') break
            i++
          }
          this.$emit('buttonAdd', {
            index: i,
            ids: this.getIds(),
          })
        } else if (type === 'appnav-element') {
          this.onSortableAdd(this.folder, item.dataset.id, this.getIds())
        }
        this.draggableRoot.removeChild(item)
      }
    })
  },
  beforeDestroy() {
    this.sortable.destroy()
  },
  methods: {
    getString(el) {
      if (!this.mapString) return undefined
      return this.mapString(el)
    },
    getProgress(el) {
      if (!this.mapProgress) return undefined
      return this.mapProgress(el)
    },
    getExraIcon(el) {
      if (!this.mapHelpIcon) return undefined
      return this.mapHelpIcon(el)
    },
    applyEmit(elId) {
      if (!this.isSmart)
        this.$store.dispatch('task/handleTasksByAppnavElementDragAndDrop', {
          elIds: [elId],
          taskIds: this.selectedTasks,
          type: this.type,
        })
      this.$emit('apply', elId)
    },
    getIds() {
      const childs = this.draggableRoot.childNodes
      const ids = []
      for (const el of childs)
        ids.push(el.dataset.id)
      return ids
    },
    enter(el, done) {
      el.style.opacity = 0
      el.style.height = '0px'
      setTimeout(() => {
        el.style.opacity = 1
        el.style.height = '35px'
        setTimeout(() => done(), 300)
      })
    },
    selectEl(id) {
      if (!this.disableSelection) {
        if (this.selected.some(el => el === id)) {
          const i = this.selected.findIndex(el => el === id)
          this.selected.splice(i, 1)
        } else this.selected.push(id)
      }
    },
    leave(el, done) {
      el.style.transition = 'height .15s, opacity .15s !important'
      el.style.opacity = 0
      el.style.height = '0px'
      setTimeout(() => done(), 300)
    },
    getIcon(el) {
      if (this.icon) return this.icon
      return el.icon
    },
    getIconColor(el) {
      if (this.iconColor) return this.iconColor
      return el.iconColor
    },
  },
  computed: {
    ...mapState(['selectedTasks']),
    draggableRoot() {
      return this.$el.getElementsByClassName('appnav-renderer-root')[0]
    },
    apply() {
      return this.$store.state.apply.bool
    },
    showIllustration() {
      return this.list.length === 0 && this.illustration
    }
  },
  watch: {
    selected() {
      this.$store.commit('appnavSelected', this.selected)
    },
    apply() {
      setTimeout(() => {
        if (!this.isSmart)
          this.$store.dispatch('task/handleTasksByAppnavElementDragAndDrop', {
            elIds: this.selected,
            taskIds: [this.$store.state.apply.taskId],
            type: this.type,
          })
      })
    }
  }
}

</script>

<style scoped>

.Renderer {
  position: relative;
  pointer-events: all;
}

.illustration {
  position: absolute;
  width: 100%;
  height: 175px;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dontHaveElements {
  height: 225px;
}

.folder .dontHaveElements {
  height: 38px;
}

.illus-t-enter, .illus-t-leave-to {
  opacity: 0;
  transform: translateY(20px);
  transition-duration: .3s;
}

.illus-t-leave, .illus-t-enter-to {
  opacity: 1;
  transform: translateY(0px);
  transition-duration: .3s;
}

</style>
