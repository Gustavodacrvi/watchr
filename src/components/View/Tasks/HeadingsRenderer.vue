<template>
  <div v-if="defer(2)" class="HeadingsWrapper">
    <transition-group
        appear
        class="front headings-root"
        :name="headingsTrans"
        tag="div"
      >
      <HeadingVue v-for="(h, i) in getHeadings" :key="h.id"
        :header='h'

        v-bind="h"

        :headingEditOptions='headingEditOptions'
        :color='h.color ? h.color : ""'
        :options='h.options ? h.options(h.nonFiltered) : []'
        :movingHeading='movingHeading'

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

export default {
  mixins: [
    Defer(),
  ],
  components: {
    HeadingVue,
    ListRenderer: () => import('./ListRenderer.vue'),
  },
  props: ['headings', 'isChangingViewName', 'showHeading', 'viewType', 'viewName', 'viewNameValue', 'showEmptyHeadings', 'mainFallbackItem', 'showAllHeadingsItems', 'scheduleObject', 'selectEverythingToggle', 
  'headingEditOptions', 'itemIconDropOptions', 'itemCompletionCompareDate', 'comp', 'editComp', 'movingHeading', 'isSmart', 'getItemFirestoreRef', 'itemPlaceholder', 'onAddExistingItem', 'movingButton',  'disableFallback', 'showHeadingFloatingButton'],
  methods: {
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
      return this.getHeadings.map(el => el.id)
    },
    getHeadings() {
      return this.headings.filter(h => {
        if (this.showHeading && this.showHeading(h)) {
          this.stopRootInflation = true
          return true
        }

        return this.showEmptyHeadings || h.items.length > 0
      })
    },
  },
}

</script>

<style scoped>

</style>
