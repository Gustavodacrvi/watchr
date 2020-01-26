
const computed = [
  'icon', 'showEmptyHeadings', 'updateHeadingIds', 'headingEditOptions', 'savedSchedule', 'headerOptions', 'getViewNotes', 'getPieProgress', 'headings', 'headingsOrder', 'showAllHeadingsItems', 'rootFallbackItem', 'mainFilter', 'rootFilter', 'tasksOrder', 'onSortableAdd', 'viewNameValue', 'deadline', 'mainFallbackItem', 'showHeading', 'headerTags', 'headerCalendar', 'itemCompletionCompareDate', 'files', 'headingsPagination', 'saveHeaderContent', 'configFilterOptions', 'smartComponent', 'onSmartComponentUpdate', 'viewComponent', 'showHeadadingFloatingButton', 'extraListView', 'removeListHandlerWhenThereArentLists',
  'removeHeaderTag', 'saveHeaderName'
]

const methods = ['save-notes', 'save-schedule',
'add-task', 'add-heading', 'update-ids', 'remove-defer-date',
'remove-deadline', 'remove-repeat']

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

