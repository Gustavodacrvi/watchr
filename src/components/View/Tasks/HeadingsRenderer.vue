<template>
  <div v-if="defer(2)" class="HeadingsWrapper">
    <transition-group
        class="front headings-root"
        tag="div"
        ref='headings-root'
        @enter='enter'
        @leave='leave'
      >
      <HeadingVue v-for="(h, i) in headings" :key="h.id"
        :header='h'
        :ref='h.id'

        v-bind="h"

        :headingEditOptions='headingEditOptions'
        :color='h.color ? h.color : ""'
        :options='h.options'
        :archive='h.archive'
        :autoSchedule='h.autoSchedule'
        :length='getContHeight(h)'

        @option-click='v => getOptionClick(h)(v)'
        @save-notes='v => getNotesOption(h)(v)'
        :save='h.onEdit'

        :data-id='h.id'
      >
        <ListRenderer
          v-bind="{...$props}"

          :ref='h.id'
          :items='h.items'
          :headings='emptyHeadings'
          :isSmart='isSmart'
          :rootItemsObj='newItemsObj'
          :mainFallbackItem='mainFallbackItem'
          :showAllHeadingsItems='showAllHeadingsItems'
          :itemIconDropOptions='itemIconDropOptions'
          :getItemFirestoreRef='getItemFirestoreRef'
          :disableFallback='disableFallback'
          :onAddExistingItem='onAddExistingItem'

          :itemPlaceholder='h.itemPlaceholder || itemPlaceholder'
          :comp='h.comp || comp'
          :editComp='h.editComp || editComp'

          :hideListName="h.hideListName"
          :isRootAddingHeadings='isRootAddingHeadings'
          :hideGroupName="h.hideGroupName"
          :viewName='viewName'
          :viewType='viewType'
          :changingRootView='changingView'
          :rootHeadings='getLazyHeadingsIds'
          :headingFilterFunction='h.filterFunction'
          :headingFallbackItem='h.fallbackItem'
          :disableCalendarStr='h.disableCalendarStr'
          :itemModelFallback='{
            ...itemModelFallback, ...(h.itemModelFallback || {}),
          }'
          :disableDeadlineStr='h.disableDeadlineStr'
          :allowLogStr='h.logStr'
          :disableSortableMount='h.disableSortableMount'
          :hideFolderName="h.hideFolderName"
          :showHeadingName="h.showHeadingName"
          :onSortableAdd='h.onSortableAdd'
          :addedHeading='justAddedHeading'
          @add-heading='addHeading'
          @update="ids => updateHeadingItemIds(h,ids)"
          @go='moveItemHandlerSelection'
          @items-ids='ids => getItemsIds(ids, i)'
          @added-heading-complete-mount='addedHeadingCompleteMount'

          :header="h"
          :addItem="h.onAddItem"
          :headingPosition='i + 1'
        />
      </HeadingVue>
    </transition-group>
  </div>
</template>

<script>

import HeadingVue from './../Headings/Heading.vue'
import Defer from '@/mixins/defer'

import { mapGetters } from 'vuex'

import { Sortable } from 'sortablejs'


