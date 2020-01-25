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
      :notes='notes'
      :icon='icon'
      :optionsHandle='optionsHandle'
      :viewNameValue='viewNameValue'
    />
    <Info class="tags" v-if="defer(2)"
      :headerTags='headerTags'
      :deadline='deadline'
      :headerCalendar='headerCalendar'

      :save='saveHeaderContent'
      :removeHeaderTag='removeHeaderTag'
    />
    <HeaderFiles v-if="defer(3) && files"
      :files='files'
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
    <NotesApp class="tags" :notes='notes' @save-notes="saveNotes"/>
  </div>
</template>

<script>

import NotesApp from './../Notes.vue'
import HeaderFiles from './HeaderFiles.vue'
import Info from './Info.vue'
import HeaderBar from './Bar.vue'
import FilterTags from './FilterTags.vue'
import Defer from '@/mixins/defer'

export default {
  mixins: [
    Defer(),
  ],
  props: ['viewName', 'viewNameValue', 'options', 'tags', 'lists', 'icon', 'viewType', 'isSmart', 'notes', 'progress', 'deadline', 'headerTags', 'headerCalendar', 'files', 'exclusiveTags', 'priorities', 'inclusiveTags', 'inclusivePriority', 'exclusivePriorities', 'inclusiveList', 'exclusiveLists', 'inclusiveFolder', 'exclusiveFolders', 'folders', 'optionsHandle',  'saveHeaderContent', 'extraIcons','removeHeaderTag'],
  components: {
    FilterTags,
    HeaderBar,
    HeaderFiles,
    NotesApp,
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
