
import { mapGetters, mapState } from "vuex"

import utilsTask from '@/utils/task'
import utilsMoment from '@/utils/moment'
import utils from '@/utils/index'

export default {
  props: ['multiSelectOptions', 'comp', 'isSelecting', 'viewName', 'viewNameValue', 'waitForAnotherItemComplete', 'movingItem'],
  data() {
    return {
      startX: 0,
      startY: 0,
      startTime: 0,
      initialScroll: 0,
      moved: false,
      onHover: false,
      changeColor: false,
      stopTouchEvents: false,
      right: 0,
      fail: false,
      timeout: null,
      checkStartTimeout: null,
      completed: false,
      canceled: false,
      completeAnimation: false,
    }
  },
  created() {
    this.completed = this.completedItem
    this.canceled = this.canceledItem
  },
  mounted() {
    this.bindMainSelection()
    if (this.isDesktop)
      this.bindContextMenu(this.options)
    
    window.addEventListener('click', this.deselectItem)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.deselectItem)

    if (this.isItemMainSelection)
      window.removeEventListener('keydown', this.mainSelectionKeyDown)
  },
  methods: {
    commentsPopup() {
      this.$store.dispatch('pushPopup', {
        comp: "Comments",
        payload: {
          groupId: this.item.group,
          id: this.item.id,
        },
      })
    },
    assignItem() {
      this.$store.commit('pushIconDrop', this.assignUserProfiles)
    },
    bindMainSelection() {
      if (this.isDesktop)
        if (this.isItemMainSelection)
          window.addEventListener('keydown', this.mainSelectionKeyDown)
        else
          window.removeEventListener('keydown', this.mainSelectionKeyDown)
    },
    infoEnter(el) {
      const s = el.style

      const {width} = el.getBoundingClientRect()
      s.transitionDuration = 0
      s.width = 0
      s.opacity = 0
      s.marginRight = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.25s'
        s.width = width + 'px'
        s.marginRight = '8px'
        s.opacity = 1
      })
    },
    infoLeave(el) {
      const s = el.style

      s.transitionDuration = '.25s'
      s.width = 0
      s.marginRight = 0
      s.opacity = 0
    },
    mainSelectionKeyDown(evt) {
      const p = () => evt.preventDefault()
      const {key} = evt
      const active = document.activeElement
      const isTyping = active && (active.nodeName === 'INPUT' || active.nodeName === 'TEXTAREA')

      const toggleSelect = () => {
        if (!this.isItemSelected) {
          if (this.selectedItems.length === 0) {
            this.selectItem()
          } else {
            this.selectItem()
          }
        } else {
          this.deselectItem()
        }
      }

      const hasSelected = this.selectedItems.length > 0
      if (!isTyping && !(this.isOnAlt && this.fallbackSelected) && !(hasSelected && this.isOnAlt))
        switch (key) {
          case 'ArrowDown': {
            this.$emit('go', true)
            p()
            break
          }
          case 'ArrowUp': {
            this.$emit('go', false)
            p()
            break
          }
        }

      switch (key) {
        case 'Enter': {
          if (!isTyping)
            if (!this.isOnControl && !this.justSaved)
              this.isEditing = true
            else if (this.isOnControl) {
              toggleSelect()
            }
          break
        }
      }

      if (!this.isOnShift) {
        switch (key) {
          case ' ': {
          if (!isTyping) {
            p()
            this.$emit('add-item-after', 1)
          }
          break
        }}
      }
      if (this.isOnShift && !isTyping) {
        switch (key) {
          case "C": {
            if (!this.isEditing && this.comp === 'Task') {
              this.isEditing = true
              this.editAction = 'addChecklist'
            }
            break
          }
          case "D": {
            if (this.copyItem)
              this.copyItem()
            break
          }
          case ' ': {
            p()
            this.$emit('add-item-after', 0)
            break
          }
        }
      }
      if (this.isOnControl && !this.isOnShift) {
        switch (key) {
          case ' ': {
            if (!isTyping) {
              p()
              this.$emit('add-heading-after', +1)
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
              this.$emit('add-heading-after', 0)
            }
            break
          }
        }
      }
    },
    bindContextMenu(options) {
      utils.bindOptionsToEventListener(this.$el, options, this)
    },
    vibrate() {
      window.navigator.vibrate(100)
    },
    openMobileOptions() {
      this.vibrate()
      this.$store.commit('pushIconDrop', this.options)
    },
    stopMouseUp(evt) {
      if (!this.isDesktop)
        evt.stopPropagation()
    },
    pointerdown(evt) {
      if (!this.isDesktop)
        evt.stopPropagation()
    },
    touchStart(e) {
      this.startTime = new Date()
      const touch = e.changedTouches[0]

      this.startX = touch.clientX
      this.startY = touch.clientY

      this.initialScroll = document.scrollingElement.scrollTop

      this.changeColor = true
      this.timeout = setTimeout(() => {
        if (!this.stopTouchEvents)
          this.openMobileOptions()
      }, 300)
    },
    touchmove(evt) {
      this.moved = true
      const touch = evt.changedTouches[0]
      const move = Math.abs(document.scrollingElement.scrollTop - this.initialScroll) > 5 || Math.abs(touch.clientX - this.startX) > 5 || Math.abs(touch.clientY - this.startY) > 5
      if (move) {
        clearTimeout(this.timeout)
        this.fail = true
      }

      const diff = this.startX - touch.clientX
      if (diff > 25) {
        if (diff < 75)
          this.right = diff
        else this.right = 75
      } else {
        this.right = 0
      }
    },
    touchEnd(e) {
      const select = this.right > 60
      if (this.moved) {
        const cont = this.$refs['cont-wrapper'].style

        cont.transitionDuration = '.2s'
        this.right = 0
        setTimeout(() => {
          cont.transitionDuration = 0
        }, 280)
      }
      
      clearTimeout(this.timeout)
      const time = new Date() - this.startTime

      const fail = this.fail || time > 300

      const toggleItem = () => {
        if (!this.isItemSelected && !this.stopTouchEvents)
          this.selectItem()
        else this.deselectItem()
      }

      if (select) {
        this.selectItem()
      } else {
        if (!this.isSelecting) {
          if (!this.moved && !this.stopTouchEvents && !fail) this.isEditing = true
        } else {
          if (!fail) toggleItem()
        }
      }

      this.fail = false
      this.moved = false
      this.changeColor = false
      this.stopTouchEvents = false
    },
    desktopComplete() {
      if (this.isDesktop)
        this.completeItem()
    },
    desktopCancel() {
      if (this.isDesktop)
        this.cancelItem()
    },
    checkTouchStart() {
      this.stopTouchEvents = true
      this.checkStartTimeout = setTimeout(() => {
        this.vibrate()
        this.cancelItem()
        this.checkStartTimeout = null
      }, 300)
    },
    touchComplete() {
      if (this.checkStartTimeout) {
        this.completeItem() 
        clearTimeout(this.checkStartTimeout)
      }
    },
    deselectItem() {
      setTimeout(() => {
        this.$emit('de-select', this.$el)
      }, 10)
    },
    selectItem() {
      this.$emit('select', this.$el)
    },
    completeItem(force = false) {
      if (this.canceled && !force) {
        this.cancelItem(true)
      } else {
        this.completeAnimation = !this.completed
        this.completed = !this.completed
        if (this.completed)
          this.dispatchCompleteItem()
        else this.dispatchUncompleteItem()
      }
    },
    cancelItem(force = false) {
      if (this.completed && !force) {
        this.completeItem(true)
      } else {
        this.completeAnimation = !this.canceled
        this.canceled = !this.canceled
        if (this.canceled)
          this.dispatchCancelItem()
        else this.dispatchUncancelItem()
      }
    },
  },
  computed: {
    ...mapState({
      selectedItems: state => state.selectedItems,
      mainSelection: state => state.mainSelection,
      isOnControl: state => state.isOnControl,
      isOnShift: state => state.isOnShift,
      isOnAlt: state => state.isOnAlt,

      savedGroups: state => state.group.groups,
      userInfo: state => state.userInfo,
      user: state => state.user,
    }),
    ...mapGetters({
      isDesktop: 'isDesktop',

      nonReadCommentsById: 'group/nonReadCommentsById',
      getAssigneeIconDrop: 'group/getAssigneeIconDrop',
    }),
    isGroupOwner() {
      return (this.itemGroup && this.itemGroup.userId === this.userInfo.userId)
    },
    assignUserProfiles() {
      return this.getAssigneeIconDrop(this.item, uid => this.assignUser(uid))
    },
    itemGroup() {
      return this.savedGroups.find(f => f.id === this.item.group)
    },
    nonReadComments() {
      return this.nonReadCommentsById(this.item.group, this.item.id).length
    },
    isItemMainSelection() {
      return this.item.id === this.mainSelection
    },
    isItemSelected() {
      return !this.movingItem && this.selectedItems.includes(this.item.id)
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
      if (this.isDesktop)
        if (this.selectedItems && this.selectedItems.length > 0)
          this.bindContextMenu(this.multiSelectOptions)
        else this.bindContextMenu(this.options)
    },
  },
}
