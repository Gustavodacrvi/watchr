<template>
  <transition-group class="Renderer appnav-renderer"
    @enter='enter'
    @leave='leave'
    tag="div"

    data-name='appnav-renderer'
  >
    <AppbarElement v-for="(el,i) in list"
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
      :totalNumber='mapNumbers(el).total'
      :importantNumber='mapNumbers(el).notCompleted'
      @apply='() => $emit("apply", el.id)'
      @select='() => selectEl(el.id)'

      :data-id="el.id"
      data-type="appnav-element"
    />
  </transition-group>
</template>

<script>

import Sortable from 'sortablejs'

export default {
  components: {
    AppbarElement: () => import('./AppbarElement.vue'),
  },
  props: ['list', 'icon', 'type', 'active', 'viewType', 'subListIcon', 'iconColor', 'mapNumbers', 'disableSort', 'isSmart', 'disabled', 'onTaskDrop', 'onAdd'],
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
    this.sortable = new Sortable(this.$el, {
      sort: !this.disableSort,
      disabled: this.disabled,
      group: {name: 'appnav', pull: (e) => {
        if (e.el.dataset.name === 'task-renderer') return 'clone'
      }, put: (l,j,item) => {
        const type = item.dataset.type
        if (type === 'task') return true
        if (type === 'floatbutton') return true
      }},
      delay: 150,
      delayOnTouchOnly: true,
      handle: '.handle',

      onUpdate: (evt) => {
        setTimeout(() => {
          const childs = this.$el.childNodes
          const ids = []
          for (const el of childs)
            ids.push(el.dataset.id)
          this.$emit('update', ids)
        }, 100)
      },
      onEnd: () => {
        removeAppnavOnHoverOnTaskElements()
        if (this.onTaskDrop) this.onTaskDrop(move)
        move = null
      },
      onMove: (t, e) => {
        let el = e.target
        if (!el.classList.contains('Task'))
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
            s.transition = 'opacity .2s, box-shadow .2s, transform .2s'
            s.transform = 'scale(1.01,1.01)'
            s.backgroundColor = 'var(--primary)'
            s.boxShadow = `0 2px 10px var(--primary)`
          }
        } else move = null

        return false
      },
      onStart: () => window.navigator.vibrate(100),
      onAdd: (evt) => {
        evt.item.dataset.id = 'floating-button'
        const childs = this.$el.childNodes
        let i = 0
        for (const c of childs) {
          if (c.dataset.id === 'floating-button') break
          i++
        }
        this.$emit('buttonAdd', i)
        this.$el.removeChild(evt.item)
      }
    })
  },
  beforeDestroy() {
    this.sortable.destroy()
  },
  methods: {
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
    apply() {
      return this.$store.state.apply.bool
    },
  },
  watch: {
    selected() {
      this.$store.commit('appnavSelected', this.selected)
    },
    apply() {
      this.$emit('apply-selected-els', {
        elIds: this.selected,
        taskId: this.$store.state.apply.taskId,
      })
    }
  }
}

</script>
