<template>
  <div class="Renderer" :class="[{folder, movingTask}]">
    <transition-group class="sidebar-renderer sidebar-renderer-root"
      ref='sidebar-renderer-root'
      @enter='enter'
      @leave='leave'
      tag="div"

      data-name='sidebar-renderer'
    >
      <template v-for="(el,i) in items">
        <div v-if="isSmart && el.isEmpty"
          :key='el.id'

          class='empty item-handle'
          :data-id='el.id'
        >
        </div>
        <SidebarElement v-else-if="!el.isEdit" 
          :key="el.id"
          v-bind="{...mapNumbersBind(el), ...el}"
          class="element"
          :iconColor='getIconColor(el)'
          :icon="getIcon(el)"
          :showColor='showColor'
          :type="type || el.rendererType"
          :existingItems='existingItems'
          :saveItem='saveItem'
          :adderIcon='adderIcon'
          :alreadyExistMessage='alreadyExistMessage'

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
        <ItemEdit v-else :key="el.isEdit + 'eidt'"
          @close='removeEdit'
          @go='moveEdit'
          @add='addItem'

          :adderIcon='adderIcon'
          :placeholder='inputPlaceholder'
          data-id='isEdit'
        />
      </template>
    </transition-group>
    <div v-if="!isSmart && !disableItemAdd && !isSubElement && !moving && !hasEdit"
      class="add-msg-wrapper"
    >
      <span class="add-msg" @click.stop="addEdit(items.length)">{{ addMsg }}</span>
    </div>
  </div>
</template>

<script>

import SidebarElementVue from './SidebarElement.vue'
import ItemEdit from './ItemEdit.vue'

import Sortable from 'sortablejs'

import utils from "@/utils"
import { uid } from '@/utils/firestore'

