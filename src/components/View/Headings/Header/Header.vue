<template>
  <div
    class="Header"
    id='view-header'
  >
    <HeaderBar
      :progress='progress'
      :viewType='viewType'
      :viewName='viewName'
      :extraIcons='extraIcons'
      :options='options'
      :icon='icon'
      :optionsHandle='optionsHandle'
      :viewNameValue='viewNameValue'
      :saveHeaderName='saveHeaderName'
    />
    <Info v-if="defer(2)"
      :headerInfo='headerInfo'
    />
    <FilterTags v-if="defer(4)"
      :tags='tags'
      :inclusivePriority='inclusivePriority'
      :exclusivePriorities='exclusivePriorities'

      :inclusiveFolder='inclusiveFolder'
      :exclusiveFolders='exclusiveFolders'
      
      :inclusiveList='inclusiveList'
      :exclusiveLists='exclusiveLists'
      
      :priorities='priorities'
      :lists='lists'
      :folders='folders'
      :inclusiveTags='inclusiveTags'
      :exclusiveTags='exclusiveTags'
    />
  </div>
</template>

<script>

import HeaderFiles from './HeaderFiles.vue'
import Info from './Info.vue'
import HeaderBar from './Bar.vue'
import FilterTags from './FilterTags.vue'

import Defer from '@/mixins/defer'

export default {
  mixins: [
    Defer(),
  ],
  props: ['viewName', 'viewNameValue', 'options', 'tags', 'lists', 'icon', 'viewType', 'isSmart', 'notes', 'progress', 'exclusiveTags', 'priorities', 'inclusiveTags', 'inclusivePriority', 'exclusivePriorities', 'inclusiveList', 'exclusiveLists', 'inclusiveFolder', 'exclusiveFolders', 'folders', 'optionsHandle', 'headerInfo',
  'saveHeaderName', 'extraIcons'],
  components: {
    FilterTags,
    HeaderBar,
    HeaderFiles,
    Info,
  },
  methods: {
    saveNotes(notes) {
      this.$parent.$emit('save-notes', notes)
    },
  },
}

</script>

<style scoped>

.Header {
  position: relative;
  z-index: 200;
}

.header, .tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  margin: 0;
  transition-duration: .15s;
}

.tags {
  z-index: 199;
}

</style>
