<template>
  <div class="Renderer" :class="[{folder, movingTask}]">
    <transition-group class="sidebar-renderer sidebar-renderer-root"
      @enter='enter'
      @leave='leave'
      tag="div"

      data-name='sidebar-renderer'
    >
      <SidebarElement v-for="(el,i) in list"
        :key="el.id"
        v-bind="{...mapNumbersBind(el), ...el}"
        class="element"
        :iconColor='getIconColor(el)'
        :icon="getIcon(el)"
        :showColor='showColor'
        :type="type || el.rendererType"

        :tabindex="i + 1"
        :active="active"
        :isSmart='isSmart'
        :viewType="viewType"
        :isDragging='isDragging'
        :progress='getProgress(el)'
        :helpIcons='getExraIcon(el)'
        :string='getString(el)'

        :data-id="el.id"
        data-type="sidebar-element"
      />
    </transition-group>
  </div>
</template>

<script>

import SidebarElementVue from './SidebarElement.vue'

import Sortable from 'sortablejs'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    SidebarElement: SidebarElementVue,
  },
  props: ['list', 'icon', 'type', 'active', 'viewType', 'subListIcon', 'iconColor', 'mapNumbers', 'mapProgress', 'enableSort', 'isSmart', 'disabled', 'onAdd', 'disableSelection', 'mapIcon', 'mapHelpIcon', 'mapString', 'folder', 'onSortableAdd', 'showColor'],
  data() {
    return {
      sortable: null,
      hover: false,
      isDragging: false,
    }
  },
  mounted() {
    this.sortable = new Sortable(this.draggableRoot, {
      sort: this.enableSort,
      disabled: this.disabled,
      animation: 80,
      direction: 'vertical',
      group: {name: 'sidebar',
        pull: (e) => {
          if (this.isSmart) return false

          const name = e.el.dataset.name
          if (!this.enableSort && name === 'sidebar-renderer') return false
          if (name === 'folders-root') return false
          if (name === 'sidebar-renderer') return true
          if (name === 'item-renderer') return 'clone'
        }, put: (l,j,item) => {
          const type = item.dataset.type

          if (type === 'Task') return true
          if (this.isSmart) return false
          if (!this.enableSort && type === 'sidebar-element') return false
          if (type === 'sidebar-element') return true
          if (type === 'add-task-floatbutton') return true
        }},
      delay: 150,
      delayOnTouchOnly: true,
      forceFallback: true,
      fallbackOnBody: true,
      handle: '.item-handle',

      onUpdate: evt => {
        setTimeout(() => {
          this.$emit('update', this.getIds())
        }, 10)
      },
      onStart: () => {
        this.isDragging = true
        this.$emit('is-moving', true)
        window.navigator.vibrate(100)
      },
      onEnd: () => {
        this.isDragging = false
        this.$emit('is-moving', false)
      },
      onAdd: evt => {
        const item = evt.item
        const type = item.dataset.type
        const items = evt.items

        if (type === 'add-task-floatbutton') {
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
        } else if (type === 'sidebar-element') {
          if (this.onSortableAdd)
            this.onSortableAdd(this.folder, item.dataset.id, this.getIds())
        }
        this.draggableRoot.removeChild(item)
      },
    })
  },
  beforeDestroy() {
    this.sortable.destroy()
  },
  methods: {
    mapNumbersBind(el) {
      if (this.mapNumbers) {
        const obj = this.mapNumbers(el)
        return {
          totalNumber: obj.total,
          importantNumber: obj.notCompleted
        }
      }
    },
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
    getIds() {
      const childs = this.draggableRoot.childNodes
      const ids = []
      for (const el of childs)
        if (el.dataset.id !== 'floating-button')
          ids.push(el.dataset.id)
      return ids
    },
    enter(el) {
      const s = el.style
      
      s.transitionDuration = '.2s'
      s.opacity = 0
      s.height = '0px'
      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        s.opacity = 1
        s.height = (this.isDesktop ? 35 : 42) + 'px'
        setTimeout(() => {
          s.height = 'auto'
        }, 220)
      })
    },
    leave(el) {
      const s = el.style
      
      s.transition = 'none'
      s.opacity = 1
      s.height = (this.isDesktop ? 35 : 42) + 'px'
      requestAnimationFrame(() => {
        s.transition = 'height .15s, opacity .15s'
        s.opacity = 0
        s.height = '0px'
      })
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
    ...mapState(['selectedItems', 'movingTask']),
    ...mapGetters(['isDesktop']),
    draggableRoot() {
      return this.$el.getElementsByClassName('sidebar-renderer-root')[0]
    },
    apply() {
      return this.$store.state.apply.bool
    },
  },
}

</script>

<style>

.Renderer .Task {
  height: 0 !important;
}

.movingTask .link-inner-wrapper:hover, .movingTask .header:hover {
  transform: scale(1.03, 1.05);
  background-color: var(--light-gray) !important;
  cursor: move;
}

</style>

<style scoped>

.Renderer {
  position: relative;
  pointer-events: all;
}

</style>
