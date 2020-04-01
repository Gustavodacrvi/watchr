<template>
  <transition
    appear
    :css='false'
    @enter='enter'
    @leave='leave'
  >
    <div
      class="ItemTemplate item-handle draggable"
      :class="[layout, {isItemSelected, isItemMainSelection, isEditing}]"

      @mouseenter="onHover = true"
      @mouseleave="onHover = false"

      @click='click'
    >
      <div
        class="cont-wrapper item-handle rb"
        ref='cont-wrapper'
      >
        <ItemCont
          v-bind="item"
          :item='item'
          ref='cont'
          
          :isEditing='isEditing'
          :itemHeight='itemHeight'
          :editComponent='editComponent'
          :itemModelFallback='itemModelFallback'
          :editRawPlaceholder='editRawPlaceholder'

          @toggle-complete='toggleComplete'
          @toggle-cancel='toggleCancel'
          @close="close"
        >
          <template v-slot:check-icon='props'>
            <slot name="check-icon"
              :completed='completed'
              :canceled='canceled'
              :color='props.iconColor'
              :forceDefault='props.forceDefault'
            ></slot>
          </template>
          <template v-slot:root>

            <CommentCounter v-if="item.group && isDesktopBreakPoint && !isEditing"
              ref="comment-counter"
              :hover='onHover'
              :number='nonReadComments'
              :isOwner='isGroupOwner'
              :assigned='item.assigned'
              :groupId='item.group'
              
              @assign="assignItem"
              @comment="commentsPopup"
              @mouseenter.native='onHover = true'
            />
            
            <slot name="root"
              :isEditing='isEditing'
              :onHover='onHover'
            ></slot>
          </template>
          <template v-slot:after-name>
            <slot name="after-name"></slot>
          </template>
          <template v-slot:info>
            <slot name="info"></slot>
          </template>
          <template v-slot:before-name>
            <slot name="before-name"></slot>
          </template>

        </ItemCont>
      </div>
    </div>
  </transition>
</template>

<script>

import ItemCont from './ItemCont.vue'

import utils from "@/utils"

import CommentCounter from '@/components/View/RenderComponents/CommentCounter.vue'

import { mapGetters, mapMutations, mapState } from 'vuex'

export default {
  components: {
    ItemCont, CommentCounter,
  },
  props: [
    'itemHeight', 'item', 'editRawPlaceholder',
    'multiSelectOptions', 'movingItem', 'isSelecting', 'comp',
    'completedItem', 'canceledItem', 'waitForAnotherItemComplete',
    'editComponent', 'itemModelFallback',

    'options',
  ],
  data() {
    return {
      justSaved: false,
      isEditing: false,
      completeAnimation: false,
      onHover: false,
      
      completed: false,
      canceled: false,
    }
  },
  created() {
    this.completed = this.completedItem
    this.canceled = this.canceledItem
  },
  methods: {
    ...mapMutations(['saveMainSelection']),
    
    click(evt) {
      if (!this.isSelecting && this.isDesktopDevice && !this.isEditing) {
        this.isEditing = true
        evt.stopPropagation()
      }
    },
    close() {
      this.isEditing = false
      this.saveMainSelection(this.item.id)
    },
    
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

      const hideItem = () => {
        s.transitionDuration = disableTransition ? 0 : '.2s'
        s.opacity = 0
        s.height = 0
        s.minHeight = 0

        setTimeout(done, disableTransition ? 0 : 201)
      }

      requestAnimationFrame(() => {
        if (!this.completeAnimation) {
          hideItem()
        } else {
          this.waitForAnotherItemComplete(hideItem)
        }
      })
    },

    animate(animate) {
      this.completeAnimation = animate
      if (animate)
        this.$refs.cont.animate()
    },
    assignUser(uid) {
      this.$emit('assign-user', uid)
    },
    assignItem() {
      this.$store.commit('pushIconDrop', this.assignUserProfiles)
    },

    toggleComplete() {
      if (this.isDesktopDevice)
        this.completeItem()
    },
    toggleCancel() {
      if (this.isDesktopDevice)
        this.canceleItem()
    },
    toggleCompletion() {
      this.completeItem()
    },
    completeItem(force = false) {
      if (this.canceled && !force) {
        this.cancelItem(true)
      } else {
        this.animate(!this.completed)
        const anticipate = (this.viewName !== 'Today' && this.comp === "Task")
        this.completed = !this.completed || anticipate
        this.$nextTick(() => {
          if (this.completed || anticipate)
            this.$emit('complete-item')
          else this.$emit('uncomplete-item')
        })
      }
    },
    cancelItem(force = false) {
      if (this.completed && !force) {
        this.completeItem(true)
      } else {
        this.animate(!this.canceled)
        this.canceled = !this.canceled
        this.$nextTick(() => {
          if (this.canceled)
            this.$emit('cancel-item')
          else this.$emit('uncancel-item')
        })
      }
    },
    commentsPopup() {
      this.$store.dispatch('pushPopup', {
        comp: "Comments",
        payload: {
          groupId: this.item.group,
          id: this.item.id,
        },
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
    ...mapState({
      selectedItems: state => state.selectedItems,
      mainSelection: state => state.mainSelection,
      isEditingComp: state => state.isEditing,
      iconDrop: state => state.iconDrop,

      isOnAlt: state => state.isOnAlt,
      isOnControl: state => state.isOnControl,
      isOnShift: state => state.isOnShift,
      fallbackSelected: state => state.fallbackSelected,
      userInfo: state => state.userInfo,
    }),
    ...mapGetters({
      layout: 'layout',
      isDesktopDevice: 'isDesktopDevice',
      isDesktopBreakPoint: 'isDesktopBreakPoint',

      getGroupsById: 'group/getGroupsById',

      nonReadCommentsById: 'group/nonReadCommentsById',
      getAssigneeIconDrop: 'group/getAssigneeIconDrop',
    }),
    ...mapGetters(['layout', 'isDesktopDevice']),

    isItemSelected() {
      return !this.movingItem && this.selectedItems.includes(this.item.id)
    },
    isItemMainSelection() {
      return this.item.id === this.mainSelection
    },
    assignUserProfiles() {
      return this.getAssigneeIconDrop(this.item, uid => this.assignUser(uid))
    },
    
    nonReadComments() {
      return this.nonReadCommentsById(this.item.group, this.item.id).length
    },
    isGroupOwner() {
      return (this.itemGroup && this.itemGroup.userId === this.userInfo.userId)
    },
    itemGroup() {
      if (!this.item.group)
        return null
      return this.getGroupsById([this.item.group])[0]
    },
  },
  watch: {
    isItemMainSelection() {
      this.bindMainSelection()
    },
    completed() {
      if (this.completed)
        this.animate(this.completed)
    },
    completedItem() {
      this.completed = this.completedItem
    },
    canceledItem() {
      this.canceled = this.canceledItem
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

.sortable-ghost.ItemTemplate .cont,
.sortable-ghost.ItemTemplate .icon-wrapper,
.sortable-ghost.ItemTemplate .info {
  display: none;
}

</style>

<style scoped>

.ItemTemplate {
  position: relative;
  transition-duration: .2s;
  margin: 0;
  z-index: 5;
}

.isEditing {
  margin: 70px 0 !important;
  z-index: 6;
}

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
