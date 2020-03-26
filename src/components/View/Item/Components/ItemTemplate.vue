<template>
  <transition
    appear
    :css='false'
    @enter='enter'
    @leave='leave'
  >
    <div
      class="ItemTemplate item-handle draggable"
      :class="[layout, {isItemSelected, isItemMainSelection}]"
    >
      <div
        class="cont-wrapper item-handle rb"
        ref='cont-wrapper'
      >
        <ItemCont
          v-bind="item"
          
          :completed='completed'
          :canceled='canceled'
          :nameIcon='nameIcon'
        >

          <template v-slot:check-icon>
            <slot name="check-icon"></slot>
          </template>
          <template v-slot:root>
            <slot name="root"></slot>
          </template>
          <template v-slot:after-name>
            <slot name="after-name"></slot>
          </template>
          <template v-slot:info>
            <slot name="info"></slot>
          </template>

        </ItemCont>
      </div>
    </div>
  </transition>
</template>

<script>

import ItemCont from './ItemCont.vue'

import utils from "@/utils"

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    ItemCont,
  },
  props: [
    'nameIcon', 'itemHeight', 'item', 'completed', 'canceled',
    'multiSelectOptions', 'movingItem', 'isSelecting', 'comp',

    'options',
  ],
  data() {
    return {
      justSaved: false,
      isEditing: false,
    }
  },
  methods: {
    enter(el, done) {
      const cont = this.$refs['cont-wrapper']
      const parentIds = this.$parent.$parent.disableItemEnterTransitionIds
      
      let disableTransition = false
      if (parentIds.includes(this.item.id)) {
        const i = parentIds.findIndex(id => id === this.item.id)
        parentIds.splice(i, 1)
        disableTransition = true
      }

      const s = cont.style

      s.transitionDuration = '0s'
      s.opacity = 0
      s.height = 0
      s.minHeight = 0
      
      requestAnimationFrame(() => {
        s.transitionDuration = disableTransition ? 0 : '.2s'
        s.opacity = 1
        s.height = this.itemHeight + 'px'
        s.minHeight = this.itemHeight + 'px'
        
        setTimeout(() => {
          s.transitionDuration = '.2s'
          s.height = 'auto'
          done()
        }, 205)
      })
    },
    leave(el, done) {
      const cont = this.$refs['cont-wrapper']
      const parentIds = this.$parent.$parent.disableItemEnterTransitionIds
      
      let disableTransition = false
      if (parentIds.includes(this.item.id)) {
        const i = parentIds.findIndex(id => id === this.item.id)
        parentIds.splice(i, 1)
        disableTransition = true
      }

      const s = cont.style

      s.transitionDuration = '0s'
      s.opacity = 1
      s.height = this.itemHeight + 'px'
      s.minHeight = this.itemHeight + 'px'

      requestAnimationFrame(() => {
        s.transitionDuration = disableTransition ? 0 : '.2s'
        s.opacity = 0
        s.height = 0
        s.minHeight = 0

        setTimeout(done, 205)
      })
    },

    
    bindMainSelection() {
      if (this.isDesktopDevice)
        if (this.isItemMainSelection)
          window.addEventListener('keydown', this.mainSelectionKeyDown)
        else
          window.removeEventListener('keydown', this.mainSelectionKeyDown)
    },
    mainSelectionKeyDown(evt) {
      const p = () => evt.preventDefault()
      const {key} = evt
      const active = document.activeElement
      const isTyping = active && (active.nodeName === 'INPUT' || active.nodeName === 'TEXTAREA')

      const toggleSelect = this.toggleSelect

      const hasSelected = this.selectedItems.length > 0
      if (!isTyping && !this.isEditingComp && !this.iconDrop && !(this.isOnAlt && this.fallbackSelected) && !(hasSelected && this.isOnAlt))
        switch (key) {
          case 'ArrowDown': {
            this.$parent.$emit('go', true)
            p()
            break
          }
          case 'ArrowUp': {
            this.$parent.$emit('go', false)
            p()
            break
          }
        }

      switch (key) {
        case 'Enter': {
          if (!isTyping && !this.isEditingComp && !this.iconDrop) {
            const select = (this.isOnControl || this.isSelecting)
            if (!select && !this.justSaved)
              this.isEditing = true
            else if (select)
              toggleSelect()
          }
          break
        }
      }

      if (!this.isOnShift && !this.isEditingComp && !this.iconDrop) {
        switch (key) {
          case ' ': {
          if (!isTyping) {
            p()
            this.$parent.$emit('add-item-after', 1)
          }
          break
        }}
      }
      if (this.isOnShift && !isTyping && !this.isEditingComp && !this.iconDrop) {
        switch (key) {
          case "C": {
            if (!this.isEditing && this.comp === 'Task') {
              this.isEditing = true
            }
            break
          }
          case "D": {
            this.$emit('copy-item')
            break
          }
          case ' ': {
            p()
            this.$parent.$emit('add-item-after', 0)
            break
          }
        }
      }
      if (this.isOnControl && !this.isOnShift && !this.isEditingComp && !this.iconDrop) {
        switch (key) {
          case ' ': {
            if (!isTyping) {
              p()
              this.$parent.$emit('add-heading-after', +1)
            }
            break
          }
        }
      }

      if (this.isOnControl && !this.isOnShift)
        switch (key) {
          case "ArrowUp": {
            toggleSelect()
            break
          }
          case "ArrowDown": {
            toggleSelect()
            break
          }
        }

      if (this.isOnShift && this.isOnControl) {
        switch (key) {
          case ' ': {
            if (!isTyping) {
              p()
              this.$parent.$emit('add-heading-after', -1)
            }
            break
          }
        }
      }
    },
    bindContextMenu(options) {
      utils.bindOptionsToEventListener(this.$el, options, this)
    },
    deselectItem() {
      setTimeout(() => {
        this.$parent.$emit('de-select', this.$el)
      }, 5)
    },
    selectItem() {
      this.$parent.$emit('select', this.$el)
    },
    toggleSelect() {
      if (!this.isItemSelected) {
        if (this.selectedItems.length === 0) {
          this.selectItem()
        } else {
          this.selectItem()
        }
      } else {
        this.deselectItem()
      }
    },
  },
  mounted() {
    if (this.isDesktopDevice)
      this.bindContextMenu(this.options)

    if (this.isItemMainSelection)
      window.addEventListener('keydown', this.mainSelectionKeyDown)
  },
  beforeDestroy() {
    if (this.isItemMainSelection)
      window.removeEventListener('keydown', this.mainSelectionKeyDown)
  },
  computed: {
    ...mapState(['selectedItems', 'mainSelection', 'isEditingComp', 'iconDrop', 'isOnAlt', 'fallbackSelected', 'isOnControl', 'isOnShift']),
    ...mapGetters(['layout', 'isDesktopDevice']),

    isItemSelected() {
      return !this.movingItem && this.selectedItems.includes(this.item.id)
    },
    isItemMainSelection() {
      return this.item.id === this.mainSelection
    },
  },
  watch: {
    isItemMainSelection() {
      this.bindMainSelection()
    },
    options() {
      this.bindContextMenu(this.options)
    },
    selectedItems() {
      if (this.isDesktopDevice)
        if (this.selectedItems && this.selectedItems.length > 0)
          this.bindContextMenu(this.multiSelectOptions)
        else this.bindContextMenu(this.options)
    },
  },
}

</script>

<style>

.sortable-ghost.ItemTemplate .cont-wrapper {
  background-color: var(--sidebar-color) !important;
  transition-duration: 0;
  height: 38px;
  padding: 0;
}

.mobile.sortable-ghost.ItemTemplate .cont-wrapper {
  height: 50px;
}

.sortable-ghost.ItemTemplate .cont {
  display: none;
}

.sortable-ghost.ItemTemplate .icon-wrapper {
  display: none;
}

</style>

<style scoped>

.cont-wrapper {
  position: relative;
  z-index: 5;
  height: 100%;
  user-select: none;
}

.desktop .cont-wrapper:hover, .desktop .cont-wrapper:active, .isItemMainSelection .cont-wrapper {
  background-color: var(--light-gray);
}

.isItemSelected .cont-wrapper {
  background-color: rgba(53, 73, 90, 0.6) !important;
  box-shadow: 1px 0 1px rgba(53, 73, 90, 0.1);
  cursor: grab;
}

</style>
