<template>
  <div class="FilterTags">
    <div class="tags" :class="{margins: tags.length > 0}">
      <Tag class="tag" v-for="t in tags" :key="t.id"
        :value="t.name"
        :selected='isTagSelected(t.name)'
        :extraIcon='getTagExclusiveIcon(t.name)'
        icon="tag"
        @click="$parent.$emit('tag', t.name)"
      />
    </div>
    <div class="tags" :class="{margins: priorities.length > 0}">
      <Tag class="tag" v-for="p in priorities" :key="p"
        :value="l[p]"
        :selected='isPrioritySelected(p)'
        :extraIcon='getPriorityExclusiveIcon(p)'
        icon="priority"
        @click="$parent.$emit('priority', p)"
      />
    </div>
    <div class="tags" :class="{margins: lists.length > 0}">
      <Tag class="tag" v-for="l in lists" :key="l.id"
        :value="l.name"
        :selected='inclusiveList === l.name || exclusiveLists.includes(l.name)'
        :extraIcon="getListExclusiveIcon(l.name)"
        icon="tasks"
        @click="$parent.$emit('list', l.name)"
      />
    </div>
    <div class="tags" :class="{margins: folders.length > 0}">
      <Tag class="tag" v-for="l in folders" :key="l.id"
        :value="l.name"
        :selected='inclusiveFolder === l.name || exclusiveFolders.includes(l.name)'
        :extraIcon="getFolderExclusiveIcon(l.name)"
        icon="folder"
        @click="$parent.$emit('folder', l.name)"
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
  props: ['exclusiveTags', 'inclusiveTags', 'inclusivePriority', 'exclusivePriorities', 'inclusiveList', 'exclusiveLists', 'inclusiveFolder', 'exclusiveFolders', 'tags', 'priorities', 'lists', 'folders'],
  methods: {
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
  }
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
  margin-top: 30px;
}

.tags + .margins {
  margin-top: 4px;
}

.tag {
  margin-top: 4px;
}

</style>
