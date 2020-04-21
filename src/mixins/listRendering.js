
import { Sortable } from 'sortablejs'

import utils from "@/utils"

import { mapGetters, mapState } from 'vuex'

export default {
  data() {
    return {
      completeAnimationStack: [],
      completeAnimationSettimeout: null,
      selectedElements: [],
      lastSelectedId: null,
      oldRemovedIndicies: [],
    }
  },
  methods: {
    enter(el, done) {
      const id = el.dataset.id
      const type = el.dataset.transition
      if (!type || !id) {
        if (this.setChangingViewTimeout) this.setChangingViewTimeout()
        return done()
      }

      const isAdding = type !== 'display'

      const vm = this.$refs[id][0].$refs.template

      const cont = vm.$refs['cont-wrapper']
      const s = cont.style
      
      s.transitionDuration = '0s'
      s.height = 0
      s.minHeight = 0
      
      if (isAdding) {
        return requestAnimationFrame(() => {
          s.transitionDuration = '.1s'
          s.height = this.itemHeight + 'px'
          setTimeout(() => {
            s.transitionDuration = '.15s'
            s.height = 'auto'
            vm.isEditing = true
            if (this.setChangingViewTimeout) this.setChangingViewTimeout()
            done()
          }, 10)
        })
      }
      const parentIds = this.disableItemEnterTransitionIds || []
      
      let disableTransition = false
      if (parentIds.includes(id)) {
        const i = parentIds.findIndex(id => id === id)
        parentIds.splice(i, 1)
        disableTransition = true
      }

      s.opacity = 0

      requestAnimationFrame(() => {
        s.transitionDuration = disableTransition ? 0 : '.15s'
        s.opacity = 1
        s.height = this.itemHeight + 'px'
        s.minHeight = this.itemHeight + 'px'
        
        setTimeout(() => {
          s.transitionDuration = '.15s'
          s.height = 'auto'
          if (this.setChangingViewTimeout) this.setChangingViewTimeout()
          done()
        }, 151)
      })
    },
    leave(el, done) {
      const id = el.dataset.id
      const type = el.dataset.transition
      if (!id || !type || (type === 'edit'))
        return done()

      const vm = this.$refs[id][0].$refs.template

      const cont = vm.$refs['cont-wrapper']
      const parentIds = this.disableItemEnterTransitionIds || []
      
      let disableTransition = false
      if (parentIds.includes(id)) {
        const i = parentIds.findIndex(id => id === id)
        parentIds.splice(i, 1)
        disableTransition = true
      }

      const s = cont.style

      s.transitionDuration = '0s'
      s.opacity = 1
      s.height = this.itemHeight + (vm.showInfo ? 8 : 0) + 'px'
      s.minHeight = this.itemHeight + (vm.showInfo ? 8 : 0) + 'px'

      const hideItem = () => {
        s.transitionDuration = disableTransition ? 0 : '.15s'
        s.opacity = 0
        s.height = 0
        s.minHeight = 0

        setTimeout(done, disableTransition ? 0 : 201)
      }

      requestAnimationFrame(() => {
        if (!vm.completeAnimation) {
          hideItem()
        } else if (this.waitForAnotherTaskCompleteAnimation) {
          this.waitForAnotherTaskCompleteAnimation(hideItem)
        }
      })
    },

    sortableOnSelect(evt) {
      const id = evt.item.dataset.id

      if (id !== "Edit" && !this.selected.includes(id)) {
        if (this.pressingMultiSelectKeys)
          this.selectMultipleIds(id)
        this.lastSelectedId = id

        this.saveType(id)
        this.$store.commit('selectItem', id)
      }
    },
    onSortableDeselect(evt) {
      const id = evt.item.dataset.id
      this.$store.commit('unselectItem', id)
      if (this.selected.length === 0)
        setTimeout(() => {
          if (this.selected.length === 0)
            this.lastSelectedId = null
        })
    },
    rootClick(event) {
      if (this.selected.length > 0) {
        let found = false
        const path = event.path || (event.composedPath && event.composedPath())
        for (const node of path) {
          if (node.classList && node.classList.contains('ItemTemplate')) {
            found = true
            break
          }
        }

        if (found) event.stopPropagation()
      }
    },
    sortableOnUpdate() {
      setTimeout(() => {
        this.$emit('update', {finalIds: this.getIds(true)})
      }, 10)
    },
    onSortableRemove(evt) {
      const {indicies, items, oldIndicies} = utils.getInfoFromAddSortableEvt(evt)
      utils.removeSortableItemsOnRemove(items, indicies, this.draggableRoot, this.deSelectItem)

      this.oldRemovedIndicies = oldIndicies.slice()
    },
    selectMultipleIds(newId) {
      if (this.lastSelectedId && newId && this.lazyItems.find(el => el.id === newId) && this.lazyItems.find(el => el.id === this.lastSelectedId)) {
        const idsToSelect = []

        let selecting = false
        for (const t of this.lazyItems) {
          const isOneOfTheTwo = t.id === this.lastSelectedId || t.id === newId
          if (selecting && !isOneOfTheTwo) {
            idsToSelect.push(t.id)
          } else if (!selecting && isOneOfTheTwo) {
            selecting = true
          } else if (isOneOfTheTwo) break
        }

        if (idsToSelect.length > 0) {
          const root = this.draggableRoot
          const childNodes = root.childNodes

          const nodes = []
          for (const node of childNodes) {
            if (node.dataset && idsToSelect.includes(node.dataset.id) && !nodes.includes(node)) {
              nodes.push(node)
            }
          }

          for (const node of nodes) {
            this.selectItem(node)
          }
        }
      }
    },

    deselectAll() {
      const els = this.selectedElements
      for (const e of els)
        this.deSelectItem(e)
    },
    saveType(id) {
      if (this.selectedType !== this.comp) {
        this.$store.commit('clearSelected')
        setTimeout(() => {
          this.$store.commit('selectItem', id)
        })
      }
      this.$store.commit('selectType', this.comp)
    },
    deSelectItem(el) {
      this.$store.commit('unselectItem', el.dataset.id)
      Sortable.utils.deselect(el)

      const i = this.selectedElements.findIndex(el => el === el)
      if (i > -1)
        this.selectedElements.splice(i, 1)
    },
    selectItem(el) {
      if (!this.selectedElements.includes(el)) {
        this.selectedElements.push(el)
        this.saveType(el.dataset.id)
        this.$store.commit('selectItem', el.dataset.id)
        Sortable.utils.select(el)
      }
    },

    waitForAnotherTaskCompleteAnimation(hideTaskFunc) {
      this.completeAnimationStack.push(hideTaskFunc)

      if (this.completeAnimationSettimeout)
        clearTimeout(this.completeAnimationSettimeout)
      
      this.completeAnimationSettimeout = setTimeout(() => {
        for (const animate of this.completeAnimationStack)
          animate()
        this.completeAnimationStack = []
      }, 1510)
    },
  },
  computed: {
    ...mapState({
      moving: state => state.moving,
      selected: state => state.selectedItems,
      selectedType: state => state.selectedType,
    }),
    ...mapGetters({
      itemHeight: 'itemHeight',
    }),
  },
  watch: {
    selected() {
      const ids = this.selected
      const removedEls = this.selectedElements.filter(el => el && !ids.find(id => id === el.dataset.id))
      for (const el of removedEls)
        this.deSelectItem(el)
    },
  },
}
