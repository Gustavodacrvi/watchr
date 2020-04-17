<template>
  <div
    class="ItemTemplate item-handle draggable"
    :class="[layout, {isItemSelected, isItemMainSelection, isEditing, listRenderer}]"

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
        :showInfo='showInfo'
        :isAdding='isAdding'
        :listRenderer='listRenderer'
        :itemHeight='itemHeight'
        :editAction='editAction'
        :editComponent='editComponent'
        :itemModelFallback='itemModelFallback'
        :changingView='changingView'
        :editRawPlaceholder='editRawPlaceholder'

        @toggle-complete='toggleComplete'
        @save='save'
        @toggle-cancel='toggleCancel'
        @close="close"
      >
        <template v-slot:check-icon='props'>
          <slot name="check-icon"
            :completed='completed'
            :canceled='canceled'
            :isEditing='isEditing'
            :color='props.iconColor'
            :itemModel='props.itemModel'
            :forceDefault='props.forceDefault'
          ></slot>
        </template>
        <template v-slot:root>

          <CommentCounter v-if="item && item.group && isDesktopBreakPoint && !isEditing"
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
        <template v-slot:flex-end>
          <slot name="flex-end"></slot>
        </template>

      </ItemCont>
    </div>
  </div>
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
    'itemHeight', 'item', 'editRawPlaceholder', 'isAdding', 
    'multiSelectOptions', 'movingItem', 'isSelecting', 'comp',
    'completedItem', 'canceledItem', 'waitForAnotherItemComplete',
    'editComponent', 'itemModelFallback', 'listRenderer', 'showInfo',
    'isRepeatingItem', 'changingView',

    'options',
  ],
  data() {
    return {
      justSaved: false,
      isEditing: false,
      completeAnimation: false,
      onHover: false,
      editAction: null,
      
      completed: false,
      canceled: false,
    }
  },
  created() {
    this.completed = this.completedItem
    this.canceled = this.canceledItem
    setTimeout(() => {
      if (!this.listRenderer)
        this.isEditing = true
    }, 50)
  },
  methods: {
    ...mapMutations(['saveMainSelection']),
    
    save(obj) {
      if (this.isAdding)
        this.$parent.$emit('save', obj)
      else {
        if (!obj.handleFiles)
          this.isEditing = false
        
        this.$emit('save', obj)
      }
    },
    click(evt) {
      if (!this.isSelecting && this.isDesktopDevice && !this.isEditing) {
        this.isEditing = true
        evt.stopPropagation()
      }
    },
    cancel() {
      this.$parent.$emit('cancel')
    },
    close() {
      this.isEditing = false
      if (!this.isAdding)
        this.saveMainSelection(this.item.id)
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
        const anticipate = (this.isRepeatingItem && this.viewName !== 'Today' && this.comp === "Task")
        this.completed = !this.completed || anticipate
        this.animate(this.completed || anticipate)
        this.$nextTick(() => {
          if (this.completed || anticipate) {
            this.$emit('complete-item')
          } else this.$emit('uncomplete-item')
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
      if (!this.item)
        return;
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
              this.editAction = vm => vm.$refs.checklist.addEdit()
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

    isItemSelected() {
      if (!this.item)
        return false
      return this.selectedItems.includes(this.item.id)
    },
    isItemMainSelection() {
      if (!this.item)
        return;
      return this.item.id === this.mainSelection
    },
    assignUserProfiles() {
      return this.getAssigneeIconDrop(this.item, uid => this.assignUser(uid))
    },
    
    
    nonReadComments() {
      if (!this.item)
        return;
      return this.nonReadCommentsById(this.item.group, this.item.id).length
    },
    isGroupOwner() {
      return (this.itemGroup && this.itemGroup.userId === this.userInfo.userId)
    },
    itemGroup() {
      if (!this.item)
        return null
      return this.getGroupsById([this.item.group])[0]
    },
  },
  watch: {
    isItemMainSelection() {
      this.bindMainSelection()
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

.mobile.sortable-ghost.ItemTemplate .cont-wrapper {
  height: 50px;
}

.sortable-ghost.ItemTemplate .cont,
.sortable-ghost.ItemTemplate .icon-wrapper,
.sortable-ghost.ItemTemplate .CheckIcon,
.sortable-ghost.ItemTemplate .ruler-element,
.sortable-ghost.ItemTemplate .main-cont,
.sortable-ghost.ItemTemplate .text,
.sortable-ghost.ItemTemplate .info {
  display: none;
}

.ItemTemplate.isItemSelected .cont-wrapper {
  background-color: rgba(53, 73, 90, 0.6) !important;
  box-shadow: 1px 0 1px rgba(53, 73, 90, 0.1);
  cursor: grab;
}

.sortable-ghost.ItemTemplate .cont-wrapper {
  background-color: var(--sidebar-color) !important;
  box-shadow: inset 0 10px 8px -13px rgba(5,5,5, .7),
    inset 0 -10px 5px -13px rgba(210,210,210, .7);
  transition-duration: 0;
  height: 38px;
  padding: 0;
}

.moving .ItemTemplate.isItemSelected .cont-wrapper {
  box-shadow: inset 0 10px 8px -13px rgba(5,5,5, .7),
    inset 0 -10px 5px -13px rgba(210,210,210, .7);
  background-color: var(--sidebar-color);
}


</style>

<style scoped>

.ItemTemplate {
  position: relative;
  height: auto;
  z-index: 5;
}

.cont-wrapper {
  position: relative;
  z-index: 5;
  margin: 0;
  transition-duration: .15s;
  height: 100%;
  user-select: none;
}

.isEditing.listRenderer .cont-wrapper {
  margin: 70px 0 !important;
}

.isEditing {
  transition-duration: .15s;
  z-index: 6;
}


.notMoving .desktop .cont-wrapper:hover, .desktop .cont-wrapper:active, .isItemMainSelection .cont-wrapper {
  background-color: var(--light-gray);
}

</style>
