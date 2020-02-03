
const computed = [
  'icon', 'showEmptyHeadings', 'updateHeadingIds', 'headingEditOptions', 'savedSchedule', 'headerOptions', 'getViewNotes', 'getPieProgress', 'headings', 'headingsOrder', 'showAllHeadingsItems', 'rootFallbackItem', 'mainFilter', 'rootFilter', 'tasksOrder', 'onSortableAdd', 'viewNameValue', 'mainFallbackItem', 'showHeading', 'itemCompletionCompareDate',
  'headerInfo', 'headingsPagination', 'saveHeaderContent', 'configFilterOptions', 'smartComponent', 'onSmartComponentUpdate', 'viewComponent', 'showHeadadingFloatingButton', 'extraListView', 'removeListHandlerWhenThereArentLists',
  'removeHeaderTag', 'saveHeaderName', 'disableSortableMount',
]

const methods = ['save-schedule',
'add-task', 'add-heading', 'update-ids']

const getComputedProperties = () => {
  const obj = {}
  for (const k of computed)
    obj[k] = function() {
      return this[this.prefix + k]
    }
  
  const toCamel = s => {
    return s.replace(/([-_][a-z])/ig, $1 => {
      return $1.toUpperCase()
        .replace('-', '')
        .replace('_', '')
    })
  }
    
  for (const k of methods) {
    const camel = toCamel(k)
    obj[camel] = function() {
      return this[this.prefix + camel] || function() {}
    }
  }
  return obj
}

export default {
  computed: getComputedProperties(),
}

