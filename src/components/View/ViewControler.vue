<template>
  <component :is="viewComp"
    :viewName='viewName'
    :viewType='viewType'
  />
</template>

<script>

import SmartListVue from './ViewTypes/SmartList.vue'
import ListVue from './ViewTypes/List.vue'
import TagVue from './ViewTypes/Tag.vue'

export default {
  props: ['isSmart', 'viewType', 'viewName'],
  components: {
    SmartList: SmartListVue,
    List: ListVue,
    Tag: TagVue,
  },
  computed: {
    viewComp() {
      if (this.isSmart) return 'SmartList'
      if (this.viewType === 'list') return 'List'
      if (this.viewType === 'tag') return 'Tag'
    },
  },
}

</script>
