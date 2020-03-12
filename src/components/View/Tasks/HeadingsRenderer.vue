<template>
  <div v-if="defer(2)" class="HeadingsWrapper">
    <transition-group
        appear
        class="front headings-root"
        tag="div"
        @enter='enter'
        @leave='leave'
      >
      <HeadingVue v-for="(h, i) in headings" :key="h.id"
        :header='h'

        v-bind="h"

        :headingEditOptions='headingEditOptions'
        :color='h.color ? h.color : ""'
        :options='h.options'
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
          :mainFallbackItem='mainFallbackItem'
          :showAllHeadingsItems='showAllHeadingsItems'
          :selectEverythingToggle='selectEverythingToggle'
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
          :rootHeadings='getLazyHeadingsIds'
          :rootChanging='isChangingViewName'
          :headingFilterFunction='h.filterFunction'
          :headingFallbackItem='h.fallbackItem'
          :disableCalendarStr='h.disableCalendarStr'
          :disableDeadlineStr='h.disableDeadlineStr'
          :allowLogStr='h.logStr'
          :disableSortableMount='h.disableSortableMount'
          :hideFolderName="h.hideFolderName"
          :showHeadingName="h.showHeadingName"
          :scheduleObject='h.scheduleObject || scheduleObject'
          :onSortableAdd='h.onSortableAdd'
          :addedHeading='justAddedHeading'
          @add-heading='addHeading'
          @update="ids => updateHeadingItemIds(h,ids)"
          @go='moveItemHandlerSelection'
          @change-time='changeTime'
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
  props: ['headings', 'isChangingViewName', 'viewType', 'viewName', 'viewNameValue', 'mainFallbackItem', 'showAllHeadingsItems'
  , 'scheduleObject', 'selectEverythingToggle', 'justAddedHeading',
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
        const el = this.$el.getElementsByClassName('headings-root')[0]
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
      const el = this.$el.getElementsByClassName('headings-root')[0]
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
    changeTime(args) {
      this.$emit('change-time', args)
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
      const s = el.getElementsByClassName('header-wrapper')[0].style

      const isFirst = this.headings[0].id === el.dataset.id

      s.transitionDuration = 0
      w.transitionDuration = 0
      w.marginTop = 0
      w.opacity = 0
      s.height = 0
      s.margin = 0
      s.padding = 0
      s.borderBoddom = '0px solid var(--back-color)'

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        w.transitionDuration = '.2s'

        s.marginBottom = 0
        if (!isFirst)
          w.marginTop = this.isDesktopDevice ? '45px': '4px'
        s.height = '35px'
        s.borderBottom = '1.5px solid var(--light-gray)'
        w.opacity = 1
        s.padding = '0 6px'
        s.overflow = 'visible'
        setTimeout(() => {
          w.removeProperty('margin-top')
          done()
        }, 215)
      })
    },
    leave(el, done) {
      if (this.isChangingViewName || !this.isDesktopBreakPoint)
        return done()
      const w = el.style
      const s = el.getElementsByClassName('header-wrapper')[0].style
      let c = el.getElementsByClassName('cont')[0]

      if (c) {
        c = c.style
        c.transitionDuration = '.2s'
        c.height = 0
        c.overflow = 'visible'
      }

      s.transitionDuration = '.2s'
      w.transitionDuration = '.2s'
      w.opacity = 0
      w.height = 0
      w.overflow = 'visible'
      s.height = 0
      s.overflow = 'visible'
      s.margin = 0
      s.padding = 0
      s.borderBoddom = '0px solid var(--back-color)'

      setTimeout(done, 205)
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