export default {
  mixins: [
    Defer(),
  ],
  components: {
    HeadingVue,
    ListRenderer: () => import('./ListRenderer.vue'),
  },
  props: ['headings', 'viewType', 'viewName', 'viewNameValue', 'mainFallbackItem', 'showAllHeadingsItems', 'newItemsObj', 'changingView',
  , 'justAddedHeading', 'showingRuler', 'itemModelFallback', 'rootItemsObj',
  'headingEditOptions', 'itemIconDropOptions', 'itemCompletionCompareDate', 'comp', 'editComp', 'isSmart', 'getItemFirestoreRef', 'itemPlaceholder', 'onAddExistingItem', 'disableFallback', 'isRootAddingHeadings', 'showHeadingFloatingButton', 'updateHeadingIds'],
  data() {
    return {
      sortable: null,

      itemsIdsObj: {}
    }
  },
  mounted() {
    this.mountSortable()
  },
  beforeUpdate() {
    if (this.sortable === null)
      this.mountSortable()
  },
  beforeDestroy() {
    this.$emit('headings-items-ids', [])
    if (this.sortable)
      this.sortable.destroy()
  },
  methods: {
    toggleCompletion(ids) {
      this.forEachRenderer(vm => vm.toggleCompletion(ids))
    },
    applyAutoScheduleToHeading(obj, headingId, calendarDate) {
      this.findHeading(headingId, vm => vm.applyAutoSchedule(obj, calendarDate))
    },
    findHeading(headingId, callback) {
      if (this.$refs[headingId] && this.$refs[headingId][1])
        callback(this.$refs[headingId][1])
    },
    applyAutoSchedule(obj, calendarDate) {
      let endTime = obj.time
      this.forEachRenderer(vm => {
        const res = vm.applyAutoSchedule({...obj, time: endTime}, calendarDate)
        if (res) endTime = res
      })
    },
    selectAll() {
      this.forEachRenderer(vm => vm.selectAll())
    },
    forEachRenderer(callback) {
      const keys = Object.keys(this.$refs)
      keys.forEach(k => {
        if (this.$refs[k] && this.$refs[k][1] && this.$refs[k][1].selectAll)
          callback(this.$refs[k][1])
      })
    },
    getContHeight(h) {
      const l = h.items.length
      if (!this.showAllHeadingsItems)
        return l >= 3 ? 3 : l || 1
      return l || 1
    },
    addedHeadingCompleteMount() {
      this.$emit("added-heading-complete-mount")
    },
    getItemsIds(ids, i) {
      this.itemsIdsObj = {
        ...this.itemsIdsObj,
        [i]: ids,
      }
    },
    mountSortable() {
      if (this.displayPriority > 2) {
        const el = this.$refs['headings-root'].$el
        if (el) {
          this.sortable = new Sortable(el, {
            disabled: !this.updateHeadingIds,
            group: 'headings',
            delay: this.isDesktopDevice ? 15 : 150,
            animation: 200,
            handle: '.handle',
      
            onUpdate: () => {
              const ids = this.getHeadingsIds()
              if (this.updateHeadingIds)
                this.updateHeadingIds(ids)
            },
            onStart: () => {
              this.$store.commit('moving', true)
            },
            onEnd: () => {
              this.$store.commit('moving', false)
            },
          })
        }
      }
    },
    getHeadingsIds() {
      const el = this.$refs['headings-root'].$el
      if (el) {
        const childs = el.childNodes
        const arr = []
        for (const c of childs) {
          arr.push(c.dataset.id)
        }
        return arr
      }
    },
    getOptionClick(h) {
      if (!h.optionClick) return () => {}
      return h.optionClick
    },
    getNotesOption(h) {
      if (!h.saveNotes) return () => {}
      return h.saveNotes
    },
    updateHeadingItemIds(h, ids) {
      if (h.updateIds)
        h.updateIds(ids)
    },
    moveItemHandlerSelection(bool) {
      this.$emit('go', bool)
    },
    addHeading(obj) {
      this.$emit("add-heading", obj)
    },

    enter(el, done) {
      if (!this.isDesktopBreakPoint)
        return done()
      const w = el.style

      const vm = this.$refs[el.dataset.id][0]

      const s = vm.$refs['header-wrapper'].style

      const heading = this.headings.find(head => head.id === el.dataset.id) || {}

      const isFirst = this.headings[0].id === el.dataset.id

      s.transitionDuration = 0
      w.transitionDuration = 0
      w.marginTop = 0
      w.opacity = 0
      s.height = 0
      s.margin = 0
      s.padding = 0
      s.borderBottom = `0px ${heading.archive ? "dashed" : "solid"} var(--back-color)`

      requestAnimationFrame(() => {
        s.transitionDuration = '.15s'
        w.transitionDuration = '.15s'

        s.marginBottom = 0
        if (!isFirst)
          w.marginTop = '65px'
        s.height = '25px'
        s.borderBottom = `1px ${heading.archive ? "dashed" : "solid"} var(--light-gray)`
        w.opacity = 1
        s.padding = '0 4px'
        s.overflow = 'visible'
        setTimeout(() => {
          w.removeProperty('margin-top')
          done()
        }, 215)
      })
    },
    leave(el, done) {
      if (!this.isDesktopBreakPoint)
        return done()
      const w = el.style

      const vm = this.$refs[el.dataset.id][0]

      const s = vm.$refs['header-wrapper'].style
      let c = vm.$refs['cont'].style

      const heading = this.headings.find(head => head.id === el.dataset.id) || {}

      const isFirst = this.headings[0].id === el.dataset.id

      if (c)
        c.transitionDuration = 0
      s.transitionDuration = 0
      w.transitionDuration = 0
      
      s.marginBottom = 0
      if (!isFirst)
        w.marginTop = '65px'
      s.height = '25px'
      s.borderBottom = `1px ${heading.archive ? "dashed" : "solid"} var(--light-gray)`
      w.height = el.offsetHeight + 'px'
      w.opacity = 1
      s.padding = '0 4px'
      s.overflow = 'hidden'

      requestAnimationFrame(() => {
        if (c) {
          c.transitionDuration = '.15s'
          c.height = 0
          c.overflow = 'hidden'
        }
  
        s.transitionDuration = '.15s'
        w.transitionDuration = '.15s'
        w.opacity = 0
        w.height = 0
        w.overflow = 'hidden'
        w.margin = 0
        s.height = 0
        s.overflow = 'hidden'
        s.margin = 0
        s.padding = 0
        s.borderBoddom = `0px ${heading.archive ? "dashed" : "solid"} var(--back-color)`
  
        setTimeout(done, 175)
      })

    },
  },
  computed: {
    ...mapGetters(['isDesktopBreakPoint', 'isDesktopDevice']),
    emptyHeadings() {
      return []
    },
    getLazyHeadingsIds() {
      return this.headings.map(el => el.id)
    },
  },
  watch: {
    viewName() {
      this.itemsIdsObj = {}
      if (this.sortable)
        this.sortable.options.disabled = !this.updateHeadingIds
    },
    updateHeadingIds() {
      if (this.sortable)
        this.sortable.options.disabled = !this.updateHeadingIds
    },
    itemsIdsObj() {
      const keys = Object.keys(this.itemsIdsObj)
      const ids = []
      for (let i = 0;i < keys.length;i++)
        ids.push(this.itemsIdsObj[i])
      this.$emit('headings-items-ids', ids.flat())
    },
  },
}

</script>
