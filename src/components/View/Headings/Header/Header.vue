
<script>

import Info from './Info.vue'
import HeaderBar from './Bar.vue'
import FilterTags from './FilterTags.vue'

export default {
  functional: true, 
  render(createElement, context) {
    return createElement(
      'div',
      {
        class: {'Header': true},
      },
      [
        createElement(Info, {props: context.props}),
        createElement(HeaderBar, {props: context.props}),
        createElement(FilterTags, {props: context.props}),
      ],
    )
  },
  props: ['viewName', 'viewNameValue', 'options', 'tags', 'lists', 'icon', 'viewType', 'isSmart', 'notes', 'progress', 'exclusiveTags', 'priorities', 'inclusiveTags', 'inclusivePriority', 'exclusivePriorities', 'inclusiveList', 'exclusiveLists', 'inclusiveFolder', 'exclusiveFolders', 'folders', 'optionsHandle', 'headerInfo',
  'saveHeaderName', 'extraIcons'],
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