import mom from 'moment'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    SidebarElement: SidebarElementVue,
    ItemEdit,
  },
  props: ['list', 'icon', 'type', 'active', 'viewType', 'subListIcon', 'iconColor', 'mapNumbers', 'mapProgress', 'enableSort', 'isSmart', 'disabled', 'onAdd', 'disableSelection', 'mapIcon', 'mapHelpIcon', 'mapString', 'folder', 'onSortableAdd', 'showColor', 'inputPlaceholder', 'getItemRef', 'disableItemAdd', 'fallbackItem', 'isSubElement', 'adderIcon','existingItems', 'alreadyExistMessage', 'addMsg', 'saveItem'],
  data() {
    return {
      sortable: null,
      hover: false,
      isDragging: false,

      items: [],
      selected: [],
      disableItemEnterTransitionIds: [],
      selectedElements: [],
      sourceVueInstance: null,
      hasEdit: false,
      addedItem: null,

      updateTimeout: null,
    }
  },
  created() {
    this.items = this.list.slice()
  },
  mounted() {
    this.sortable = new Sortable(this.draggableRoot, {
      sort: this.enableSort,
      disabled: this.disabled,
      multiDrag: this.enableSelect,
      
      animation: 200,
      forceFallback: true,
      fallbackOnBody: true,
      multiDragKey: 'CTRL',
      direction: 'vertical',

      group: {name: 'sidebar',
        pull: (e) => {
          if (this.isSmart || this.disableItemAdd) return false

          const name = e.el.dataset.name
          if (!this.enableSort && name === 'sidebar-renderer') return false
          if (name === 'folders-root') return false
          if (name === 'sidebar-renderer') return true
          if (name === 'item-renderer') return true
        },
        put: (l,j,item) => {
          const type = item.dataset.type

          if (type === 'Task') return true
          if (this.isSmart) return false
          if (!this.enableSort && type === 'sidebar-element') return false
          if (type === 'sidebar-element') return true
          if (type === 'add-task-floatbutton') return true
        }},
      delay: this.isDesktopDevice ? 15 : 150,
      handle: '.item-handle',

      onUpdate: evt => {
        setTimeout(() => {
          this.$emit('update', this.getIds())
        }, 50)
      },
      onStart: () => {
        this.$store.commit('moving', true)
        this.$store.commit('movingTask', true)
        this.isDragging = true
        this.$emit('is-moving', true)
        window.navigator.vibrate(20)
      },
      onEnd: () => {
        this.$store.commit('moving', false)
        this.$store.commit('movingTask', false)
        this.isDragging = false
        this.$emit('is-moving', false)
      },
      onRemove: (evt) => {
        const {indicies, items, oldIndicies} = utils.getInfoFromAddSortableEvt(evt)
        utils.removeSortableItemsOnRemove(items, indicies, this.draggableRoot, this.deSelectItem)
      },
      onAdd: evt => {
        const {type, ids, indicies, items} = utils.getInfoFromAddSortableEvt(evt)

        if (type === 'add-task-floatbutton') {
          this.addEdit(indicies[0])
        } else if (type === 'sidebar-element') {
          if (this.onSortableAdd) {
            this.removeEdit()
            this.sourceVueInstance.removeEdit()
            this.disableItemEnterTransitionIds = ids.slice()

            utils.moveItemsBetweenLists(
              this.sourceVueInstance.items,              
              this.items,
              ids, indicies,
            )

            this.sourceVueInstance = null
            const selected = this.selectedItems.slice()
            setTimeout(() => {
              this.onSortableAdd(this.folder, ids.length === 1 ? ids : selected, this.getIds())
            }, 40)
          }
        }
      },
      onMove: (t, e) => {
        const isSidebarRenderer = t.to.classList.contains('sidebar-renderer-root')
        const isComingFromAnotherTaskRenderer = t.to !== this.draggableRoot

        if (isSidebarRenderer && isComingFromAnotherTaskRenderer) {
          let vue = t.related.__vue__ ||
                t.related.parentNode.__vue__
          while (true) {
            if (vue.$el.classList && vue.$el.classList.contains('Renderer'))
              break
            else vue = vue.$parent
          }

          vue.sourceVueInstance = this
        }
      }
    })
  },
  beforeDestroy() {
    this.sortable.destroy()
  },
  methods: {
    addItem(name) {
      if (this.getItemRef) {
        if (this.existingItems && this.alreadyExistMessage && this.existingItems.find(el => el.name === name)) {
          this.$store.commit('pushToast', {
            name: this.alreadyExistMessage,
            seconds: 3,
            type: 'error'
          })
          return;
        }
        
        const newItemRef = this.getItemRef()
        const id = newItemRef.id
        const index = this.items.findIndex(el => el.isEdit)

        let item = {
          name,
          id,
          userId: uid(),
          createdFire: new Date(),
          created: mom().format('Y-M-D HH:mm ss'),
        }

        if (this.fallbackItem)
          item = this.fallbackItem(item)
        this.addedItem = id

        this.items.splice(index, 0, item)

        this.$emit('add', {
          item,
          newItemRef,
          ids: this.getIdsFromItems(),
        })
      }
    },

    moveEdit(dire) {
      if (this.hasEdit) {
        const oldIndex = this.items.findIndex(el => el.isEdit)
        const newIndex = oldIndex + dire

        if (this.items[newIndex])
          this.items.splice(newIndex, 0, this.items.splice(oldIndex, 1)[0])
      }
    },
    removeEdit() {
      this.hasEdit = false
      const i = this.items.findIndex(el => el.isEdit)
      if (i > -1)
        this.items.splice(i, 1)
    },
    addEdit(i) {
      if (!this.hasEdit) {
        this.hasEdit = true
        this.items.splice(i, 0, {
          isEdit: true,
        })
      }
    },
    
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
      if (el.stopProgress) return undefined
      if (!this.mapProgress) return undefined
      return this.mapProgress(el)
    },
    getExraIcon(el) {
      if (!this.mapHelpIcon) return undefined
      return this.mapHelpIcon(el)
    },
    enter(el, done) {
      const s = el.style

      const disableIds = this.disableItemEnterTransitionIds
      
      let disableTransition = false
      if (disableIds.includes(el.dataset.id)) {
        const i = disableIds.findIndex(id => id === el.dataset.id)
        disableIds.splice(i, 1)
        disableTransition = true
      }
      
      s.transitionDuration = 0
      s.opacity = 0
      s.height = '0px'
      requestAnimationFrame(() => {
        s.transitionDuration = disableTransition ? 0 : '.15s'
        s.opacity = 1
        s.height = (this.isDesktopDevice ? 19 : 42) + 'px'
        setTimeout(() => {
          s.height = 'auto'
          s.transitionDuration = '.15s'
          done()
        }, 220)
      })
    },
    leave(el, done) {
      const s = el.style
      
      s.transition = 'none'
      s.opacity = 1
      s.height = (this.isDesktopDevice ? 19 : 42) + 'px'
      requestAnimationFrame(() => {
        s.transition = 'height .15s, opacity .15s'
        s.opacity = 0
        s.height = '0px'

        setTimeout(done, 160)
      })
    },
    getIcon(el) {
      if (el.icon)
        return el.icon
      if (this.icon) return this.icon
    },
    getIconColor(el) {
      if (this.iconColor) return this.iconColor
      return el.iconColor
    },
    getIdsFromItems() {
      return this.items.filter(el => !el.isEdit).map(el => el.id)
    },
    getIds() {
      const childNodes = this.draggableRoot.childNodes
      const ids = []
      for (const node of childNodes) {
        if (node && node.dataset && node.dataset.id !== 'floating-button' && node.dataset.id !== 'isEdit')
          ids.push(node.dataset.id)
      }
      return ids
    },
  },
  computed: {
    ...mapState({
      isOnControl: state => state.isOnControl,
      selectedItems: state => state.selectedItems,
      
      movingTask: state => state.movingTask,
      moving: state => state.moving,
    }),
    ...mapGetters(['isDesktopBreakPoint', 'isDesktopDevice']),
    nonEditGetItems() {
      return this.items.filter(el => !el.isEdit)
    },
    enableSelect() {
      return !this.isSmart && this.isDesktopDevice && (this.isOnControl || this.isSelecting)
    },
    isSelecting() {
      return this.selected.length > 0
    },
    draggableRoot() {
      return this.$refs['sidebar-renderer-root'].$el
    },
    apply() {
      return this.$store.state.apply.bool
    },
  },
  watch: {
    list(items) {
      if (this.updateTimeout)
        clearTimeout(this.updateTimeout)
      
      this.updateTimeout = setTimeout(() => {
        items = items.slice()
  
        if (this.hasEdit && this.addedItem) {
          const oldEditIndex = this.items.findIndex(el => el.isEdit)
          if (oldEditIndex > -1)
            this.items.splice(oldEditIndex, 1)
          const itemIndex = items.findIndex(el => el.id === this.addedItem)
          if (itemIndex > -1) {
            items.splice(itemIndex + 1, 0, {isEdit: true})
          }
        }
        this.items = items.slice()
      }, 250)
    },
    enableSelect() {
      if (this.sortable && this.isDesktopDevice && !this.disabled && this.enableSort) {
        setTimeout(() => {
          this.sortable.options.multiDrag = this.enableSelect
        })
      }
    },
  }
}

</script>

<style>

.sidebar-menus .Task {
  max-height: 0;
  overflow: hidden !important;
}

.movingTask .dragover, .movingTask .dragover {
  background-color: var(--light-gray) !important;
  cursor: move !important;
}

</style>

<style scoped>

.Renderer {
  position: relative;
  pointer-events: all;
}

.add-msg-wrapper {
  position: absolute;
  height: 16px;
  width: 100%;
}

.empty {
  height: 16px;
}

.Renderer .sortable-ghost.empty {
  background-color: var(--dark-void);
  box-shadow: inset 0 10px 8px -13px rgba(5,5,5, .7),
    inset 0 -10px 5px -13px rgba(210,210,210, .7);
  border-radius: 4px;
}

.add-msg {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  border-radius: 4px;
  height: 0;
  opacity: 0;
  background-color: transparent;
  overflow: visible;
  transition-duration: .15s;
}

.add-msg-wrapper:hover .add-msg {
  opacity: 1;
  cursor: pointer;
  height: 16px;
  background-color: var(--dark);
}

</style>
