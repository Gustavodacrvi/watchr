<template>
  <div v-if="defer(2)" class="HeadingsWrapper">
    <transition-group
        appear
        class="front headings-root"
        :name="headingsTrans"
        tag="div"
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
          :itemPlaceholder='itemPlaceholder'
          :disableFallback='disableFallback'
          :onAddExistingItem='onAddExistingItem'

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
          :comp='comp'
          :showHeadingName="h.showHeadingName"
          :scheduleObject='scheduleObject'
          :editComp='editComp'
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
  },
  computed: {
    ...mapGetters(['isDesktop']),
    emptyHeadings() {
      return []
    },
    headingsTrans() {
      if (this.isDesktop) return 'head-t'
      return (this.isChangingViewName) ? '' : 'head-t'
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

<style>

.head-t-enter {
  transition-duration: 0s;
  margin: 0;
}

.head-t-enter .header-wrapper, .head-t-leave-to .header-wrapper {
  transition-duration: 0;
  height: 0 !important;
  margin: 0 !important;
  margin-bottom: 0 !important;
  padding: 0 !important;
  opacity: 0 !important;
  border-bottom: 0px solid var(--back-color);
}

.head-t-leave-to .header-wrapper {
  transition-duration: .6s;
}

.head-t-enter-to, .head-t-leave {
  transition-duration: .6s;
  margin: 14px 0;
}

.head-t-enter-to .header-wrapper, .head-t-leave .header-wrapper {
  transition-duration: .6s;
  margin-top: 20px;
  margin-bottom: 0px !important;
  height: 50px !important;
  border-bottom: 1.5px solid var(--light-gray);
  opacity: 1 !important;
  padding: 0 6px !important;
}

</style>
