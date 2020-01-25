
import { mapGetters, mapState } from "vuex"

import utilsTask from '@/utils/task'
import utilsMoment from '@/utils/moment'
import utils from '@/utils/index'

export default {
  props: ['multiSelectOptions'],
  data() {
    return {
      startX: 0,
      startY: 0,
      startTime: 0,
      initialScroll: 0,
      moved: false,
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
    if (this.isDesktop)
      this.bindContextMenu(this.options)
    
    window.addEventListener('click', this.deselectItem)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.deselectItem)
  },
  methods: {
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
      }, 350)
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

      const fail = this.fail || time > 250

      const toggleItem = () => {
        if (!this.isItemSelected && !this.stopTouchEvents)
          this.selectItem()
        else this.deselectItem()
      }

      if (select) {
        this.selectItem()
      } else {
        if (!this.isSelecting) {
          if (!this.moved && !this.stopTouchEvents) this.isEditing = true
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
        else this.dispatchUncompleteItem
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
    }),
    ...mapGetters(['isDesktop'])
  },
  watch: {
    completedItem() {
      this.completed = this.completedItem
    },
    canceledItem() {
      this.canceled = this.canceledItem
    },
    selectedItems() {
      if (this.isDesktop)
        if (this.selectedItems && this.selectedItems.length > 0)
          this.bindContextMenu(this.multiSelectOptions)
        else this.bindContextMenu(this.options)
    },
  },
}
