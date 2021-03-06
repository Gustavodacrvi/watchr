<template>
  <div class="FilterTags">
    <div class="tags" :class="{margins: tags.length > 0}">
      <Tag class="tag" v-for="t in tags" :key="t.id"
        :value="t.name"
        :selected='isTagSelected(t.name)'
        :extraIcon='getTagExclusiveIcon(t.name)'
        icon="tag"
        @click="emit('tag', t.name)"
      />
    </div>
    <div class="tags" :class="{margins: showPrioritiesMargin}">
      <Tag class="tag" v-for="p in priorities" :key="p"
        :value="p"
        :selected='isPrioritySelected(p)'
        :extraIcon='getPriorityExclusiveIcon(p)'
        icon="priority"
        @click="emit('priority', p)"
      />
    </div>
    <div class="tags" :class="{margins: showListMargin}">
      <Tag class="tag" v-for="l in lists" :key="l.id"
        :value="l.name"
        :selected='inclusiveList === l.name || exclusiveLists.includes(l.name)'
        :extraIcon="getListExclusiveIcon(l.name)"
        icon="tasks"
        @click="emit('list', l.name)"
      />
    </div>
    <div class="tags" :class="{margins: showFoldersMargin}">
      <Tag class="tag" v-for="l in folders" :key="l.id"
        :value="l.name"
        :selected='inclusiveFolder === l.name || exclusiveFolders.includes(l.name)'
        :extraIcon="getFolderExclusiveIcon(l.name)"
        icon="folder"
        @click="emit('folder', l.name)"
      />
    </div>
    <div class="tags" :class="{margins: showGroupsMargin}">
      <Tag class="tag" v-for="l in groups" :key="l.id"
        :value="l.name"
        :selected='inclusiveGroup === l.name || exclusiveGroups.includes(l.name)'
        :extraIcon="getGroupExclusiveIcon(l.name)"
        icon="group"
        @click="emit('group', l.name)"
      />
    </div>
  </div>
</template>

<script>

import Tag from './../../Tag.vue'

export default {
  components: {
    Tag,
  },
  props: ['exclusiveTags', 'inclusiveTags', 'inclusivePriority', 'exclusivePriorities', 'inclusiveList', 'exclusiveLists', 'inclusiveFolder', 'exclusiveFolders', 'inclusiveGroup', 'exclusiveGroups', 'tags', 'priorities', 'lists', 'folders', 'groups'],
  methods: {
    emit(evt, name) {
      this.$emit(evt, name)
    },
    
    isTagSelected(name) {
      return this.inclusiveTags.includes(name) || this.exclusiveTags.includes(name)
    },
    isPrioritySelected(name) {
      return this.inclusivePriority === name || this.exclusivePriorities.includes(name)
    },
    getPriorityExclusiveIcon(name) {
      if (this.exclusivePriorities.includes(name))
        return 'close'
      return null
    },
    getTagExclusiveIcon(name) {
      if (this.exclusiveTags.includes(name))
        return 'close'
      return null
    },
    getListExclusiveIcon(name) {
      if (this.exclusiveLists.includes(name))
        return 'close'
      return null
    },
    getFolderExclusiveIcon(name) {
      if (this.exclusiveFolders.includes(name))
        return 'close'
      return null
    },
    getGroupExclusiveIcon(name) {
      if (this.exclusiveGroups.includes(name))
        return 'close'
      return null
    },
  },
  computed: {
    showPrioritiesMargin() {
      return this.tags.length === 0 && this.priorities.length > 0
    },
    showListMargin() {
      return this.tags.length === 0 && !this.showPrioritiesMargin && this.lists.length > 0
    },
    showFoldersMargin() {
      return this.tags.length === 0 && !this.showListMargin && !this.showPrioritiesMargin && this.folders.length > 0
    },
    showGroupsMargin() {
      return this.tags.length === 0 && !this.showListMargin && !this.showPrioritiesMargin && !this.showFoldersMargin && this.groups.length > 0
    },
  },
}

</script>

<style scoped>

.tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  margin: 0;
  transition-duration: .15s;
  z-index: 199;
}

.margins {
  transition-duration: .15s;
  margin-top: 30px;
}

.tag {
  margin-top: 4px;
}

</style>
