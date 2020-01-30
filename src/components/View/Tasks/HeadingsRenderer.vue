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
        :options='h.options ? h.options(h.nonFiltered) : []'
        :movingHeading='movingHeading'
        :length='h.items.length'

        @option-click='v => getOptionClick(h)(v)'
        @save-notes='v => getNotesOption(h)(v)'
        :save='h.onEdit'

        :data-id='h.id'
      >
        <ListRenderer
          v-bind="{...$props}"

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
          :viewName='viewName'
          :viewType='viewType'
          :rootHeadings='getLazyHeadingsIds'
          :rootChanging='isChangingViewName'
          :headingFilterFunction='h.filterFunction'
          :headingFallbackItem='h.fallbackItem'
          :allowCalendarStr='h.calendarStr'
          :disableSortableMount='h.disableSortableMount'
          :hideFolderName="h.hideFolderName"
          :showHeadingName="h.showHeadingName"
          :scheduleObject='scheduleObject'
          :onSortableAdd='h.onSortableAdd'
          :isLast='(i + 1) === headings.length'
          @add-heading='addHeading'
          @update="ids => updateHeadingItemIds(h,ids)"
          @go='moveItemHandlerSelection'
          @change-time='changeTime'

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
  props: ['headings', 'isChangingViewName', 'viewType', 'viewName', 'viewNameValue', 'mainFallbackItem', 'showAllHeadingsItems', 'scheduleObject', 'selectEverythingToggle', 
  'headingEditOptions', 'itemIconDropOptions', 'itemCompletionCompareDate', 'comp', 'editComp', 'isSmart', 'getItemFirestoreRef', 'itemPlaceholder', 'onAddExistingItem', 'movingButton',  'disableFallback', 'showHeadingFloatingButton', 'updateHeadingIds'],
  data() {
    return {
      sortable: null,
      movingHeading: false,
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
    if (this.sortable)
      this.sortable.destroy()
  },
  methods: {
    mountSortable() {
      if (this.displayPriority > 2) {
        const el = this.$el.getElementsByClassName('headings-root')[0]
        if (el) {
          this.sortable = new Sortable(el, {
            disabled: !this.updateHeadingIds,
            group: 'headings',
            delay: 150,
            animation: 80,
            delayOnTouchOnly: true,
            handle: '.handle',
      
            onUpdate: () => {
              const ids = this.getHeadingsIds()
              if (this.updateHeadingIds)
                this.updateHeadingIds(ids)
            },
            onStart: evt => {
              this.movingHeading = true
            },
            onEnd: evt => {
              this.movingHeading = false
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
      const w = el.style
      const s = el.getElementsByClassName('header-wrapper')[0].style

      s.transitionDuration = 0
      w.transitionDuration = 0
      w.opacity = 0
      s.height = 0
      s.margin = 0
      s.padding = 0
      s.borderBoddom = '0px solid var(--back-color)'

      requestAnimationFrame(() => {
        s.transitionDuration = '.4s'
        w.transitionDuration = '.4s'

        s.marginTop = '20px'
        s.marginBottom = 0
        s.height = '50px'
        s.borderBottom = '1.5px solid var(--light-gray)'
        w.opacity = 1
        s.padding = '0 6px'
        s.overflow = 'hidden'
        setTimeout(done, 400)
      })
    },
    leave(el, done) {
      const w = el.style
      const s = el.getElementsByClassName('header-wrapper')[0].style

      s.transitionDuration = '.4s'
      w.transitionDuration = '.4s'
      w.opacity = 0
      w.height = 0
      w.overflow = 'hidden'
      s.height = 0
      s.overflow = 'hidden'
      s.margin = 0
      s.padding = 0
      s.borderBoddom = '0px solid var(--back-color)'

      setTimeout(done, 400)
    },
  },
  computed: {
    ...mapGetters(['isDesktop']),
    emptyHeadings() {
      return []
    },
    runHeadingsTransition() {
      return this.isDesktop || this.isChangingViewName
    },
    getLazyHeadingsIds() {
      return this.headings.map(el => el.id)
    },
  },
  watch: {
    viewName() {
      if (this.sortable)
        this.sortable.options.disabled = !this.updateHeadingIds
    },
    updateHeadingIds() {
      if (this.sortable)
        this.sortable.options.disabled = !this.updateHeadingIds
    },
  },
}

</script>
